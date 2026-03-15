const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET folders for one staff category
router.get("/folders", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { staff_category_id } = req.query;

        if (staff_category_id === undefined) {
            return res.status(400).json({ message: "staff_category_id is required" });
        }

        const staffCategoryId = Number(staff_category_id);

        if (!Number.isInteger(staffCategoryId)) {
            return res.status(400).json({ message: "staff_category_id must be a number" });
        }

        const result = await pool.query(
            `SELECT id, business_id, staff_category_id, name, description, created_at
       FROM folders
       WHERE business_id = $1 AND staff_category_id = $2
       ORDER BY created_at DESC`,
            [req.user.businessId, staffCategoryId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching folders:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST create folder inside a staff category
router.post("/folders", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { staff_category_id, name, description } = req.body;

        const staffCategoryId = Number(staff_category_id);

        if (!Number.isInteger(staffCategoryId)) {
            return res.status(400).json({ message: "staff_category_id must be a number" });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "name is required" });
        }

        // verify category belongs to this business
        const categoryCheck = await pool.query(
            `SELECT id
       FROM staff_categories
       WHERE id = $1 AND business_id = $2`,
            [staffCategoryId, req.user.businessId]
        );

        if (categoryCheck.rowCount === 0) {
            return res.status(404).json({ message: "Staff category not found in this business" });
        }

        const result = await pool.query(
            `INSERT INTO folders (business_id, staff_category_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, business_id, staff_category_id, name, description, created_at`,
            [req.user.businessId, staffCategoryId, name.trim(), description?.trim() || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating folder:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "A folder with this name already exists in this category" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT update folder
router.put("/folders/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid folder id" });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "name is required" });
        }

        const result = await pool.query(
            `UPDATE folders
       SET name = $1, description = $2
       WHERE id = $3 AND business_id = $4
       RETURNING id, business_id, staff_category_id, name, description, created_at`,
            [name.trim(), description?.trim() || null, id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Folder not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating folder:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "A folder with this name already exists in this category" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE folder
router.delete("/folders/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid folder id" });
        }

        const result = await pool.query(
            `DELETE FROM folders
       WHERE id = $1 AND business_id = $2
       RETURNING id`,
            [id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Folder not found" });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Error deleting folder:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;