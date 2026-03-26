const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Bank Accounts Debug ---');
        const res = await client.query(`
            SELECT cb.id, cb.numero_cuenta, cb.nombre_oficial_cuenta, b.nombre as banco
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            WHERE cb.activo = true
        `);
        console.log('Bank Accounts in DB:', JSON.stringify(res.rows, null, 2));

        const res2 = await client.query(`
            SELECT cc.id, cc.nombre, cc.saldo_actual 
            FROM cuentas_contables cc
            WHERE cc.id IN (SELECT cuenta_contable_id FROM cuentas_bancarias WHERE activo = true)
        `);
        console.log('Matching Accounting Balances:', JSON.stringify(res2.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
