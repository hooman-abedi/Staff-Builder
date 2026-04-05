const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const pool = require("../db");
router.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(`
      SELECT b.*
      FROM users u
      JOIN businesses b ON u.business_id = b.id
      WHERE u.id = $1
    `, [userId]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch business info" });
    }
});
router.get("/business/subscription-status", requireAuth, async (req, res) => {
    if (req.user.role === "super_admin" || req.user.role === "support_admin") {
        return res.json({
            id: null,
            name: "Internal Platform Access",
            subscription_plan: "internal",
            subscription_status: "active",
            effective_status: "active",
            trial_started_at: null,
            trial_ends_at: null,
            max_employees: null,
            subscription_started_at: null,
            subscription_ends_at: null,
        });
    }
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
                subscription_ends_at
            FROM businesses
            WHERE id = $1
            `,
            [req.user.businessId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Business not found" });
        }

        const business = result.rows[0];

        let effectiveStatus = business.subscription_status;

        if (
            business.subscription_status === "trial_active" &&
            business.trial_ends_at &&
            new Date(business.trial_ends_at) < new Date()
        ) {
            effectiveStatus = "expired";
        }

        res.json({
            ...business,
            effective_status: effectiveStatus,
        });
    } catch (err) {
        console.error("Get business subscription status error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.put("/business/subscription", requireAuth, async (req, res) => {
    try {
        console.log("SUBSCRIPTION UPDATE BODY:", req.body);
        console.log("SUBSCRIPTION UPDATE USER:", req.user);

        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({ message: "Plan is required" });
        }

        let maxEmployees = 5;

        if (plan === "basic") maxEmployees = 10;
        if (plan === "growth") maxEmployees = 25;
        if (plan === "enterprise") maxEmployees = 100;

        const result = await pool.query(
            `
            UPDATE businesses
            SET
                subscription_plan = $1,
                subscription_status = 'active',
                subscription_started_at = NOW(),
                subscription_ends_at = NOW() + INTERVAL '30 days',
                trial_ends_at = NOW(),
                max_employees = $2
            WHERE id = $3
            RETURNING *
            `,
            [plan, maxEmployees, req.user.businessId]
        );

        console.log("SUBSCRIPTION UPDATE RESULT ROWCOUNT:", result.rowCount);
        console.log("SUBSCRIPTION UPDATE RESULT:", result.rows[0]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Subscription update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;