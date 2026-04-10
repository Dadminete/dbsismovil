import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only-change-me';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionData {
    userId: string;
    nombre: string;
    email: string;
    rol: string | null;
    isTecnico: boolean;
    token_version?: number;
    loginAt?: string;
    [key: string]: any;
}

export async function createSessionJWT(payload: SessionData): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedSecret);
}

export async function verifySessionJWT(token: string): Promise<SessionData | null> {
    try {
        const { payload } = await jwtVerify(token, encodedSecret);
        return payload as SessionData;
    } catch (error) {
        console.error('JWT Verification error:', error);
        return null;
    }
}

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
        const sessionData = await getSessionData();
        return sessionData?.userId || null;
    } catch (error) {
        console.error('Error extracting session user ID:', error);
    }
    return null;
}

export async function getSessionData(): Promise<SessionData | null> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (session) {
            return await verifySessionJWT(session.value);
        }
    } catch (error) {
        console.error('Error parsing session data:', error);
    }
    return null;
}
