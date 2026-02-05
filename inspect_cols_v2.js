
const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('--- Metodos ---');
        try {
            const metodosRes = await client.query("SELECT DISTINCT metodo FROM movimientos_contables");
            console.log(metodosRes.rows);
        } catch (e) { console.log('Error fetching metodos:', e.message); }

        console.log('--- Banks columns ---');
        const bCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'banks'");
        console.log(bCols.rows.map(r => r.column_name));

        console.log('--- Cajas columns ---');
        const cCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cajas'");
        console.log(cCols.rows.map(r => r.column_name));

    } finally {
        await client.end();
    }
}
main();
