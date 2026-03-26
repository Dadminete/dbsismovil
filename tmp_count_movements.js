const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        const res = await client.query("SELECT cuenta_bancaria_id, COUNT(*) as count FROM movimientos_contables GROUP BY cuenta_bancaria_id");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
