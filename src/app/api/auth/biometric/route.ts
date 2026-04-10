import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    return NextResponse.json({ error: 'Autenticación biométrica no implementada de forma segura. Utilice inicio de sesión con contraseña.' }, { status: 501 });
}
