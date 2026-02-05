
const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        console.log(res.rows.map(r => r.table_name).join(', '));
    } finally {
        await client.end();
    }
}
main();
