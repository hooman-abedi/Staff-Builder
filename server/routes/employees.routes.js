const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET all employees in this employer's business
router.get("/employees", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, business_id, full_name, email, role, created_at
       FROM users
       WHERE business_id = $1 AND role = 'employee'
       ORDER BY created_at DESC`,
            [req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST create a new employee
router.post("/employees", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
            return res.status(400).json({ message: "full_name is required" });
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: "A valid email is required" });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (business_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'employee')
       RETURNING id, business_id, full_name, email, role, created_at`,
            [req.user.businessId, full_name.trim(), normalizedEmail, passwordHash]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating employee:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE employee
router.delete("/employees/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid employee id" });
        }

        const result = await pool.query(
            `DELETE FROM users
       WHERE id = $1 AND business_id = $2 AND role = 'employee'
       RETURNING id`,
            [id, req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;