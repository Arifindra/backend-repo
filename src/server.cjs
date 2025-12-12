// src/server.cjs
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// CORS controlled by FRONTEND_URL env variable
const FRONTEND_URL = process.env.FRONTEND_URL || '';
if (FRONTEND_URL) {
  app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }));
} else {
  console.warn('⚠️ FRONTEND_URL not set — allowing all origins (development only).');
  app.use(cors());
}

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

// ------------------ helpers ------------------
async function findUserByEmail(email) {
  if (!pool) return null;
  const res = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

// Debug: list all registered routes (printed on startup)
function listRoutes() {
  if (!app._router) return;
  console.log('Registered routes:');
  app._router.stack.forEach(m => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods).map(m => m.toUpperCase()).join(',');
      console.log(`${methods} ${m.route.path}`);
    }
  });
}

// ------------------ routes ------------------

// root
app.get('/', (req, res) => {
  res.send('Hello — backend up!');
});

// health
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

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });

    // Sign JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev_jwt_secret_change_this',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err && (err.stack || err.message || err));
    res.status(500).json({ error: 'server error' });
  }
});

// ------------------ startup ------------------
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
      // do not exit to allow inspection & logs
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (dbConnected=${dbConnected})`);
    listRoutes();
  });
})();
