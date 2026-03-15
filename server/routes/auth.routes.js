const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// POST /api/auth/register-employer
// Body: { businessName, email, password }
router.post("/auth/register-employer", async (req, res) => {
    try {
        const { businessName, email, password } = req.body;

        if (!businessName || !businessName.trim()) {
            return res.status(400).json({ message: "businessName is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: "email is required" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" });
        }

        // 1) create business
        const businessResult = await pool.query(
            `INSERT INTO businesses (name)
       VALUES ($1)
       RETURNING id, name, created_at`,
            [businessName.trim()]
        );
        const business = businessResult.rows[0];

        // 2) create employer user
        const passwordHash = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (business_id, email, password_hash, role)
       VALUES ($1, $2, $3, 'employer')
       RETURNING id, business_id, email, role, created_at`,
            [business.id, email.trim().toLowerCase(), passwordHash]
        );
        const createdUser = userResult.rows[0];

        // 3) issue token
        const token = jwt.sign(
            {
                userId: createdUser.id,
                businessId: createdUser.business_id,
                role: createdUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            token,
            user: {
                id: createdUser.id,
                business_id: createdUser.business_id,
                email: createdUser.email,
                role: createdUser.role,
            },
            business: {
                id: business.id,
                name: business.name,
            },
        });
    } catch (err) {
        console.error("Register Employer Error:", err);

        // unique violation (email already exists)
        if (err && err.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /api/auth/login
// Body: { email, password, role }
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ message: "email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "password is required" });
        }
        if (!role || !["employer", "employee"].includes(role)) {
            return res.status(400).json({ message: "role must be employer or employee" });
        }

        const result = await pool.query(
            `SELECT id, business_id, email, password_hash, role
       FROM users
       WHERE email = $1`,
            [email.trim().toLowerCase()]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const dbUser = result.rows[0];

        if (dbUser.role !== role) {
            return res.status(403).json({ message: "Role mismatch for this account" });
        }

        const ok = await bcrypt.compare(password, dbUser.password_hash);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: dbUser.id, businessId: dbUser.business_id, role: dbUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.json({
            token,
            user: {
                id: dbUser.id,
                business_id: dbUser.business_id,
                email: dbUser.email,
                role: dbUser.role,
            },
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;