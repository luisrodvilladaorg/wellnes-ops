//Middleware to activate metrics

const metricsMiddleware = require("./middleware/metrics");
const { client } = require("./metrics");


const express = require("express");

// Middlewares
const authRoutes = require("./routes/auth.routes");
const entriesRoutes = require("./routes/entries.routes");

const app = express();

app.use(express.json());

//Metrics analizer

app.use(metricsMiddleware);


// Healthchecks simples
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/entries", entriesRoutes);

module.exports = app;


//Expose endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});
