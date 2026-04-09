import { cookies } from 'next/headers';

export function normalizeRole(role: string): string {
    return String(role || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function isTecnicoRole(role?: string | null): boolean {
    if (!role) return false;
    return normalizeRole(role).includes('tecnico');
}

export async function extractSessionUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (session) {
            const sessionData = JSON.parse(session.value);
            return sessionData.userId || null;
        }
    } catch (error) {
        console.error('Error extracting session user ID:', error);
    }
    return null;
}

export interface SessionData {
    userId: string;
    nombre: string;
    email: string;
    rol: string | null;
    isTecnico: boolean;
}

export async function getSessionData(): Promise<SessionData | null> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (session) {
            return JSON.parse(session.value) as SessionData;
        }
    } catch (error) {
        console.error('Error parsing session data:', error);
    }
    return null;
}
