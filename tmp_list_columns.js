const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cuentas_bancarias'");
        console.log(JSON.stringify(res.rows.map(r => r.column_name), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
