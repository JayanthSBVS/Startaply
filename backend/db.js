const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/startaply';

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is missing in .env file. Falling back to local default.");
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.warn('[DB Pool Warning]', err.message);
});

module.exports = pool;