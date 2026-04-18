const pool = require('./db');
pool.query('SELECT u.name as "adminName", u.lastlogin as "lastLogin" FROM users u')
  .then(r => console.log(JSON.stringify(r.rows[0], null, 2)))
  .catch(console.error)
  .finally(() => process.exit());
