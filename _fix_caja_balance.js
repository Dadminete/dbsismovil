
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: connectionString,
});

async function fixCajaFuerte() {
    try {
        const cajaId = '99d537c9-b037-4053-9b09-802b17f3b0b1';
        const correctBalance = 14300;

        const res = await pool.query(
            "UPDATE cajas SET saldo_actual = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [correctBalance, cajaId]
        );

        console.log("Caja Updated Successfully:", res.rows[0]);

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await pool.end();
    }
}

fixCajaFuerte();
