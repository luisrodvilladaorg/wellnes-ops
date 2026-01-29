const jwt = require("jsonwebtoken");

exports.login = (req, res) => {

    const { username, password } = req.body;

    const user = {
        id: 1,
        username: "admin",
        role: "admin",
        password: "admin123"
    };

    if (username !== user.username || password !== user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({ token });
};
