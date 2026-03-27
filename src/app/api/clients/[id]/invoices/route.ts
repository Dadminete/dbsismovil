import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await query(
            `SELECT *
             FROM facturas_clientes
             WHERE cliente_id = $1
               AND LOWER(estado) IN ('pendiente', 'parcial', 'adelantado', 'pagado', 'pagada')
             ORDER BY updated_at DESC NULLS LAST`,
            [id]
        );
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
