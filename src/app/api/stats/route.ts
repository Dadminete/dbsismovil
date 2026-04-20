import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Fetching dashboard stats...');

    // 1. Active Clients (based on active subscriptions AND client status = 'activo')
    console.log('Querying active clients...');
    const activeClientsRes = await query(`
      SELECT COUNT(DISTINCT s.cliente_id) as count 
      FROM suscripciones s
      JOIN clientes c ON s.cliente_id = c.id
      WHERE s.estado = 'activo' AND LOWER(c.estado) = 'activo'
    `);

    const pendingInvoicesRes = await query(`
      SELECT COUNT(*) as count, SUM(total) as total 
      FROM facturas_clientes 
      WHERE estado IN ('pendiente', 'parcial')
    `);

    const incomeRes = await query(`
      SELECT SUM(monto) as total 
      FROM movimientos_contables 
      WHERE tipo = 'ingreso' AND fecha >= date_trunc('month', current_date)
    `);

    const expensesRes = await query(`
      SELECT SUM(monto) as total 
      FROM movimientos_contables 
      WHERE tipo = 'gasto' AND fecha >= date_trunc('month', current_date)
    `);

    // Papelería Today's Income and Current Balance
    const papeleriaRes = await query(`
      SELECT 
        (SELECT SUM(total) FROM ventas_papeleria WHERE caja_id = (SELECT id FROM cajas WHERE nombre = 'Papelería') AND created_at >= current_date) as today_income,
        (SELECT saldo_actual FROM cajas WHERE nombre = 'Papelería') as balance
    `);

    // Caja Principal Today's Income and Current Balance
    const principalRes = await query(`
      SELECT 
        (SELECT SUM(monto) FROM pagos_clientes WHERE caja_id = (SELECT id FROM cajas WHERE nombre = 'Caja Principal') AND created_at >= current_date) as today_income,
        (SELECT saldo_actual FROM cajas WHERE nombre = 'Caja Principal') as balance
    `);

    const recentActivityRes = await query(`
      SELECT p.monto, p.metodo_pago, p.created_at, c.nombre, c.apellidos
      FROM pagos_clientes p
      JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 2
    `);

    const result = {
      activeClients: parseInt(activeClientsRes.rows[0].count),
      pendingInvoices: {
        count: parseInt(pendingInvoicesRes.rows[0].count || '0'),
        total: parseFloat(pendingInvoicesRes.rows[0].total || '0')
      },
      monthlyIncome: parseFloat(incomeRes.rows[0].total || '0'),
      monthlyExpenses: parseFloat(expensesRes.rows[0].total || '0'),
      recentActivity: recentActivityRes.rows,
      papeleria: {
        todayIncome: parseFloat(papeleriaRes.rows[0].today_income || '0'),
        balance: parseFloat(papeleriaRes.rows[0].balance || '0')
      },
      principal: {
        todayIncome: parseFloat(principalRes.rows[0].today_income || '0'),
        balance: parseFloat(principalRes.rows[0].balance || '0')
      }
    };

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });


  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
