import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { estado, total, observaciones } = body;

        const res = await query(
            `UPDATE facturas_clientes 
       SET estado = $1, total = $2, observaciones = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
            [estado, total, observaciones, id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
        return NextResponse.json(res.rows[0]);
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
