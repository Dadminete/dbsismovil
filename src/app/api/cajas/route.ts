import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const res = await query(`
      SELECT id, nombre, tipo, saldo_actual 
      FROM cajas 
      WHERE activa = true
      ORDER BY nombre ASC
    `);

        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching cajas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
