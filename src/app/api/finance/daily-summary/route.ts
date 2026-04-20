import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // Use the start of the current day in local time or UTC as needed
        // For simplicity, we'll use CURRENT_DATE in PostgreSQL which uses the DB's timezone
        const [dailyIncome, dailyExpense, cajas, accounts, recentMovements] = await Promise.all([
            query("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_contables WHERE tipo = 'ingreso' AND DATE(fecha) = CURRENT_DATE"),
            query("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos_contables WHERE tipo = 'gasto' AND DATE(fecha) = CURRENT_DATE"),
            query("SELECT id, nombre, saldo_actual FROM cajas WHERE activa = true"),
            query(`
                SELECT 
                    cb.id, cb.numero_cuenta, cb.nombre_oficial_cuenta, cb.tipo_cuenta, cb.moneda,
                    COALESCE(b.nombre, 'Sin Banco') as banco_nombre,
                    COALESCE((
                        SELECT SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END)
                        FROM movimientos_contables
                        WHERE cuenta_bancaria_id = cb.id
                    ), 0) as saldo_actual
                FROM cuentas_bancarias cb
                LEFT JOIN banks b ON cb.bank_id = b.id
                WHERE cb.activo = true
                ORDER BY b.nombre ASC
            `),
            query(`
                SELECT m.*, c.nombre as categoria_nombre 
                FROM movimientos_contables m 
                LEFT JOIN categorias_cuentas c ON m.categoria_id = c.id 
                ORDER BY m.fecha DESC LIMIT 20
            `)
        ]);

        return new NextResponse(JSON.stringify({
            today: {
                income: dailyIncome.rows[0].total,
                expense: dailyExpense.rows[0].total,
                net: dailyIncome.rows[0].total - dailyExpense.rows[0].total
            },
            cajas: cajas.rows,
            accounts: accounts.rows,
            recent: recentMovements.rows
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Error fetching daily summary:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
