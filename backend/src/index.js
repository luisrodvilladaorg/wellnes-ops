const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Healthcheck simple (app viva)
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

// Healthcheck REAL de DB
app.get("/api/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT 1");
        res.json({
            status: "OK",
            db: "connected",
            result: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "ERROR",
            db: "disconnected",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
