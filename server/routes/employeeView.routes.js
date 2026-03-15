const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET employee's assigned staff categories
router.get("/employee/my-categories", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         sc.id,
         sc.business_id,
         sc.name,
         sc.description,
         sc.created_at
       FROM employee_category_assignments a
       JOIN staff_categories sc ON a.staff_category_id = sc.id
       WHERE a.user_id = $1
         AND a.business_id = $2
       ORDER BY sc.created_at DESC`,
            [req.user.userId, req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employee categories:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET folders for one assigned staff category
router.get("/employee/my-folders", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const { staff_category_id } = req.query;
        const staffCategoryId = Number(staff_category_id);

        if (!Number.isInteger(staffCategoryId)) {
            return res.status(400).json({ message: "staff_category_id must be a number" });
        }

        // verify employee is assigned to this category
        const assignmentCheck = await pool.query(
            `SELECT id
       FROM employee_category_assignments
       WHERE user_id = $1
         AND business_id = $2
         AND staff_category_id = $3`,
            [req.user.userId, req.user.businessId, staffCategoryId]
        );

        if (assignmentCheck.rowCount === 0) {
            return res.status(403).json({ message: "You are not assigned to this category" });
        }

        const result = await pool.query(
            `SELECT id, business_id, staff_category_id, name, description, created_at
       FROM folders
       WHERE business_id = $1
         AND staff_category_id = $2
       ORDER BY created_at DESC`,
            [req.user.businessId, staffCategoryId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employee folders:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET training items for one allowed folder
router.get("/employee/my-training-items", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const { folder_id } = req.query;
        const folderId = Number(folder_id);

        if (!Number.isInteger(folderId)) {
            return res.status(400).json({ message: "folder_id must be a number" });
        }

        // verify folder belongs to a category assigned to this employee
        const accessCheck = await pool.query(
            `SELECT f.id
       FROM folders f
       JOIN employee_category_assignments a
         ON a.staff_category_id = f.staff_category_id
       WHERE f.id = $1
         AND f.business_id = $2
         AND a.user_id = $3
         AND a.business_id = $2`,
            [folderId, req.user.businessId, req.user.userId]
        );

        if (accessCheck.rowCount === 0) {
            return res.status(403).json({ message: "You do not have access to this folder" });
        }

        const result = await pool.query(
            `SELECT id, business_id, folder_id, type, title, url, file_path, body, created_at
       FROM training_items
       WHERE business_id = $1
         AND folder_id = $2
       ORDER BY created_at DESC`,
            [req.user.businessId, folderId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employee training items:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;