import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Use the start of the current day in local time or UTC as needed
        // For simplicity, we'll use CURRENT_DATE in PostgreSQL which uses the DB's timezone
        const [dailyIncome, dailyExpense, cajas, accounts, recentMovements] = await Promise.all([
            query("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_contables WHERE tipo = 'ingreso' AND DATE(fecha) = CURRENT_DATE"),
            query("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_contables WHERE tipo = 'gasto' AND DATE(fecha) = CURRENT_DATE"),
            query("SELECT id, nombre, saldo_actual FROM cajas WHERE activa = true"),
            query("SELECT cb.id, cb.numero_cuenta, cb.nombre_oficial_cuenta, b.nombre as banco_nombre FROM cuentas_bancarias cb JOIN banks b ON cb.bank_id = b.id WHERE cb.activo = true"),
            query(`
                SELECT m.*, c.nombre as categoria_nombre 
                FROM movimientos_contables m 
                LEFT JOIN categorias_cuentas c ON m.categoria_id = c.id 
                ORDER BY m.fecha DESC LIMIT 20
            `)
        ]);

        return NextResponse.json({
            today: {
                income: dailyIncome.rows[0].total,
                expense: dailyExpense.rows[0].total,
                net: dailyIncome.rows[0].total - dailyExpense.rows[0].total
            },
            cajas: cajas.rows,
            accounts: accounts.rows,
            recent: recentMovements.rows
        });
    } catch (error) {
        console.error('Error fetching daily summary:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
