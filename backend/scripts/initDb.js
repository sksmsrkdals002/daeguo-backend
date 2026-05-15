require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('DB 초기화 완료!');
  } catch (e) {
    console.error('오류:', e.message);
  } finally {
    await pool.end();
  }
}

init();
