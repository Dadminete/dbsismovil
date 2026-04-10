const { Pool } = require('pg');

async function testConn() {
    const connStr = "psql 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'";
    try {
        const pool = new Pool({ connectionString: connStr });
        await pool.query('SELECT 1');
        console.log('Success');
    } catch (err) {
        console.error('Error:', err.message);
    }
}
testConn();
