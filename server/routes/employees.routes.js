const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");
const crypto = require("crypto");

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
// POST invite a new employee
router.post("/employees/invite", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { full_name, email } = req.body;

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

        // Create employee with no usable password yet
        const tempPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);

        const userResult = await pool.query(
            `INSERT INTO users (business_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'employee')
       RETURNING id, business_id, full_name, email, role, created_at`,
            [req.user.businessId, full_name.trim(), normalizedEmail, tempPasswordHash]
        );

        const createdUser = userResult.rows[0];

        // Generate invite token valid for 7 days
        const inviteToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.query(
            `INSERT INTO employee_invites (business_id, user_id, email, token, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                req.user.businessId,
                createdUser.id,
                createdUser.email,
                inviteToken,
                expiresAt,
            ]
        );

        res.status(201).json({
            message: "Employee invited successfully",
            employee: createdUser,
            invite_token: inviteToken,
            expires_at: expiresAt,
        });
    } catch (err) {
        console.error("Error inviting employee:", err);

        if (err.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});
// GET invite details by token
router.get("/employees/invite/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `SELECT
         ei.id,
         ei.business_id,
         ei.user_id,
         ei.email,
         ei.token,
         ei.expires_at,
         ei.used,
         u.full_name
       FROM employee_invites ei
       JOIN users u ON ei.user_id = u.id
       WHERE ei.token = $1`,
            [token]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Invite not found" });
        }

        const invite = result.rows[0];

        if (invite.used) {
            return res.status(400).json({ message: "This invite has already been used" });
        }

        if (new Date(invite.expires_at) < new Date()) {
            return res.status(400).json({ message: "This invite has expired" });
        }

        res.json({
            email: invite.email,
            full_name: invite.full_name,
            expires_at: invite.expires_at,
        });
    } catch (err) {
        console.error("Error fetching invite:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST set password using invite token
router.post("/employees/invite/:token/set-password", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" });
        }

        const inviteResult = await pool.query(
            `SELECT id, user_id, expires_at, used
       FROM employee_invites
       WHERE token = $1`,
            [token]
        );

        if (inviteResult.rowCount === 0) {
            return res.status(404).json({ message: "Invite not found" });
        }

        const invite = inviteResult.rows[0];

        if (invite.used) {
            return res.status(400).json({ message: "This invite has already been used" });
        }

        if (new Date(invite.expires_at) < new Date()) {
            return res.status(400).json({ message: "This invite has expired" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
            [passwordHash, invite.user_id]
        );

        await pool.query(
            `UPDATE employee_invites
       SET used = TRUE
       WHERE id = $1`,
            [invite.id]
        );

        res.json({ message: "Password set successfully" });
    } catch (err) {
        console.error("Error setting invite password:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;