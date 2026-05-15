const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// SQLite 스타일 동기 API를 PostgreSQL 비동기로 래핑
// 컨트롤러들이 동기식으로 쓰므로 async/await 방식으로 전환

module.exports = pool;
