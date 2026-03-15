const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET all assignments for this business
router.get("/assignments", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
         a.id,
         a.business_id,
         a.user_id,
         a.staff_category_id,
         a.created_at,
         u.full_name AS employee_name,
         u.email AS employee_email,
         sc.name AS staff_category_name
       FROM employee_category_assignments a
       JOIN users u ON a.user_id = u.id
       JOIN staff_categories sc ON a.staff_category_id = sc.id
       WHERE a.business_id = $1
       ORDER BY a.created_at DESC`,
            [req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST create assignment
router.post("/assignments", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { user_id, staff_category_id } = req.body;

        const userId = Number(user_id);
        const staffCategoryId = Number(staff_category_id);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({ message: "user_id must be a number" });
        }

        if (!Number.isInteger(staffCategoryId)) {
            return res.status(400).json({ message: "staff_category_id must be a number" });
        }

        // verify employee belongs to this business
        const employeeCheck = await pool.query(
            `SELECT id
       FROM users
       WHERE id = $1 AND business_id = $2 AND role = 'employee'`,
            [userId, req.user.businessId]
        );

        if (employeeCheck.rowCount === 0) {
            return res.status(404).json({ message: "Employee not found in this business" });
        }

        // verify staff category belongs to this business
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
            `INSERT INTO employee_category_assignments (business_id, user_id, staff_category_id)
       VALUES ($1, $2, $3)
       RETURNING id, business_id, user_id, staff_category_id, created_at`,
            [req.user.businessId, userId, staffCategoryId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating assignment:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "This employee is already assigned to this category" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE assignment
router.delete("/assignments/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid assignment id" });
        }

        const result = await pool.query(
            `DELETE FROM employee_category_assignments
       WHERE id = $1 AND business_id = $2
       RETURNING id`,
            [id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Error deleting assignment:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;