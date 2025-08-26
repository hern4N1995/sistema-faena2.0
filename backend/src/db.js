// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  /* host: process.env.PGHOST, // ej: 'localhost'
  port: process.env.PGPORT, // ej: 5432
  user: process.env.PGUSER, // ej: 'postgres'
  password: process.env.PGPASSWORD, // tu contraseña de PostgreSQL
  database: process.env.PGDATABASE, // el nombre de tu base de datos */
  host: process.env.DB_HOST, // ej: 'localhost'
  port: process.env.DB_PORT, // ej: 5432
  user: process.env.DB_USER, // ej: 'postgres'
  password: process.env.DB_PASS, // tu contraseña de PostgreSQL
  database: process.env.DB_NAME, // el nombre de tu base de datos
});

module.exports = pool;
