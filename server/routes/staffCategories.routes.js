const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET all staff categories for this employer's business
router.get("/staff-categories", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, business_id, name, description, created_at
       FROM staff_categories
       WHERE business_id = $1
       ORDER BY created_at DESC`,
            [req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching staff categories:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST create a new staff category
router.post("/staff-categories", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await pool.query(
            `INSERT INTO staff_categories (business_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, business_id, name, description, created_at`,
            [req.user.businessId, name.trim(), description?.trim() || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating staff category:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "A category with this name already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT update a staff category
router.put("/staff-categories/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category id" });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const result = await pool.query(
            `UPDATE staff_categories
       SET name = $1, description = $2
       WHERE id = $3 AND business_id = $4
       RETURNING id, business_id, name, description, created_at`,
            [name.trim(), description?.trim() || null, id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Staff category not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating staff category:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "A category with this name already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE a staff category
router.delete("/staff-categories/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid category id" });
        }

        const result = await pool.query(
            `DELETE FROM staff_categories
       WHERE id = $1 AND business_id = $2
       RETURNING id`,
            [id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Staff category not found" });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Error deleting staff category:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;