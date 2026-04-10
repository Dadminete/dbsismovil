import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionData } from '@/lib/auth-helpers';

export async function GET() {
    try {
        const sessionData = await getSessionData();

        if (!sessionData || !sessionData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: sessionData.userId },
            include: {
                usuariosRoles: {
                    where: { activo: true },
                    include: { rol: true },
                    orderBy: [
                        { rol: { prioridad: 'desc' } },
                        { fechaAsignacion: 'desc' }
                    ]
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const roleName = user.usuariosRoles[0]?.rol?.nombreRol || sessionData.rol || 'Sin rol';

        return NextResponse.json({
            nombre: user.nombre,
            rol: roleName,
            avatar: user.avatar ?? null,
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
