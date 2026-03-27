import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session) {
            return NextResponse.json({ error: 'No session' }, { status: 401 });
        }

        const sessionData = JSON.parse(session.value);
        const userId = sessionData.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const res = await query(
            `SELECT
                u.nombre,
                u.avatar,
                (
                    SELECT r.nombre_rol
                    FROM usuarios_roles ur
                    JOIN roles r ON r.id = ur.rol_id
                    WHERE ur.usuario_id = u.id
                      AND ur.activo = true
                      AND r.activo = true
                    ORDER BY r.prioridad DESC, ur.fecha_asignacion DESC
                    LIMIT 1
                ) AS rol
             FROM usuarios u
             WHERE u.id = $1`,
            [userId]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = res.rows[0];

        return NextResponse.json({
            nombre: user.nombre,
            rol: user.rol ?? sessionData.rol ?? 'Sin rol',
            avatar: user.avatar ?? null,
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
