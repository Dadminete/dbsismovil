import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const res = await query(`
      SELECT b.id, b.nombre, b.codigo,
        (SELECT json_agg(c) FROM (
          SELECT id, numero_cuenta, tipo_cuenta, moneda, nombre_oficial_cuenta 
          FROM cuentas_bancarias 
          WHERE bank_id = b.id AND activo = true
        ) c) as accounts
      FROM banks b
      WHERE b.activo = true
      ORDER BY b.nombre ASC
    `);

        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching banks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
