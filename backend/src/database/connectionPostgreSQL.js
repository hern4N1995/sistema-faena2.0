import pg from "pg";

export const pool= new pg.Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || "sistema_faenasdb",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || ""
});