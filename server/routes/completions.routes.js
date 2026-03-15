const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// EMPLOYEE: mark a training item as completed
router.post("/employee/completions", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const { training_item_id } = req.body;
        const trainingItemId = Number(training_item_id);

        if (!Number.isInteger(trainingItemId)) {
            return res.status(400).json({ message: "training_item_id must be a number" });
        }

        // verify this employee actually has access to this training item
        const accessCheck = await pool.query(
            `SELECT ti.id
       FROM training_items ti
       JOIN folders f ON ti.folder_id = f.id
       JOIN employee_category_assignments a ON a.staff_category_id = f.staff_category_id
       WHERE ti.id = $1
         AND ti.business_id = $2
         AND a.user_id = $3
         AND a.business_id = $2`,
            [trainingItemId, req.user.businessId, req.user.userId]
        );

        if (accessCheck.rowCount === 0) {
            return res.status(403).json({ message: "You do not have access to this training item" });
        }

        const result = await pool.query(
            `INSERT INTO training_item_completions (business_id, user_id, training_item_id)
       VALUES ($1, $2, $3)
       RETURNING id, business_id, user_id, training_item_id, completed_at`,
            [req.user.businessId, req.user.userId, trainingItemId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error marking training item complete:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "Training item already marked as completed" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// EMPLOYEE: list my completed items
router.get("/employee/completions", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         c.id,
         c.business_id,
         c.user_id,
         c.training_item_id,
         c.completed_at,
         ti.title AS training_item_title,
         ti.type AS training_item_type
       FROM training_item_completions c
       JOIN training_items ti ON c.training_item_id = ti.id
       WHERE c.user_id = $1
         AND c.business_id = $2
       ORDER BY c.completed_at DESC`,
            [req.user.userId, req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employee completions:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// EMPLOYER: see all completion records in this business
router.get("/completions", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         c.id,
         c.business_id,
         c.user_id,
         c.training_item_id,
         c.completed_at,
         u.full_name AS employee_name,
         u.email AS employee_email,
         ti.title AS training_item_title,
         ti.type AS training_item_type
       FROM training_item_completions c
       JOIN users u ON c.user_id = u.id
       JOIN training_items ti ON c.training_item_id = ti.id
       WHERE c.business_id = $1
       ORDER BY c.completed_at DESC`,
            [req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employer completions:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;