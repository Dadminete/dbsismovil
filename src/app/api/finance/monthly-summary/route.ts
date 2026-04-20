import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        // 1. Get Monthly Income and Expense for the specified Year
        const monthlyData = await query(`
            WITH months AS (
                SELECT generate_series(1, 12) AS month
            )
            SELECT 
                m.month,
                COALESCE(SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN mc.tipo = 'gasto' THEN mc.monto ELSE 0 END), 0) as expense
            FROM months m
            LEFT JOIN movimientos_contables mc ON EXTRACT(MONTH FROM mc.fecha) = m.month 
                AND EXTRACT(YEAR FROM mc.fecha) = $1
            GROUP BY m.month
            ORDER BY m.month
        `, [year]);

        return new NextResponse(JSON.stringify({
            year,
            monthly: monthlyData.rows.map((r: any) => ({
                month: parseInt(r.month),
                income: parseFloat(r.income),
                expense: parseFloat(r.expense)
            }))
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
        console.error('Error fetching monthly summary:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
