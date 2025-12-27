//Conexión a postgreSQL
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: false, // en prod podría ser true
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL - success");
});

pool.on("error", (err) => {
    console.error("PostgreSQL connection error Prueba de error", err);
    process.exit(1);
});

module.exports = pool;
