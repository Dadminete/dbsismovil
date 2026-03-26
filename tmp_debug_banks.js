const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Full Bank Accounts Response ---');
        const res = await client.query(`
            SELECT cb.id, cb.numero_cuenta, cb.nombre_oficial_cuenta, cb.tipo_cuenta, cb.moneda,
                   COALESCE(b.nombre, 'Sin Banco') as banco_nombre, 
                   COALESCE(cc.saldo_actual, 0) as saldo_actual
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            LEFT JOIN cuentas_contables cc ON cb.cuenta_contable_id = cc.id
            WHERE cb.activo = true
            ORDER BY b.nombre ASC NULLS LAST
        `);
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
