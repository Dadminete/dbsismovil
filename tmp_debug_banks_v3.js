const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Bank Accounts List ---');
        const res = await client.query(`
            SELECT 
                cb.id, 
                COALESCE(b.nombre, 'Sin Banco') as banco, 
                cb.numero_cuenta,
                cb.cuenta_contable_id
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            WHERE cb.activo = true
        `);
        console.log('Rows found:', res.rows.length);
        res.rows.forEach(r => {
            console.log('ID: ' + r.id + ' | Bank: ' + r.banco + ' | Acc: ' + r.numero_cuenta + ' | CC_ID: ' + r.cuenta_contable_id);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
