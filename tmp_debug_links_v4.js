const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Bank Accounts and their Accounting IDs ---');
        const res = await client.query(`
            SELECT 
                cb.id as bank_acc_id, 
                COALESCE(b.nombre, 'Sin Banco') as banco, 
                cb.numero_cuenta,
                cb.cuenta_contable_id
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            WHERE cb.activo = true
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('\n--- Duplicate Accounting ID Check ---');
        const res2 = await client.query(`
            SELECT cuenta_contable_id, COUNT(*) 
            FROM cuentas_bancarias 
            WHERE activo = true 
            GROUP BY cuenta_contable_id 
            HAVING COUNT(*) > 1
        `);
        console.log(JSON.stringify(res2.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
