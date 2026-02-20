const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const version = process.env.APP_VERSION || "dev";
    const commit = process.env.GIT_SHA || "unknown";

    res.json({
        status: "OK",
        version,
        commit,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
