const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// GET all entries
router.get("/", async (req, res) => {
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

// CREATE new entry
router.post("/", auth, async (req, res) => {
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

// UPDATE entry (admin)
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
        `UPDATE entries
         SET title = $1, description = $2
         WHERE id = $3
         RETURNING *`,
        [title, description, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Entry not found" });
    }

    res.json(result.rows[0]);
});

// DELETE entry (admin)
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        "DELETE FROM entries WHERE id = $1 RETURNING *",
        [id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ status: "deleted" });
});

module.exports = router;


//Simplicity routes

