const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET all businesses
router.get("/admin/businesses", requireAuth, requireRole("super_admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                subscription_plan,
                subscription_status,
                trial_started_at,
                trial_ends_at,
                max_employees,
                subscription_started_at,
                subscription_ends_at,
                created_at
            FROM businesses
            ORDER BY id ASC
            `
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Admin get businesses error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET all users
router.get("/admin/users", requireAuth, requireRole("super_admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                u.id,
                u.business_id,
                b.name AS business_name,
                u.full_name,
                u.email,
                u.role,
                u.created_at
            FROM users u
            LEFT JOIN businesses b ON b.id = u.business_id
            ORDER BY u.id ASC
            `
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Admin get users error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;