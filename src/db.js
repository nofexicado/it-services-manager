const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tickets_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Tiempos de espera recomendados para evitar cuelgues desde la red
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

pool.on('connect', () => {
  console.log('✅ Conexión establecida con la base de datos.');
});

pool.on('error', (err) => {
  console.error('❌ Error en el pool de PostgreSQL:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
