const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ connectionString });

async function main() {
    try {
        console.log('Connecting to database...');
        await pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;");
        console.log('Column token_version added successfully');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await pool.end();
    }
}
main();
