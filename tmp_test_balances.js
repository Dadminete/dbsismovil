const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        await client.connect();
        
        console.log('--- Individual Balance Calculation Test ---');
        const res = await client.query(`
            SELECT 
                cb.id, 
                COALESCE(b.nombre, 'Sin Banco') as banco, 
                cb.numero_cuenta,
                COALESCE((
                    SELECT SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END)
                    FROM movimientos_contables
                    WHERE cuenta_bancaria_id = cb.id
                ), 0) as balance_from_movements
            FROM cuentas_bancarias cb 
            LEFT JOIN banks b ON cb.bank_id = b.id
            WHERE cb.activo = true
            ORDER BY b.nombre ASC
        `);
        console.log('Results found:', res.rows.length);
        res.rows.forEach(r => {
            console.log('Bank: ' + r.banco + ' | Acc: ' + r.numero_cuenta + ' | Balance: ' + r.balance_from_movements);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
