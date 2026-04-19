const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");
const bcrypt = require("bcrypt");

// GET all users across the platform
router.get(
    "/admin/users",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
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
                    u.is_active,
                    u.created_at
                FROM users u
                LEFT JOIN businesses b ON u.business_id = b.id
                ORDER BY u.created_at DESC
                `
            );

            res.json(result.rows);
        } catch (err) {
            console.error("Admin users list error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// GET all businesses across the platform
router.get(
    "/admin/businesses",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),

    async (req, res) => {
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
                ORDER BY created_at DESC
                `
            );

            res.json(result.rows);
        } catch (err) {
            console.error("Admin businesses list error:", err);
            console.log("DEBUG admin business detail route is running");
            const debugColumns = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
`);
            console.log("DEBUG users columns from route:", debugColumns.rows);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.get(
    "/admin/search",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const q = (req.query.q || "").toString().trim();

            if (!q) {
                return res.json({
                    users: [],
                    businesses: [],
                });
            }

            const like = `%${q}%`;

            const usersResult = await pool.query(
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
                LEFT JOIN businesses b ON u.business_id = b.id
                WHERE
                    u.full_name ILIKE $1
                    OR u.email ILIKE $1
                    OR b.name ILIKE $1
                ORDER BY u.created_at DESC
                LIMIT 25
                `,
                [like]
            );

            const businessesResult = await pool.query(
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
                WHERE name ILIKE $1
                ORDER BY created_at DESC
                LIMIT 25
                `,
                [like]
            );

            res.json({
                users: usersResult.rows,
                businesses: businessesResult.rows,
            });
        } catch (err) {
            console.error("Admin search error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.get(
    "/admin/businesses/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const businessId = Number(req.params.id);

            if (Number.isNaN(businessId)) {
                return res.status(400).json({ message: "Invalid business id" });
            }

            const businessResult = await pool.query(
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
                WHERE id = $1
                `,
                [businessId]
            );

            if (businessResult.rowCount === 0) {
                return res.status(404).json({ message: "Business not found" });
            }

            const usersResult = await pool.query(
                `
                SELECT
                    id,
                    business_id,
                    full_name,
                    email,
                    role,
                    is_active,
                    created_at
                FROM users
                WHERE business_id = $1
                ORDER BY created_at DESC
                `,
                [businessId]
            );

            res.json({
                business: businessResult.rows[0],
                users: usersResult.rows,
            });
        } catch (err) {
            console.error("Admin business detail error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/businesses/:id/subscription",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const businessId = Number(req.params.id);

            if (Number.isNaN(businessId)) {
                return res.status(400).json({ message: "Invalid business id" });
            }

            const {
                subscription_plan,
                subscription_status,
                max_employees,
            } = req.body;

            if (!subscription_plan || !subscription_status) {
                return res.status(400).json({
                    message: "Subscription plan and status are required",
                });
            }

            const parsedMaxEmployees = Number(max_employees);

            if (!Number.isInteger(parsedMaxEmployees) || parsedMaxEmployees < 1) {
                return res.status(400).json({
                    message: "Max employees must be a positive whole number",
                });
            }

            let subscriptionStartedAt = null;
            let subscriptionEndsAt = null;

            if (subscription_status === "active") {
                subscriptionStartedAt = new Date();
                subscriptionEndsAt = new Date();
                subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
            }

            const result = await pool.query(
                `
                UPDATE businesses
                SET
                    subscription_plan = $1,
                    subscription_status = $2,
                    max_employees = $3,
                    subscription_started_at = $4,
                    subscription_ends_at = $5
                WHERE id = $6
                RETURNING
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
                `,
                [
                    subscription_plan,
                    subscription_status,
                    parsedMaxEmployees,
                    subscriptionStartedAt,
                    subscriptionEndsAt,
                    businessId,
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Business not found" });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error("Admin subscription update error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/users/:id/status",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const { is_active } = req.body;


            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (typeof is_active !== "boolean") {
                return res.status(400).json({
                    message: "is_active must be true or false",
                });
            }

            if (req.user.userId === userId && is_active === false) {
                return res.status(400).json({ message: "Admins cannot deactivate themselves" });
            }

            const result = await pool.query(
                `
                UPDATE users
                SET is_active = $1
                WHERE id = $2
                RETURNING id, business_id, full_name, email, role, is_active, created_at
                `,
                [is_active, userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error("Admin update user status error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

const jwt = require("jsonwebtoken");

router.post(
    "/admin/impersonate/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);

            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            const result = await pool.query(
                `
                SELECT
                    u.id,
                    u.business_id,
                    u.email,
                    u.role,
                    u.full_name,
                    u.is_active
                FROM users u
                WHERE u.id = $1
                `,
                [userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(400).json({ message: "Cannot impersonate an inactive user" });
            }

            if (user.role !== "employer" && user.role !== "employee") {
                return res.status(400).json({
                    message: "Only employer and employee accounts can be impersonated",
                });
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    businessId: user.business_id,
                    role: user.role,
                    impersonatedByAdmin: true,
                },
                process.env.JWT_SECRET,
                { expiresIn: "8h" }
            );

            res.json({
                token,
                email: user.email,
                role: user.role,
                userId: user.id,
                full_name: user.full_name,
            });
        } catch (err) {
            console.error("Admin impersonation error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.get(
    "/admin/subscription-requests",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const result = await pool.query(
                `
                SELECT
                    sr.id,
                    sr.business_id,
                    b.name AS business_name,
                    sr.requested_by_user_id,
                    u.full_name AS requested_by_name,
                    u.email AS requested_by_email,
                    sr.requested_plan,
                    sr.requested_max_employees,
                    sr.status,
                    sr.admin_note,
                    sr.reviewed_by_user_id,
                    sr.reviewed_at,
                    sr.created_at
                FROM subscription_requests sr
                JOIN businesses b ON sr.business_id = b.id
                JOIN users u ON sr.requested_by_user_id = u.id
                ORDER BY
                    CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
                    sr.created_at DESC
                `
            );

            res.json(result.rows);
        } catch (err) {
            console.error("Admin list subscription requests error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/subscription-requests/:id/review",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const requestId = Number(req.params.id);
            const { action, admin_note } = req.body;

            if (Number.isNaN(requestId)) {
                return res.status(400).json({ message: "Invalid request id" });
            }

            if (action !== "approve" && action !== "reject") {
                return res.status(400).json({ message: "Action must be approve or reject" });
            }

            const requestResult = await pool.query(
                `
                SELECT *
                FROM subscription_requests
                WHERE id = $1
                `,
                [requestId]
            );

            if (requestResult.rowCount === 0) {
                return res.status(404).json({ message: "Subscription request not found" });
            }

            const requestRow = requestResult.rows[0];

            if (requestRow.status !== "pending") {
                return res.status(400).json({ message: "Request has already been reviewed" });
            }

            if (action === "approve") {
                await pool.query(
                    `
                    UPDATE businesses
                    SET
                        subscription_plan = $1,
                        subscription_status = 'active',
                        max_employees = $2,
                        subscription_started_at = NOW(),
                        subscription_ends_at = NOW() + INTERVAL '30 days'
                    WHERE id = $3
                    `,
                    [
                        requestRow.requested_plan,
                        requestRow.requested_max_employees,
                        requestRow.business_id,
                    ]
                );
            }

            const reviewedStatus = action === "approve" ? "approved" : "rejected";

            const updateResult = await pool.query(
                `
                UPDATE subscription_requests
                SET
                    status = $1,
                    admin_note = $2,
                    reviewed_by_user_id = $3,
                    reviewed_at = NOW()
                WHERE id = $4
                RETURNING *
                `,
                [
                    reviewedStatus,
                    admin_note || null,
                    req.user.userId,
                    requestId,
                ]
            );
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
                        requestRow.requested_by_user_id,
                        action === "approve"
                            ? "subscription_request_approved"
                            : "subscription_request_rejected",
                        action === "approve"
                            ? "Subscription Request Approved"
                            : "Subscription Request Rejected",
                        action === "approve"
                            ? `Your ${requestRow.requested_plan} subscription request was approved.`
                            : `Your ${requestRow.requested_plan} subscription request was rejected.`,
                        requestRow.business_id,
                        requestRow.id,
                    ]
                );

            res.json(updateResult.rows[0]);
        } catch (err) {
            console.error("Admin review subscription request error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.get(
    "/admin/notifications",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
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
            console.error("Admin notifications list error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/notifications/:id/read",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
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
            console.error("Mark notification as read error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);
router.put(
    "/admin/users/:id/status",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const { is_active } = req.body;

            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (typeof is_active !== "boolean") {
                return res.status(400).json({ message: "is_active must be true or false" });
            }

            const result = await pool.query(
                `
                UPDATE users
                SET is_active = $1
                WHERE id = $2
                RETURNING id, business_id, full_name, email, role, is_active, created_at
                `,
                [is_active, userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error("Admin update user status error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/users/:id/password",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const { password } = req.body;

            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (!password || typeof password !== "string" || password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `
                UPDATE users
                SET password_hash = $1
                WHERE id = $2
                RETURNING id, email, full_name, role
                `,
                [hashedPassword, userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                message: "Password updated successfully",
                user: result.rows[0],
            });
        } catch (err) {
            console.error("Admin update user password error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.post(
    "/admin/create-support-admin",
    requireAuth,
    requireRole(["super_admin"]),
    async (req, res) => {
        try {
            const { full_name, email, password } = req.body;

            if (!full_name || !email || !password) {
                return res.status(400).json({
                    message: "full_name, email, and password are required",
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                });
            }

            const existingUser = await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                `,
                [email.trim().toLowerCase()]
            );

            if (existingUser.rowCount > 0) {
                return res.status(400).json({
                    message: "A user with that email already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `
                INSERT INTO users (
                    business_id,
                    full_name,
                    email,
                    password_hash,
                    role,
                    is_active
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, full_name, email, role, is_active, created_at
                `,
                [
                    null,
                    full_name.trim(),
                    email.trim().toLowerCase(),
                    hashedPassword,
                    "support_admin",
                    true,
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error("Create support admin error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/users/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const { full_name, email, role } = req.body;

            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (!full_name || !email || !role) {
                return res.status(400).json({
                    message: "full_name, email, and role are required",
                });
            }

            const allowedRoles = ["employee", "employer", "super_admin", "support_admin"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            if (req.user.role !== "super_admin" && role === "super_admin") {
                return res.status(403).json({
                    message: "Only super admin can assign super admin role",
                });
            }

            const existingUser = await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                  AND id <> $2
                `,
                [email.trim().toLowerCase(), userId]
            );

            if (existingUser.rowCount > 0) {
                return res.status(400).json({
                    message: "Another user with that email already exists",
                });
            }

            const result = await pool.query(
                `
                UPDATE users
                SET
                    full_name = $1,
                    email = $2,
                    role = $3
                WHERE id = $4
                RETURNING
                    id,
                    business_id,
                    full_name,
                    email,
                    role,
                    is_active,
                    created_at
                `,
                [full_name.trim(), email.trim().toLowerCase(), role, userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error("Admin update user error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);
router.delete(
    "/admin/users/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);

            if (Number.isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            // prevent admin from deleting themselves
            if (userId === req.user.userId) {
                return res.status(400).json({
                    message: "You cannot delete your own account",
                });
            }

            // get user info first
            const userCheck = await pool.query(
                `SELECT role FROM users WHERE id = $1`,
                [userId]
            );

            if (userCheck.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const targetRole = userCheck.rows[0].role;

            // only super_admin can delete super_admin
            if (
                targetRole === "super_admin" &&
                req.user.role !== "super_admin"
            ) {
                return res.status(403).json({
                    message: "Only super admin can delete another super admin",
                });
            }

            await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

            res.json({ message: "User deleted successfully" });
        } catch (err) {
            console.error("Delete user error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.put(
    "/admin/businesses/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const businessId = Number(req.params.id);
            const {
                name,
                subscription_plan,
                subscription_status,
                max_employees,
            } = req.body;

            if (Number.isNaN(businessId)) {
                return res.status(400).json({ message: "Invalid business id" });
            }

            if (!name || !subscription_plan || !subscription_status) {
                return res.status(400).json({
                    message: "name, subscription_plan, and subscription_status are required",
                });
            }

            const parsedMaxEmployees = Number(max_employees);
            if (!Number.isInteger(parsedMaxEmployees) || parsedMaxEmployees < 0) {
                return res.status(400).json({
                    message: "max_employees must be a non-negative integer",
                });
            }

            const validPlans = ["free", "basic", "growth", "enterprise", "internal"];
            const validStatuses = ["active", "inactive", "expired", "trial_active", "suspended"];

            if (!validPlans.includes(subscription_plan)) {
                return res.status(400).json({ message: "Invalid subscription plan" });
            }

            if (!validStatuses.includes(subscription_status)) {
                return res.status(400).json({ message: "Invalid subscription status" });
            }

            const result = await pool.query(
                `
                UPDATE businesses
                SET
                    name = $1,
                    subscription_plan = $2,
                    subscription_status = $3,
                    max_employees = $4
                WHERE id = $5
                RETURNING
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
                `,
                [
                    name.trim(),
                    subscription_plan,
                    subscription_status,
                    parsedMaxEmployees,
                    businessId,
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Business not found" });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error("Admin update business error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.delete(
    "/admin/businesses/:id",
    requireAuth,
    requireRole(["super_admin", "support_admin"]),
    async (req, res) => {
        try {
            const businessId = Number(req.params.id);

            if (Number.isNaN(businessId)) {
                return res.status(400).json({ message: "Invalid business id" });
            }

            const businessCheck = await pool.query(
                `
                SELECT id, name
                FROM businesses
                WHERE id = $1
                `,
                [businessId]
            );

            if (businessCheck.rowCount === 0) {
                return res.status(404).json({ message: "Business not found" });
            }

            const linkedUsers = await pool.query(
                `
                SELECT COUNT(*)::int AS count
                FROM users
                WHERE business_id = $1
                `,
                [businessId]
            );

            if (linkedUsers.rows[0].count > 0) {
                return res.status(400).json({
                    message:
                        "Cannot delete this business while users are still assigned to it. Remove or reassign users first.",
                });
            }

            await pool.query(
                `
                DELETE FROM businesses
                WHERE id = $1
                `,
                [businessId]
            );

            res.json({ message: "Business deleted successfully" });
        } catch (err) {
            console.error("Admin delete business error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

module.exports = router;