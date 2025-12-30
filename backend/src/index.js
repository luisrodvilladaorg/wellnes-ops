const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Protect path

const auth = require("./middleware/auth");

//Required Role
const requireRole = require("./middleware/requireRole");

app.use(express.json());

//EndPoint login
const jwt = require("jsonwebtoken");
const { USER } = require("./auth");

//Endpoint

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username !== USER.username) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = require("bcryptjs").compareSync(
        password,
        USER.passwordHash
    );

    if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: USER.id, username: USER.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
});


// Healthcheck simple (app viva)
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Healthcheck REAL de DB
app.get("/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT 1");
        res.json({
            status: "OK",
            db: "connected",
            result: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "ERROR",
            db: "disconnected",
        });
    }
});


// ==========================
// GET all entries
// ==========================
app.get("/entries", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM entries ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// ==========================
// CREATE new entry
// ==========================
app.post("/entries", auth, async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO entries (title, description) VALUES ($1, $2) RETURNING *",
            [title, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

//Another PUT

// ==========================
// UPDATE entry (PUT)
// ==========================
app.put("/entries/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE entries
             SET title = $1,
                 description = $2
             WHERE id = $3
             RETURNING *`,
            [title, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});


//DELETE WITH JWT

// ==========================
// DELETE entry
// ==========================
app.delete("/entries/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM entries WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        // 204 = borrado correcto sin contenido
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// ==========================
// DELETE entry by ID
// ==========================
app.delete("/entries/:id", auth, requireRole("admin"), async (req, res) => {

    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM entries WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.json({
            status: "deleted",
            entry: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// ==========================
// UPDATE entry
// ==========================
app.put("/entries/:id", auth, requireRole("admin"), async (req, res) => {

    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE entries
             SET title = $1,
                 description = $2
             WHERE id = $3
             RETURNING *`,
            [title, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});


app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
