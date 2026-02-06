import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    console.log('Active clients result:', activeClientsRes.rows);

    // 2. Pending Invoices
    console.log('Querying pending invoices...');
    const pendingInvoicesRes = await query(`
      SELECT COUNT(*) as count, SUM(total) as total 
      FROM facturas_clientes 
      WHERE estado IN ('pendiente', 'parcial')
    `);
    console.log('Pending invoices result:', pendingInvoicesRes.rows);

    // 3. Monthly Income (Pagos Clientes)
    console.log('Querying monthly income...');
    const incomeRes = await query(`
      SELECT SUM(monto) as total 
      FROM pagos_clientes 
      WHERE created_at >= date_trunc('month', current_date)
    `);
    console.log('Monthly income result:', incomeRes.rows);

    // 4. Monthly Expenses (Pagos Cuentas por Pagar)
    console.log('Querying monthly expenses...');
    const expensesRes = await query(`
      SELECT SUM(monto) as total 
      FROM pagos_cuentas_por_pagar 
      WHERE created_at >= date_trunc('month', current_date)
    `);
    console.log('Monthly expenses result:', expensesRes.rows);

    // 5. Recent Activity (Last 2 payments)
    console.log('Querying recent activity...');
    const recentActivityRes = await query(`
      SELECT p.monto, p.metodo_pago, p.created_at, c.nombre, c.apellidos
      FROM pagos_clientes p
      JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 2
    `);
    console.log('Recent activity result:', recentActivityRes.rows);

    const result = {
      activeClients: parseInt(activeClientsRes.rows[0].count),
      pendingInvoices: {
        count: parseInt(pendingInvoicesRes.rows[0].count || '0'),
        total: parseFloat(pendingInvoicesRes.rows[0].total || '0')
      },
      monthlyIncome: parseFloat(incomeRes.rows[0].total || '0'),
      monthlyExpenses: parseFloat(expensesRes.rows[0].total || '0'),
      recentActivity: recentActivityRes.rows
    };
    console.log('Final result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
