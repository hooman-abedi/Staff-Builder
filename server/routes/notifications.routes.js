const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const pool = require("../db");

router.get("/notifications", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                title,
                message,
                type,
                is_read,
                related_entity_type,
                related_entity_id,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
            `,
            [req.user.userId]
        );

        res.set("Cache-Control", "no-store");
        res.json(result.rows);
    } catch (err) {
        console.error("Get notifications error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/notifications/unread-count", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT COUNT(*)::int AS unread_count
            FROM notifications
            WHERE user_id = $1
              AND is_read = FALSE
            `,
            [req.user.userId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Get unread notifications count error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/notifications/:id/read", requireAuth, async (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ message: "Invalid notification id" });
        }

        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
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
});

router.put("/notifications/read-all", requireAuth, async (req, res) => {
    try {
        await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1
              AND is_read = FALSE
            `,
            [req.user.userId]
        );

        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Mark all notifications as read error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;