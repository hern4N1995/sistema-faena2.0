// backend/src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || null;

// Si hay connectionString (DATABASE_URL) la usamos y forzamos ssl
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT && Number(process.env.PGPORT),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    });

module.exports = pool;

/*
  Versión anterior (comentada) — no usar:
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    JWT_SECRET: process.env.JWT_SECRET, // NO incluir JWT_SECRET en la configuración de PG
  });
*/
