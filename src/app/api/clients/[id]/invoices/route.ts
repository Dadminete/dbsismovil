import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await query(
            `SELECT
                f.*,
                CASE
                    WHEN COALESCE(p.total_pagado, 0) > 0 THEN GREATEST(
                        f.total - COALESCE(p.total_pagado, 0),
                        0
                    )
                    ELSE COALESCE(cpc.monto_pendiente, f.total)
                END AS monto_pendiente,
                COALESCE(p.total_pagado, 0) AS total_pagado
             FROM facturas_clientes f
             LEFT JOIN cuentas_por_cobrar cpc ON cpc.factura_id = f.id
             LEFT JOIN (
                SELECT
                    factura_id,
                    SUM(COALESCE(monto, 0) + COALESCE(descuento, 0)) AS total_pagado
                FROM pagos_clientes
                WHERE estado = 'confirmado'
                GROUP BY factura_id
             ) p ON p.factura_id = f.id
             WHERE f.cliente_id = $1
               AND LOWER(f.estado) IN ('pendiente', 'parcial', 'pago parcial', 'adelantado', 'pagado', 'pagada')
             ORDER BY f.updated_at DESC NULLS LAST`,
            [id]
        );
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
