import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let estado = (searchParams.get('estado') || 'todos').toLowerCase();
    
    // Whitelist validation
    if (!['pagado', 'pendiente', 'todos'].includes(estado)) {
      estado = 'todos';
    }

    let additionalWhereClause = '';
    let orderByClause = 'c.nombre ASC, c.apellidos ASC';

    if (estado === 'pagado') {
      additionalWhereClause = `
        AND EXISTS (
          SELECT 1
          FROM facturas_clientes f
          WHERE f.cliente_id = c.id
            AND LOWER(f.estado) IN ('pagado', 'pagada')
        )`;
      orderByClause = 'last_paid_invoice_date DESC NULLS LAST, c.nombre ASC, c.apellidos ASC';
    }

    if (estado === 'pendiente') {
      additionalWhereClause = `
        AND EXISTS (
          SELECT 1
          FROM facturas_clientes f
          WHERE f.cliente_id = c.id
            AND f.estado IN ('pendiente', 'parcial')
        )`;
    }

    const res = await query(`
      SELECT 
        c.id, 
        c.nombre, 
        c.apellidos, 
        c.telefono, 
        c.email,
        c.codigo_cliente,
        c.foto_url,
        EXISTS (
          SELECT 1 FROM facturas_clientes f 
          WHERE f.cliente_id = c.id AND f.estado IN ('pendiente', 'parcial')
        ) as has_pending,
        EXISTS (
          SELECT 1 FROM facturas_clientes f
          WHERE f.cliente_id = c.id AND LOWER(f.estado) IN ('pagado', 'pagada')
        ) as has_paid_invoice,
        (
          SELECT MAX(f.updated_at)
          FROM facturas_clientes f
          WHERE f.cliente_id = c.id
            AND LOWER(f.estado) IN ('pagado', 'pagada')
        ) as last_paid_invoice_date
      FROM clientes c
      WHERE LOWER(c.estado) = 'activo'
        AND EXISTS (SELECT 1 FROM suscripciones s WHERE s.cliente_id = c.id AND s.estado = 'activo')
        ${additionalWhereClause}
      ORDER BY ${orderByClause}
    `);

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
