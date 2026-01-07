const pool = require("../db");

exports.getAll = async () => {
    const result = await pool.query(
        "SELECT * FROM entries ORDER BY created_at DESC"
    );
    return result.rows;
};

exports.create = async (title, description) => {
    const result = await pool.query(
        "INSERT INTO entries (title, description) VALUES ($1, $2) RETURNING *",
        [title, description]
    );
    return result.rows[0];
};

exports.update = async (id, title, description) => {
    const result = await pool.query(
        `UPDATE entries
         SET title = $1, description = $2
         WHERE id = $3
         RETURNING *`,
        [title, description, id]
    );
    return result.rows[0];
};

exports.remove = async (id) => {
    const result = await pool.query(
        "DELETE FROM entries WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rowCount > 0;
};
