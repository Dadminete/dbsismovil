import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            factura_id,
            cliente_id,
            monto,
            metodo_pago,
            caja_id,
            cuenta_bancaria_id,
            numero_referencia,
            observaciones
        } = body;

        // 1. Get current invoice balance
        const invoiceRes = await query('SELECT total, estado FROM facturas_clientes WHERE id = $1', [factura_id]);
        if (invoiceRes.rows.length === 0) {
            return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
        }
        const invoice = invoiceRes.rows[0];
        const invoiceTotal = parseFloat(invoice.total);

        // 2. Calculate paid amount so far
        const paymentsRes = await query('SELECT SUM(monto) as total_paid FROM pagos_clientes WHERE factura_id = $1 AND estado = \'confirmado\'', [factura_id]);
        const totalPaidBefore = parseFloat(paymentsRes.rows[0].total_paid || '0');
        const newTotalPaid = totalPaidBefore + parseFloat(monto);

        // 3. Determine new status
        let newStatus = 'parcial';
        if (newTotalPaid >= invoiceTotal) {
            newStatus = 'pagada';
        }

        // 4. Create Payment Record
        const paymentId = uuidv4();
        const numeroPago = `PAG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await query(
            `INSERT INTO pagos_clientes (
        id, factura_id, cliente_id, numero_pago, fecha_pago, monto, 
        metodo_pago, caja_id, cuenta_bancaria_id, numero_referencia, 
        estado, observaciones, moneda, descuento, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
            [
                paymentId, factura_id, cliente_id, numeroPago, monto,
                metodo_pago, caja_id || null, cuenta_bancaria_id || null, numero_referencia || '',
                'confirmado', observaciones || '', 'DOP', 0
            ]
        );

        // 5. Update Invoice Status
        await query(
            'UPDATE facturas_clientes SET estado = $1, updated_at = NOW() WHERE id = $2',
            [newStatus, factura_id]
        );

        // 6. Update Caja balance if applicable
        if (metodo_pago === 'efectivo' && caja_id) {
            await query('UPDATE cajas SET saldo_actual = saldo_actual + $1 WHERE id = $2', [monto, caja_id]);
        }

        return NextResponse.json({ success: true, payment_id: paymentId, nuovo_estado: newStatus });
    } catch (error) {
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
