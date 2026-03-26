const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Final Bank Account Verification ---');
        const queryText = 'SELECT cb.id, COALESCE(b.nombre, \'Sin Banco\') as banco, cb.numero_cuenta, cb.saldo_actual FROM cuentas_bancarias cb LEFT JOIN banks b ON cb.bank_id = b.id WHERE cb.activo = true ORDER BY b.nombre ASC';
        
        const res = await client.query(queryText);
        console.log('Unique rows found:', res.rows.length);
        res.rows.forEach(r => {
            console.log('ID: ' + r.id + ' | Bank: ' + r.banco + ' | Acc: ' + r.numero_cuenta + ' | Balance: ' + r.saldo_actual);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
