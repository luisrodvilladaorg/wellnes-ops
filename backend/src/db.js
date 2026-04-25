const { Pool } = require("pg");

const logger = require("./logger");

const useDbSsl = String(process.env.DB_SSL || "false").toLowerCase() === "true";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useDbSsl ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,  
});

async function waitForDB(retries = 10) {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query("SELECT 1");
            logger.info("Connected to PostgreSQL");
            return;
        } catch (_err) {
            logger.warn("PostgreSQL not ready", { attempt: i + 1, total: retries });
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    throw new Error("PostgreSQL not reachable");
}

waitForDB();


module.exports = pool;
