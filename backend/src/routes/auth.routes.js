const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Usuario fijo SOLO para DEV
const USER = {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin"
};

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (username !== USER.username) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, USER.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            id: USER.id,
            username: USER.username,
            role: USER.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

module.exports = router;
