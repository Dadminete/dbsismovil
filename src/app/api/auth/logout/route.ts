import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionData } from '@/lib/auth-helpers';

export async function POST() {
    try {
        const sessionData = await getSessionData();

        if (sessionData && sessionData.userId) {
            // Note: If you want to strictly invalidate server-side, you'd increment token_version here via Prisma,
            // but the `Usuario` model in schema.prisma doesn't currently define `token_version`.
            // For now, securely deleting the JWT cookie effectively logs out the user on this client.
            const cookieStore = await cookies();
            cookieStore.delete('session');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
    }
}
