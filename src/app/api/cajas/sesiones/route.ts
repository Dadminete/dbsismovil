import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cajaId = searchParams.get('cajaId');
        
        let usuarioId = searchParams.get('usuarioId');
        if (!usuarioId) {
            try {
                const cookieStore = await cookies();
                const session = cookieStore.get('session');
                if (session) {
                    const sessionData = JSON.parse(session.value);
                    usuarioId = sessionData.userId || null;
                }
            } catch (e) {
                console.error("Error reading session cookie:", e);
            }
        }

        if (!cajaId) {
            return NextResponse.json({ error: 'Falta cajaId' }, { status: 400 });
        }

        let queryStr = `
            SELECT a.id, a.caja_id, a.monto_inicial, a.fecha_apertura, a.usuario_id
            FROM aperturas_caja a
            WHERE a.caja_id = $1
            AND NOT EXISTS (
                SELECT 1 FROM cierres_caja c 
                WHERE c.caja_id = a.caja_id 
                AND c.fecha_cierre >= a.fecha_apertura
            )
        `;
        let queryParams: any[] = [cajaId];

        if (usuarioId) {
            queryStr += ` AND a.usuario_id = $2`;
            queryParams.push(usuarioId);
        }

        queryStr += ` ORDER BY a.fecha_apertura DESC LIMIT 1`;

        const res = await query(queryStr, queryParams);

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
