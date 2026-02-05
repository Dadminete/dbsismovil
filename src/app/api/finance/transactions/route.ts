import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            tipo,
            monto,
            categoria_id,
            metodo,
            caja_id,
            bank_id,
            cuenta_bancaria_id,
            descripcion,
            fecha,
            usuario_id
        } = body;

        // 1. Insert into movimientos_contables
        const result = await query(
            `INSERT INTO movimientos_contables (
                tipo, monto, categoria_id, metodo, caja_id, bank_id, cuenta_bancaria_id, descripcion, fecha, usuario_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                tipo,
                monto,
                categoria_id,
                metodo,
                caja_id || null,
                bank_id || null,
                cuenta_bancaria_id || null,
                descripcion,
                fecha || new Date(),
                usuario_id || null // In a real app, this would be the logged-in user
            ]
        );

        // 2. Update balances (simplistic for now, in a real app use triggers or more complex logic)
        if (metodo === 'efectivo' && caja_id) {
            const multiplier = tipo === 'ingreso' ? 1 : -1;
            await query(
                'UPDATE cajas SET saldo_actual = saldo_actual + ($1 * $2), updated_at = NOW() WHERE id = $3',
                [monto, multiplier, caja_id]
            );
        } else if (metodo === 'transferencia' && cuenta_bancaria_id) {
            const multiplier = tipo === 'ingreso' ? 1 : -1;
            await query(
                'UPDATE cuentas_bancarias SET updated_at = NOW() WHERE id = $1',
                [cuenta_bancaria_id]
            );
            // Saldo is usually in cuentas_contables or similar. 
            // The user didn't specify updating balances but it's good practice.
            // For now, we just log the movement as requested.
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
