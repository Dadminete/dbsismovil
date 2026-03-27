import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // For biometric login, we authenticate the first active admin user
        // In a real app, you'd store the user ID in secure credential storage
        const result = await query(
            `SELECT 
                u.id,
                u.nombre,
                u.email,
                (
                    SELECT r.nombre_rol
                    FROM usuarios_roles ur
                    JOIN roles r ON r.id = ur.rol_id
                    WHERE ur.usuario_id = u.id
                        AND ur.activo = true
                        AND r.activo = true
                    ORDER BY r.prioridad DESC, ur.fecha_asignacion DESC
                    LIMIT 1
                ) as rol,
                (
                    EXISTS (
                        SELECT 1
                        FROM usuarios_roles ur
                        JOIN roles r ON r.id = ur.rol_id
                        WHERE ur.usuario_id = u.id
                            AND ur.activo = true
                            AND r.activo = true
                            AND lower(r.nombre_rol) LIKE '%tecnico%'
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM usuarios_permisos up
                        JOIN permisos p ON p.id = up.permiso_id
                        WHERE up.usuario_id = u.id
                            AND up.activo = true
                            AND p.activo = true
                            AND lower(p.nombre_permiso) LIKE '%tecnico%'
                    )
                ) as is_tecnico
            FROM usuarios u
            WHERE u.activo = true
            LIMIT 1`
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'No hay usuarios disponibles' }, { status: 401 });
        }

        const user = result.rows[0];

        // Create session
        const sessionData = {
            userId: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol || null,
            isTecnico: Boolean(user.is_tecnico),
            loginAt: new Date().toISOString(),
            biometric: true,
        };

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol || null, isTecnico: Boolean(user.is_tecnico) },
        });
    } catch (error) {
        console.error('Biometric login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
