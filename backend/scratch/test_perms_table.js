const pool = require('../db');

async function testPerms() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions'
    `);
    console.log('Columns in role_permissions table:');
    console.log(res.rows);

    const rowsRes = await pool.query('SELECT * FROM role_permissions');
    console.log('Seeded rows:');
    console.log(rowsRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPerms();
