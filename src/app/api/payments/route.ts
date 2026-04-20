import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const {
            factura_id,
            cliente_id,
            monto,
            descuento = 0,
            metodo_pago,
            caja_id,
            cuenta_bancaria_id,
            numero_referencia,
            observaciones
        } = body;

        const amountNum = parseFloat(monto || 0);
        const discountNum = parseFloat(descuento || 0);
        const totalApplied = amountNum + discountNum;

        if (totalApplied <= 0) {
            return NextResponse.json({ error: 'El monto total aplicado debe ser mayor a cero' }, { status: 400 });
        }

        let sessionUserId: string | null = null;
        try {
            const cookieStore = await cookies();
            const session = cookieStore.get('session');
            if (session) {
                const sessionData = JSON.parse(session.value);
                sessionUserId = sessionData.userId || null;
            }
        } catch {
            sessionUserId = null;
        }

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Usted no tiene una sesión activa o válida para realizar cobros.' }, { status: 401 });
        }

        await client.query('BEGIN');

        // 1. Validate Invoice and Balance
        const invoiceRes = await client.query(`
            SELECT f.id, f.numero_factura, f.total, f.estado, c.monto_pendiente 
            FROM facturas_clientes f
            JOIN cuentas_por_cobrar c ON c.factura_id = f.id
            WHERE f.id = $1
        `, [factura_id]);

        if (invoiceRes.rows.length === 0) {
            throw new Error('Factura o cuenta por cobrar no encontrada');
        }

        const invoice = invoiceRes.rows[0];
        const pendingBefore = parseFloat(invoice.monto_pendiente);

        if (totalApplied > (pendingBefore + 0.01)) { // Small epsilon
            throw new Error(`El pago (${totalApplied}) excede el monto pendiente (${pendingBefore})`);
        }

        // 2. Validate Caja Session if Cash
        if (metodo_pago === 'efectivo' && caja_id) {
            const sessionRes = await client.query(`
                SELECT id FROM aperturas_caja a
                WHERE a.caja_id = $1
                AND NOT EXISTS (
                    SELECT 1 FROM cierres_caja c WHERE c.caja_id = a.caja_id AND c.fecha_cierre >= a.fecha_apertura
                )
                LIMIT 1
            `, [caja_id]);

            if (sessionRes.rows.length === 0) {
                throw new Error('La caja seleccionada no tiene una sesión abierta');
            }
        }

        // 3. Generate Sequential Serial Number (PAG-XXXX)
        const lastPagoRes = await client.query("SELECT numero_pago FROM pagos_clientes WHERE numero_pago LIKE 'PAG-%' ORDER BY created_at DESC LIMIT 1");
        let nextNumber = 1;
        if (lastPagoRes.rows.length > 0) {
            const lastNumStr = lastPagoRes.rows[0].numero_pago.split('-')[1];
            nextNumber = parseInt(lastNumStr) + 1;
        }
        const numeroPago = `PAG-${String(nextNumber).padStart(4, '0')}`;

        // 4. Create Payment Record
        const paymentId = uuidv4();
        await client.query(
            `INSERT INTO pagos_clientes (
                id, factura_id, cliente_id, numero_pago, fecha_pago, monto, descuento,
                metodo_pago, numero_referencia, cuenta_bancaria_id, caja_id,
                estado, observaciones, recibido_por, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
            [
                paymentId, factura_id, cliente_id, numeroPago, amountNum, discountNum,
                metodo_pago, numero_referencia || '', cuenta_bancaria_id || null, caja_id || null,
                'confirmado', observaciones || '', sessionUserId
            ]
        );

        // 5. Update Outstanding Balance and Invoice Status
        const newPending = Math.max(pendingBefore - totalApplied, 0);
        const isFullyPaid = newPending < 0.01;
        const newStatus = isFullyPaid ? 'pagada' : 'pago parcial';

        await client.query(
            'UPDATE cuentas_por_cobrar SET monto_pendiente = $1, estado = $2, updated_at = NOW() WHERE factura_id = $3',
            [newPending, isFullyPaid ? 'pagado' : 'parcial', factura_id]
        );

        await client.query(
            'UPDATE facturas_clientes SET estado = $1, descuento = descuento + $2, updated_at = NOW() WHERE id = $3',
            [newStatus, discountNum, factura_id]
        );

        // 6. Accounting Movement
        if (amountNum > 0) {
            // Find a suitable income category
            const categoryRes = await client.query(`
                SELECT id FROM categorias_cuentas 
                WHERE (nombre ILIKE '%ingreso%' OR nombre ILIKE '%venta%' OR nombre ILIKE '%servicio%')
                AND tipo = 'ingreso'
                LIMIT 1
            `);
            const categoryId = categoryRes.rows[0]?.id;

            if (categoryId) {
                await client.query(`
                    INSERT INTO movimientos_contables (
                        id, tipo, monto, categoria_id, metodo, caja_id, cuenta_bancaria_id,
                        descripcion, fecha, usuario_id, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, NOW(), NOW())
                `, [
                    uuidv4(), 'ingreso', amountNum, categoryId, metodo_pago, 
                    caja_id || null, cuenta_bancaria_id || null,
                    `Ingreso por pago ${numeroPago} - Factura ${invoice.numero_factura}`,
                    sessionUserId
                ]);
            }

            // Update Caja Actual Balance if Cash
            if (metodo_pago === 'efectivo' && caja_id) {
                await client.query('UPDATE cajas SET saldo_actual = saldo_actual + $1 WHERE id = $2', [amountNum, caja_id]);
            }
        }

        // 7. Subscription Automation (If fully paid)
        if (isFullyPaid) {
            // Find services in this invoice
            const servicesRes = await client.query('SELECT servicio_id FROM detalle_facturas WHERE factura_id = $1 AND servicio_id IS NOT NULL', [factura_id]);
            
            for (const row of servicesRes.rows) {
                // Find active subscription for this client and service
                const subRes = await client.query(`
                    SELECT id, fecha_proximo_pago 
                    FROM suscripciones 
                    WHERE cliente_id = $1 AND servicio_id = $2 AND estado = 'activo'
                    LIMIT 1
                `, [cliente_id, row.servicio_id]);

                if (subRes.rows.length > 0) {
                    const sub = subRes.rows[0];
                    // Advance next payment date by 1 month (simple implementation)
                    await client.query(`
                        UPDATE suscripciones 
                        SET fecha_proximo_pago = (COALESCE(fecha_proximo_pago, NOW()) + interval '1 month'),
                            updated_at = NOW()
                        WHERE id = $1
                    `, [sub.id]);
                }
            }
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true, payment_id: paymentId, numero_pago: numeroPago, nuovo_estado: newStatus });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const factura_id = searchParams.get('factura_id');
        const cliente_id = searchParams.get('cliente_id');

        const baseSelect = `
            SELECT
                p.*,
                u.username AS cobrador_username,
                u.nombre AS cobrador_nombre,
                u.apellido AS cobrador_apellido,
                NULLIF(TRIM(COALESCE(u.nombre, '') || ' ' || COALESCE(u.apellido, '')), '') AS cobrador_nombre_completo
            FROM pagos_clientes p
            LEFT JOIN usuarios u ON p.recibido_por = u.id
        `;

        let res;
        if (factura_id) {
            res = await query(`${baseSelect} WHERE p.factura_id = $1 ORDER BY p.created_at DESC`, [factura_id]);
        } else if (cliente_id) {
            res = await query(`${baseSelect} WHERE p.cliente_id = $1 ORDER BY p.created_at DESC`, [cliente_id]);
        } else {
            res = await query(`${baseSelect} ORDER BY p.created_at DESC LIMIT 50`);
        }

        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
