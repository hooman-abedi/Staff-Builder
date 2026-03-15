const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || "postgres",
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});
pool.on("connect", (client) => {
    client.query("SET statement_timeout TO 5000");
});
pool.on("error", (err) => {
    console.error("Unexpected PG pool error:", err);
});

module.exports = pool;