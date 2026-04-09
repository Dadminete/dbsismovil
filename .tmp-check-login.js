const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(`
    select
      case
        when password_hash like '$2a$%' then '$2a$'
        when password_hash like '$2b$%' then '$2b$'
        when password_hash like '$2y$%' then '$2y$'
        else 'other'
      end as kind,
      count(*)::int as total
    from usuarios
    group by 1
    order by 2 desc
  `);
  console.table(r.rows);
  const users = await c.query("select username, activo, left(password_hash, 4) as prefix from usuarios order by username limit 10");
  console.table(users.rows);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });
