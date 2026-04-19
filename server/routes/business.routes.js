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

        if (req.user.role !== "employer" && req.user.role !== "employee") {
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

router.get("/subscription-requests/me", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "employer" && req.user.role !== "employee") {
            return res.status(403).json({ message: "Access denied" });
        }

        const result = await pool.query(
            `
            SELECT
                sr.id,
                sr.business_id,
                sr.requested_by_user_id,
                sr.requested_plan,
                sr.requested_max_employees,
                sr.status,
                sr.admin_note,
                sr.reviewed_by_user_id,
                sr.reviewed_at,
                sr.created_at
            FROM subscription_requests sr
            WHERE sr.business_id = $1
            ORDER BY sr.created_at DESC
            `,
            [req.user.businessId]
        );

        res.set("Cache-Control", "no-store");
        res.json(result.rows);
    } catch (err) {
        console.error("Get employer subscription requests error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/subscription-requests", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "employer" && req.user.role !== "employee") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { requested_plan } = req.body;

        if (!requested_plan) {
            return res.status(400).json({ message: "Requested plan is required" });
        }

        let requestedMaxEmployees = 5;

        if (requested_plan === "basic") requestedMaxEmployees = 10;
        if (requested_plan === "growth") requestedMaxEmployees = 25;
        if (requested_plan === "enterprise") requestedMaxEmployees = 100;

        const existingPending = await pool.query(
            `
            SELECT id
            FROM subscription_requests
            WHERE business_id = $1
              AND status = 'pending'
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [req.user.businessId]
        );

        if (existingPending.rowCount > 0) {
            return res.status(400).json({
                message: "A pending subscription request already exists for this business",
            });
        }

        const result = await pool.query(
            `
            INSERT INTO subscription_requests (
                business_id,
                requested_by_user_id,
                requested_plan,
                requested_max_employees,
                status
            )
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
            `,
            [
                req.user.businessId,
                req.user.userId,
                requested_plan,
                requestedMaxEmployees,
            ]
        );

        const createdRequest = result.rows[0];

        const adminUsersResult = await pool.query(
            `
    SELECT id
    FROM users
    WHERE role IN ('super_admin', 'support_admin')
    `
        );

        for (const adminUser of adminUsersResult.rows) {
            await pool.query(
                `
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_business_id,
            related_request_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
                [
                    adminUser.id,
                    "subscription_request_submitted",
                    "New Subscription Request",
                    `A business submitted a ${requested_plan} subscription request.`,
                    req.user.businessId,
                    createdRequest.id,
                ]
            );
        }

        res.status(201).json(createdRequest);

    } catch (err) {
        console.error("Create subscription request error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/notifications", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "employer" && req.user.role !== "employee") {
            return res.status(403).json({ message: "Access denied" });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                type,
                title,
                message,
                is_read,
                related_business_id,
                related_request_id,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
            `,
            [req.user.userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Employer notifications list error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.put("/notifications/:id/read", requireAuth, async (req, res) => {
    try {
        if (req.user.role !== "employer" && req.user.role !== "employee") {
            return res.status(403).json({ message: "Access denied" });
        }

        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }

        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = true
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [notificationId, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Employer mark notification as read error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports = router;