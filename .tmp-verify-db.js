const { Client } = require("pg");
(async () => {
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  const c = new Client({ connectionString });
  await c.connect();
  const count = await c.query("select count(*)::int as total from usuarios");
  console.log("usuarios disponibles para DBSISMOVIL:", count.rows[0].total);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });
