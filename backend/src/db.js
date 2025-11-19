// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || null;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.PGHOST, // ej: 'localhost'
      port: process.env.PGPORT && Number(process.env.PGPORT), // ej: 5432
      user: process.env.PGUSER, // ej: 'postgres'
      password: process.env.PGPASSWORD, // tu contraseña de PostgreSQL
      database: process.env.PGDATABASE, // el nombre de tu base de datos
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
