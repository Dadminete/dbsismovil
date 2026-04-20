import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();
    try {
        const { id } = await params;
        const body = await request.json();
        const { estado, total, observaciones } = body;

        await client.query('BEGIN');

        if (estado === "cancelada" || estado === "anulada") {
            const pagosRes = await client.query(
                "SELECT id, monto, metodo_pago, caja_id FROM pagos_clientes WHERE factura_id = $1",
                [id]
            );
            
            for (const pago of pagosRes.rows) {
                if (pago.metodo_pago === 'efectivo' && pago.caja_id) {
                    await client.query(
                        "UPDATE cajas SET saldo_actual = saldo_actual - $1 WHERE id = $2",
                        [pago.monto, pago.caja_id]
                    );
                }
                
                await client.query(
                    "DELETE FROM movimientos_contables WHERE descripcion ILIKE $1",
                    [`%${pago.numero_pago}%`]
                );
            }

            await client.query(
                "DELETE FROM pagos_clientes WHERE factura_id = $1",
                [id]
            );
        }

        const res = await client.query(
            `UPDATE facturas_clientes 
             SET estado = $1, total = $2, observaciones = $3, updated_at = NOW() 
             WHERE id = $4 
             RETURNING *`,
            [estado, total, observaciones, id]
        );

        if (res.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
        }

        await client.query('COMMIT');
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
