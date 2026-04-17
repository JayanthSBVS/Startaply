const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('--- DB Migration Start ---');
    
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin BIGINT,
        createdAt BIGINT
      )
    `);
    console.log('✓ Users table ready');

    // 2. Activity Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(50),
        userName TEXT,
        role TEXT,
        module TEXT,
        action TEXT,
        targetId TEXT,
        timestamp BIGINT
      )
    `);
    console.log('✓ Activity Logs table ready');

    // 3. Seed Manager
    const managerEmail = 'manager@strataply.com';
    const hashedPassword = await bcrypt.hash('manager123', 10);
    
    await pool.query(`
      INSERT INTO users (id, name, email, password, role, createdAt)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET password = $4, role = $5
    `, ['manager_principal', 'Operations Manager', managerEmail, hashedPassword, 'manager', Date.now()]);
    
    console.log('✓ Operational Manager seeded (manager@strataply.com / manager123)');
    
    // 4. Migrate existing admins if any
    const adminsTableExists = await pool.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins')
    `);
    
    if (adminsTableExists.rows[0].exists) {
      const { rows: legacyAdmins } = await pool.query("SELECT * FROM admins");
      for (const admin of legacyAdmins) {
         const id = 'legacy_' + admin.email.split('@')[0];
         const legacyPass = await bcrypt.hash(admin.password, 10);
         await pool.query(`
           INSERT INTO users (id, name, email, password, role, createdAt)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO NOTHING
         `, [id, 'Legacy Admin', admin.email, legacyPass, 'manager', Date.now()]);
      }
      console.log(`✓ Migrated ${legacyAdmins.length} legacy admins`);
    }

    console.log('--- Migration Finished Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
