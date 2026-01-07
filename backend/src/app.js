const express = require("express");

// Middlewares
const authRoutes = require("./routes/auth.routes");
const entriesRoutes = require("./routes/entries.routes");

const app = express();

app.use(express.json());

// Healthchecks simples
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/entries", entriesRoutes);

module.exports = app;
