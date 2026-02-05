import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Active Clients (based on active subscriptions AND client status = 'activo')
    const activeClientsRes = await query(`
      SELECT COUNT(DISTINCT s.cliente_id) as count 
      FROM suscripciones s
      JOIN clientes c ON s.cliente_id = c.id
      WHERE s.estado = 'activo' AND LOWER(c.estado) = 'activo'
    `);

    // 2. Pending Invoices
    const pendingInvoicesRes = await query(`
      SELECT COUNT(*) as count, SUM(total) as total 
      FROM facturas_clientes 
      WHERE estado IN ('pendiente', 'parcial')
    `);

    // 3. Monthly Income (Pagos Clientes)
    const incomeRes = await query(`
      SELECT SUM(monto) as total 
      FROM pagos_clientes 
      WHERE created_at >= date_trunc('month', current_date)
    `);

    // 4. Monthly Expenses (Pagos Cuentas por Pagar)
    const expensesRes = await query(`
      SELECT SUM(monto) as total 
      FROM pagos_cuentas_por_pagar 
      WHERE created_at >= date_trunc('month', current_date)
    `);

    // 5. Recent Activity (Last 2 payments)
    const recentActivityRes = await query(`
      SELECT p.monto, p.metodo_pago, p.created_at, c.nombre, c.apellidos
      FROM pagos_clientes p
      JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 2
    `);

    return NextResponse.json({
      activeClients: parseInt(activeClientsRes.rows[0].count),
      pendingInvoices: {
        count: parseInt(pendingInvoicesRes.rows[0].count || '0'),
        total: parseFloat(pendingInvoicesRes.rows[0].total || '0')
      },
      monthlyIncome: parseFloat(incomeRes.rows[0].total || '0'),
      monthlyExpenses: parseFloat(expensesRes.rows[0].total || '0'),
      recentActivity: recentActivityRes.rows
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
