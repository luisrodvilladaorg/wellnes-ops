const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

async function waitForDB(retries = 10) {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query("SELECT 1");
            console.log("Connected to PostgreSQL - success");
            return;
        } catch (err) {
            console.log(`PostgreSQL not ready (${i + 1}/${retries})`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    throw new Error("PostgreSQL not reachable");
}

waitForDB();


module.exports = pool;
