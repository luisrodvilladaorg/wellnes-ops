const express = require("express");
const router = express.Router();
const { client } = require("../metrics");

router.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

module.exports = router;
