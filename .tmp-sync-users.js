const { Pool } = require('pg');

async function syncUsers() {
    const localDb = "postgresql://postgres:Axm0227*@127.0.0.1:5432/sistema_v3?sslmode=disable";
    const neonDb = "postgresql://neondb_owner:npg_KC1FGXmnIbw7@ep-withered-term-ah5smbej-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

    try {
        const poolLocal = new Pool({ connectionString: localDb });
        const poolNeon = new Pool({ connectionString: neonDb });

        const localUsers = await poolLocal.query('SELECT * FROM usuarios');
        console.log(`Local users count: ${localUsers.rows.length}`);

        if (localUsers.rows.length > 0) {
            for (const user of localUsers.rows) {
                // Insert into neon
                await poolNeon.query(`
                    INSERT INTO usuarios (id, nombre, email, password_hash, activo, creado_en, actualizado_en, username, telefono, token_version)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    user.id, user.nombre, user.email, user.password_hash, user.activo, user.creado_en, user.actualizado_en, user.username, user.telefono, user.token_version
                ]);
            }
            console.log('Migrated users to Neon');
        } else {
            console.log('No users found in local DB');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}
syncUsers();
