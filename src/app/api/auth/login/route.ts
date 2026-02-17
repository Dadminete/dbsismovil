import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        // Query user by username
        const result = await query(
            'SELECT id, nombre, username, email, password_hash, activo, token_version FROM usuarios WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.activo) {
            return NextResponse.json({ error: 'Usuario desactivado' }, { status: 401 });
        }

        // Support both hashed and plaintext (fallback) passwords
        let isPasswordValid = false;

        if (user.password_hash.startsWith('$2b$')) {
            // It's a BCrypt hash
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            // Fallback for legacy plaintext passwords
            isPasswordValid = user.password_hash === password;
        }

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Create session
        const sessionData = {
            userId: user.id,
            nombre: user.nombre,
            email: user.email,
            token_version: user.token_version || 1,
            loginAt: new Date().toISOString(),
        };

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, nombre: user.nombre, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
