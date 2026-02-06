
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: connectionString,
});

async function fixTransactionDate() {
    try {
        const transactionId = 'db4f399a-3c8e-45c9-a0e3-96bab2795e80';

        // Update fecha to match created_at for this specific record
        const res = await pool.query(`
        UPDATE movimientos_contables 
        SET fecha = created_at 
        WHERE id = $1 
        RETURNING id, fecha, created_at
    `, [transactionId]);

        console.log("Transaction Updated:", res.rows[0]);

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await pool.end();
    }
}

fixTransactionDate();
