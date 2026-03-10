const client = require("prom-client");

// Collect default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
    prefix: "wellness_backend_",
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
    name: "wellness_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});

// Request duration histogram
const httpRequestDuration = new client.Histogram({
    name: "wellness_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

module.exports = {
    client,
    httpRequestsTotal,
    httpRequestDuration,
};
