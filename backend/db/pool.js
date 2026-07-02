// db/pool.js
// Ye file PostgreSQL se connection banati hai. Poore app me isi pool ko use karenge.

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test karne ke liye - agar connection fail hua toh yahan pata chal jayega
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;
