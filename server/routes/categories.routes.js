const express = require('express');
const router = express.Router();
/** @type {import("pg").Pool} */
const pool = require('../db');
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description, created_at FROM categories ORDER BY created_at DESC");

        res.json(result.rows);
    }
    catch(err) {
        console.error("Error fetching Categories:", err);
        res.status(500).json({message: "Internal Server Error"});
    }

});
router.post("/categories", async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await pool.query(
            "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at",
            [name, description ?? null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.delete("/categories/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category id" });
        }
        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING id",
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ message: "Category not found" });
        }
        res.json({deletedId: result.rows[0].id});
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})
router.put("/categories/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category id" });
        }
        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await pool.query(
            "UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_at",
            [name.trim(), description ?? null, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;