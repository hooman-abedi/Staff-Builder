const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

router.get("/categories", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, business_id, name, description, created_at
             FROM categories
             WHERE business_id = $1
             ORDER BY created_at DESC`,
            [req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching Categories:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/categories", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await pool.query(
            `INSERT INTO categories (business_id, name, description)
             VALUES ($1, $2, $3)
             RETURNING id, business_id, name, description, created_at`,
            [req.user.businessId, name.trim(), description?.trim() || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/categories/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category id" });
        }

        const result = await pool.query(
            `DELETE FROM categories
             WHERE id = $1 AND business_id = $2
             RETURNING id`,
            [id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/categories/:id", requireAuth, requireRole("employer"), async (req, res) => {
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
            `UPDATE categories
             SET name = $1, description = $2
             WHERE id = $3 AND business_id = $4
             RETURNING id, business_id, name, description, created_at`,
            [name.trim(), description?.trim() || null, id, req.user.businessId]
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