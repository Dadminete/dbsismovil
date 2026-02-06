
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: connectionString,
});

async function checkCajaFuerte() {
    try {
        // 1. Get Caja Fuerte ID and current balance
        const cajaRes = await pool.query("SELECT id, nombre, saldo_inicial, saldo_actual FROM cajas WHERE nombre ILIKE '%caja fuerte%'");

        if (cajaRes.rows.length === 0) {
            console.log("No found 'Caja Fuerte'");
            return;
        }

        const caja = cajaRes.rows[0];
        console.log("Caja Found:", caja);

        // 2. Calculate balance from movements
        // Income (ingreso) adds, Expense (gasto) subtracts
        const movsRes = await pool.query(`
        SELECT 
            SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
            SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos
        FROM movimientos_contables 
        WHERE caja_id = $1
    `, [caja.id]);

        const { total_ingresos, total_gastos } = movsRes.rows[0];

        const saldoInicial = parseFloat(caja.saldo_inicial);
        const ingresos = parseFloat(total_ingresos || 0);
        const gastos = parseFloat(total_gastos || 0);
        const calculatedBalance = saldoInicial + ingresos - gastos;

        console.log({
            saldoInicial,
            ingresos,
            gastos,
            calculatedBalance,
            currentDbBalance: parseFloat(caja.saldo_actual)
        });

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await pool.end();
    }
}

checkCajaFuerte();
