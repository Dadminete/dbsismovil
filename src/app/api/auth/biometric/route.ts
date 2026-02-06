import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // For biometric login, we authenticate the first active admin user
        // In a real app, you'd store the user ID in secure credential storage
        const result = await query(
            'SELECT id, nombre, email FROM usuarios WHERE activo = true LIMIT 1'
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
            user: { id: user.id, nombre: user.nombre, email: user.email },
        });
    } catch (error) {
        console.error('Biometric login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
