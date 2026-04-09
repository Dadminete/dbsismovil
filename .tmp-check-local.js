const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.LOCAL_DATABASE_URL });
  await c.connect();
  const count = await c.query("select count(*)::int as total from usuarios");
  const users = await c.query("select username, activo from usuarios order by username limit 10");
  console.log("total usuarios:", count.rows[0].total);
  console.table(users.rows);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });
