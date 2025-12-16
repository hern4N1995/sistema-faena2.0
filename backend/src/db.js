// backend/src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || null;
const pghost = process.env.PGHOST || 'localhost';

let pool;

if (connectionString) {
  // Producción con DATABASE_URL (ej: Render en vercel)
  console.log('[DB] Conectando con DATABASE_URL (producción)');
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else if (pghost.includes('render.com')) {
  // Desarrollo conectado a Render (remoto con SSL requerido)
  console.log('[DB] Conectando a Render (remoto con SSL)');
  const poolConfig = {
    host: pghost,
    port: (process.env.PGPORT && Number(process.env.PGPORT)) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'sistema_faena_db',
    ssl: {
      rejectUnauthorized: false,
    },
  };
  console.log('[DB] Config:', {
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    database: poolConfig.database,
  });
  pool = new Pool(poolConfig);
} else {
  // Desarrollo local: usar variables individuales SIN SSL
  console.log('[DB] Conectando con variables individuales (localhost)');
  
  const poolConfig = {
    host: pghost,
    port: (process.env.PGPORT && Number(process.env.PGPORT)) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'sistema_faena_db',
  };

  console.log('[DB] Config:', {
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    database: poolConfig.database,
  });

  pool = new Pool(poolConfig);
}

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
