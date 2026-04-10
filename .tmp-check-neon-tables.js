const { Pool } = require('pg');

async function checkDb() {
    const connStr = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
    try {
        const pool = new Pool({ connectionString: connStr });
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tablas:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkDb();
