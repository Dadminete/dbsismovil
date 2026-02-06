
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: connectionString,
});

async function checkMovimientos() {
    try {
        const res = await pool.query(`
      SELECT id, tipo, monto, fecha, created_at 
      FROM movimientos_contables 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
        console.log('Last 10 Movimientos:');
        res.rows.forEach(row => {
            console.log({
                id: row.id,
                tipo: row.tipo,
                montoRaw: row.monto,
                montoType: typeof row.monto,
                createdAt: row.created_at
            });
        });
    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await pool.end();
    }
}

checkMovimientos();
