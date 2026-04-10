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
                const keys = Object.keys(user);
                const values = Object.values(user);
                const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
                const columns = keys.map(k => '"' + k + '"').join(', ');
                try {
                    await poolNeon.query(`INSERT INTO usuarios (${columns}) VALUES (${placeholders})`, values);
                } catch(e) {}
            }
            console.log('Migrated usuarios to Neon');

            const localRoles = await poolLocal.query('SELECT * FROM roles');
            for(const r of localRoles.rows) {
                 const keys = Object.keys(r);
                 const values = Object.values(r);
                 try { await poolNeon.query(`INSERT INTO roles (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map((_,i)=>'\\$'+(i+1)).join(',')})`, values); } catch(e) {}
            }
            const localPerms = await poolLocal.query('SELECT * FROM permisos');
            for(const r of localPerms.rows) {
                 const keys = Object.keys(r);
                 const values = Object.values(r);
                 try { await poolNeon.query(`INSERT INTO permisos (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map((_,i)=>'\\$'+(i+1)).join(',')})`, values); } catch(e) {}
            }
            const localURoles = await poolLocal.query('SELECT * FROM usuarios_roles');
            for(const r of localURoles.rows) {
                 const keys = Object.keys(r);
                 const values = Object.values(r);
                 try { await poolNeon.query(`INSERT INTO usuarios_roles (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map((_,i)=>'\\$'+(i+1)).join(',')})`, values); } catch(e) {}
            }
            
            const localConfig = await poolLocal.query('SELECT * FROM configuraciones');
            for(const r of localConfig.rows) {
                 const keys = Object.keys(r);
                 const values = Object.values(r);
                 try { await poolNeon.query(`INSERT INTO configuraciones (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map((_,i)=>'\\$'+(i+1)).join(',')})`, values); } catch(e) {}
            }
            console.log('Migrated roles, permisos, usuarios_roles, configuraciones');
        } else {
            console.log('No users found in local DB');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}
syncUsers();
