// db/setup.js
// Ye script schema.sql file read karke database me tables bana degi.
// Run karne ke liye: npm run db:setup

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('✅ Database tables ban gaye successfully!');
  } catch (err) {
    console.error('❌ Error while setting up database:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
