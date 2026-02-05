
const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Metodos ---');
        const metodosRes = await client.query("SELECT DISTINCT metodo FROM movimientos_contables");
        console.log(metodosRes.rows);

        console.log('--- Categorias Paperleria ---');
        const papRes = await client.query("SELECT id, nombre FROM categorias_papeleria LIMIT 5");
        console.log(papRes.rows);

    } finally {
        await client.end();
    }
}
main();
