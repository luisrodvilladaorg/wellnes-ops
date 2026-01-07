const entriesService = require("../services/entries.service");

exports.getAll = async (req, res) => {
    try {
        const entries = await entriesService.getAll();
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.create = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const entry = await entriesService.create(title, description);
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const entry = await entriesService.update(id, title, description);
        if (!entry) {
            return res.status(404).json({ error: "Entry not found" });
        }
        res.json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await entriesService.remove(id);
        if (!deleted) {
            return res.status(404).json({ error: "Entry not found" });
        }
        res.json({ status: "deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};
