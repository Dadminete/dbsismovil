import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createSessionJWT } from '@/lib/auth-helpers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        // Query user by username using Prisma
        const user = await prisma.usuario.findUnique({
            where: { username },
            include: {
                usuariosRoles: {
                    where: { activo: true },
                    include: { rol: true },
                    orderBy: [
                        { rol: { prioridad: 'desc' } },
                        { fechaAsignacion: 'desc' }
                    ]
                },
                usuariosPermisos: {
                    where: { activo: true },
                    include: { permiso: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Check if user is active
        if (!user.activo) {
            return NextResponse.json({ error: 'Usuario desactivado' }, { status: 401 });
        }

        // Determine main role name
        const roleName = user.usuariosRoles[0]?.rol?.nombreRol || null;

        // Check if user is "tecnico" based on role or explicit permission
        const normalizeAndMatch = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('tecnico');
        const hasTecnicoRole = user.usuariosRoles.some(ur => ur.rol.activo && normalizeAndMatch(ur.rol.nombreRol));
        const hasTecnicoPerm = user.usuariosPermisos.some(up => up.permiso.activo && normalizeAndMatch(up.permiso.nombrePermiso));
        const isTecnico = hasTecnicoRole || hasTecnicoPerm;

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Create session
        const sessionData = {
            userId: user.id,
            nombre: user.nombre,
            email: user.email || '',
            rol: roleName,
            isTecnico,
            loginAt: new Date().toISOString(),
        };

        // Generate signed JWT
        const jwtToken = await createSessionJWT(sessionData);

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, nombre: user.nombre, email: user.email, rol: roleName, isTecnico },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
