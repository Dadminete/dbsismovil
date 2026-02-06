import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (session) {
            const sessionData = JSON.parse(session.value);
            // Increment token_version to invalidate all other sessions
            await query('UPDATE usuarios SET token_version = COALESCE(token_version, 1) + 1 WHERE id = $1', [sessionData.userId]);
            cookieStore.delete('session');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
    }
}
