const {
    httpRequestsTotal,
    httpRequestDuration,
} = require("../metrics");

module.exports = (req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;

        httpRequestsTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status: res.statusCode,
            },
            seconds
        );
    });

    next();
};
