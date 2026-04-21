import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTecnicoRole } from './lib/auth-helpers';
import { jwtVerify } from 'jose';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/biometric'];

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only-change-me';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

function isTecnicoSession(sessionData: any) {
    return Boolean(sessionData?.isTecnico) || isTecnicoRole(sessionData?.rol);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/logo') ||
        pathname.startsWith('/manifest') ||
        pathname.endsWith('.ico') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.svg')
    ) {
        return NextResponse.next();
    }

    // Check for session cookie
    const session = request.cookies.get('session');

    if (!session) {
        // Redirect to login if no session
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    try {
        let sessionData;
        try {
            // First try to parse as JWT
            const { payload } = await jwtVerify(session.value, encodedSecret);
            sessionData = payload;
        } catch {
            // Fallback for active legacy sessions if needed (optional)
            // or simply redirect to login if verification fails
            console.warn('JWT verification failed, clearing invalid session.');
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            return response;
        }

        if (isTecnicoSession(sessionData)) {
            const isAllowedTecnicoPath =
                pathname.startsWith('/clients') ||
                pathname.startsWith('/settings') ||
                pathname.startsWith('/api/clients') ||
                (pathname.startsWith('/api/invoices') && request.method === 'GET') ||
                (pathname.startsWith('/api/payments') && (request.method === 'GET' || request.method === 'POST')) ||
                (pathname.startsWith('/api/cajas') && request.method === 'GET') ||
                (pathname.startsWith('/api/banks') && request.method === 'GET') ||
                pathname.startsWith('/api/uploads') ||
                pathname.startsWith('/api/auth/logout') ||
                pathname.startsWith('/api/auth/me') ||
                pathname.startsWith('/uploads') ||
                pathname.startsWith('/manifest') ||
                pathname.startsWith('/logo') ||
                pathname.startsWith('/favicon');

            if (pathname === '/') {
                const clientsPaidUrl = new URL('/clients?estado=pagado', request.url);
                return NextResponse.redirect(clientsPaidUrl);
            }

            if (!isAllowedTecnicoPath) {
                const clientsPaidUrl = new URL('/clients?estado=pagado', request.url);
                return NextResponse.redirect(clientsPaidUrl);
            }
        }
    } catch {
        // Ignore malformed session and continue with default behavior.
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
