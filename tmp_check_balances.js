const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Cajas ---');
        const cajas = await client.query("SELECT id, nombre, saldo_actual FROM cajas WHERE activa = true");
        console.log(JSON.stringify(cajas.rows, null, 2));

        console.log('\n--- Cuentas Bancarias y sus Saldos Contables ---');
        const accounts = await client.query(`
            SELECT cb.nombre_oficial_cuenta, b.nombre as banco, cc.saldo_actual
            FROM cuentas_bancarias cb 
            JOIN banks b ON cb.bank_id = b.id
            LEFT JOIN cuentas_contables cc ON cb.cuenta_contable_id = cc.id
            WHERE cb.activo = true
        `);
        console.log(JSON.stringify(accounts.rows, null, 2));

        console.log('\n--- Verificación via Movimientos (Accounting Sum) ---');
        const movementSum = await client.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END), 0) as total_accounting
            FROM movimientos_contables
        `);
        console.log('Total Accounting Sum:', movementSum.rows[0].total_accounting);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
