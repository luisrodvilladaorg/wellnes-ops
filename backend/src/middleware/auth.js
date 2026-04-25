const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Must be provided as: "Bearer <token>"
    if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid Authorization format" });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // user info available in downstream routes
        next();
    } catch (_err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
