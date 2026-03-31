import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cajaId = searchParams.get('cajaId');

        if (!cajaId) {
            return NextResponse.json({ error: 'Falta cajaId' }, { status: 400 });
        }

        // Logic: Find the latest aperture for this caja that doesn't have a newer closure
        const res = await query(`
            SELECT a.id, a.caja_id, a.monto_inicial, a.fecha_apertura, a.usuario_id
            FROM aperturas_caja a
            WHERE a.caja_id = $1
            AND NOT EXISTS (
                SELECT 1 FROM cierres_caja c 
                WHERE c.caja_id = a.caja_id 
                AND c.fecha_cierre >= a.fecha_apertura
            )
            ORDER BY a.fecha_apertura DESC
            LIMIT 1
        `, [cajaId]);

        if (res.rows.length > 0) {
            return NextResponse.json({ isOpen: true, session: res.rows[0] });
        } else {
            return NextResponse.json({ isOpen: false });
        }
    } catch (error) {
        console.error('Error checking caja session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
