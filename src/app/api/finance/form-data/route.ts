import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const [cajas, banks, accounts, categories, papeleriaCats] = await Promise.all([
            query('SELECT id, nombre, saldo_actual FROM cajas WHERE activa = true ORDER BY nombre ASC'),
            query('SELECT id, nombre FROM banks WHERE activo = true ORDER BY nombre ASC'),
            query('SELECT id, bank_id, numero_cuenta, nombre_oficial_cuenta FROM cuentas_bancarias WHERE activo = true'),
            query('SELECT id, nombre, tipo, subtipo FROM categorias_cuentas WHERE activa = true ORDER BY nombre ASC'),
            query('SELECT id, nombre FROM categorias_papeleria WHERE activo = true ORDER BY nombre ASC')
        ]);

        return NextResponse.json({
            cajas: cajas.rows,
            banks: banks.rows,
            accounts: accounts.rows,
            categories: categories.rows,
            papeleriaCategories: papeleriaCats.rows
        });
    } catch (error) {
        console.error('Error fetching finance form data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
