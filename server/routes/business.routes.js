const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const pool = require("../db");

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

module.exports = router;