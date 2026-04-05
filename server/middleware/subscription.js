const pool = require("../db");

async function requireActiveSubscription(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.role === "super_admin" || req.user.role === "support_admin") {
            return next();
        }

        if (req.user.role !== "employer") {
            return next();
        }

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

        if (effectiveStatus !== "trial_active" && effectiveStatus !== "active") {
            return res.status(403).json({
                message: "Your subscription has expired. Please renew to continue using employer management features.",
            });
        }

        req.businessSubscription = {
            ...business,
            effective_status: effectiveStatus,
        };

        next();
    } catch (err) {
        console.error("Subscription guard error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { requireActiveSubscription };