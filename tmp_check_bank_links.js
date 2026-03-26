const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Bank Accounts Details ---');
        const res = await client.query(`
            SELECT 
                cb.id, 
                cb.numero_cuenta, 
                cb.nombre_oficial_cuenta, 
                b.nombre as banco, 
                cb.cuenta_contable_id
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            WHERE cb.activo = true
        `);
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
