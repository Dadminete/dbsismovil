
const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Metodos ---');
        const metodosRes = await client.query("SELECT DISTINCT metodo FROM movimientos_contables");
        console.log(metodosRes.rows);

        console.log('--- Categorias Sample ---');
        const catRes = await client.query("SELECT id, nombre, tipo FROM categorias_cuentas LIMIT 10");
        console.log(catRes.rows);

        console.log('--- Cajas ---');
        const cajasRes = await client.query("SELECT id, nombre FROM cajas WHERE activa = true");
        console.log(cajasRes.rows);

        console.log('--- Banks ---');
        const banksRes = await client.query("SELECT id, name FROM banks");
        console.log(banksRes.rows);

        console.log('--- Accounts ---');
        const accountsRes = await client.query("SELECT id, bank_id, numero_cuenta FROM cuentas_bancarias WHERE activo = true");
        console.log(accountsRes.rows);

    } finally {
        await client.end();
    }
}
main();
