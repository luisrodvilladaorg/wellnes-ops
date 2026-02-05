const express = require("express");

// Middlewares
const metricsMiddleware = require("./middleware/metrics");

// Routes
const authRoutes = require("./routes/auth.routes");
const entriesRoutes = require("./routes/entries.routes");
const healthRoutes = require("./routes/health.routes");
const metricsRoutes = require("./routes/metrics.routes");

const app = express();

// ==========================
// Global middlewares
// ==========================
app.use(express.json());
app.use(metricsMiddleware);

// ==========================
// Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/entries", entriesRoutes);
app.use("/api/health", healthRoutes);
app.use("/metrics", metricsRoutes);
// Healthcheck simple para Docker / orquestadores
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});


// ==========================
// 404 handler
// ==========================
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

module.exports = app;
