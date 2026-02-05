import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        c.id, 
        c.nombre, 
        c.apellidos, 
        c.telefono, 
        c.email,
        c.codigo_cliente,
        EXISTS (
          SELECT 1 FROM facturas_clientes f 
          WHERE f.cliente_id = c.id AND f.estado IN ('pendiente', 'parcial')
        ) as has_pending
      FROM clientes c
      WHERE LOWER(c.estado) = 'activo'
        AND EXISTS (SELECT 1 FROM suscripciones s WHERE s.cliente_id = c.id AND s.estado = 'activo')
      ORDER BY c.nombre ASC
    `);

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
