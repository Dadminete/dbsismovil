
const { Client } = require('pg');
const fs = require('fs');
const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        // 1. List all tables
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log('Tables:', tables);

        const relevantTables = tables.filter(t =>
            t.includes('categoria') ||
            t.includes('movimiento') ||
            t.includes('ingreso') ||
            t.includes('gasto') ||
            t.includes('cuenta') ||
            t.includes('banco') ||
            t.includes('caja')
        );
        console.log('Relevant Tables:', relevantTables);

        const report = {};
        for (const table of relevantTables) {
            const colsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
            report[table] = colsRes.rows;
        }

        fs.writeFileSync('finance_schema.json', JSON.stringify(report, null, 2));
        console.log('Finance schema saved to finance_schema.json');

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
