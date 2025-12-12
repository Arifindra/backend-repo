// src/server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // sementara untuk debugging. Setelah OK, batasi origin.

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || '';

let pool;
if (DATABASE_URL) {
  const sslCfg = process.env.DB_REQUIRE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: sslCfg
  });
} else {
  console.warn('⚠️ DATABASE_URL belum diset. Aplikasi akan berjalan tanpa DB (debug mode).');
}

// contoh route health
app.get('/health', async (req, res) => {
  try {
    if (!pool) return res.json({ status: 'ok', db: false });
    const result = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: true, rows: result.rows });
  } catch (err) {
    console.error('Health check DB error (full):', err);
    res.status(500).json({ status: 'db-error', error: String(err && (err.message || err)) });
  }
});

(async () => {
  let dbConnected = false;
  if (pool) {
    try {
      console.log('Connecting to PostgreSQL...');
      const client = await pool.connect();
      client.release();
      dbConnected = true;
      console.log('✅ PostgreSQL connected.');
    } catch (err) {
      console.error('❌ PostgreSQL connection error (full):', err);
      if (err && err.stack) console.error(err.stack);
      // DON'T process.exit here so Render can detect the open port for debugging
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (dbConnected=${dbConnected})`);
  });
})();
