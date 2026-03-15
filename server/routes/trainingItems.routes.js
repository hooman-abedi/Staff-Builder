const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");

// GET training items for one folder
router.get("/training-items", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { folder_id } = req.query;

        if (folder_id === undefined) {
            return res.status(400).json({ message: "folder_id is required" });
        }

        const folderId = Number(folder_id);

        if (!Number.isInteger(folderId)) {
            return res.status(400).json({ message: "folder_id must be a number" });
        }

        const result = await pool.query(
            `SELECT id, business_id, folder_id, type, title, url, file_path, body, created_at
       FROM training_items
       WHERE business_id = $1 AND folder_id = $2
       ORDER BY created_at DESC`,
            [req.user.businessId, folderId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching training items:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST create text/link training item
router.post("/training-items", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const { folder_id, type, title, url, body } = req.body;

        const folderId = Number(folder_id);

        if (!Number.isInteger(folderId)) {
            return res.status(400).json({ message: "folder_id must be a number" });
        }

        if (!type || typeof type !== "string") {
            return res.status(400).json({ message: "type is required" });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "title is required" });
        }

        const folderCheck = await pool.query(
            `SELECT id
       FROM folders
       WHERE id = $1 AND business_id = $2`,
            [folderId, req.user.businessId]
        );

        if (folderCheck.rowCount === 0) {
            return res.status(404).json({ message: "Folder not found in this business" });
        }

        const result = await pool.query(
            `INSERT INTO training_items (business_id, folder_id, type, title, url, file_path, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, business_id, folder_id, type, title, url, file_path, body, created_at`,
            [
                req.user.businessId,
                folderId,
                type.trim(),
                title.trim(),
                url ?? null,
                null,
                body ?? null,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating training item:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST upload training item file
router.post(
    "/training-items/upload",
    requireAuth,
    requireRole("employer"),
    upload.single("file"),
    async (req, res) => {
        try {
            const { folder_id, type, title, body } = req.body;

            const folderId = Number(folder_id);

            if (!Number.isInteger(folderId)) {
                return res.status(400).json({ message: "folder_id must be a number" });
            }

            if (!type || typeof type !== "string") {
                return res.status(400).json({ message: "type is required" });
            }

            if (!title || typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "title is required" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const folderCheck = await pool.query(
                `SELECT id
         FROM folders
         WHERE id = $1 AND business_id = $2`,
                [folderId, req.user.businessId]
            );

            if (folderCheck.rowCount === 0) {
                return res.status(404).json({ message: "Folder not found in this business" });
            }

            const filePath = `/uploads/${req.file.filename}`;

            const result = await pool.query(
                `INSERT INTO training_items (business_id, folder_id, type, title, url, file_path, body)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, business_id, folder_id, type, title, url, file_path, body, created_at`,
                [
                    req.user.businessId,
                    folderId,
                    type.trim(),
                    title.trim(),
                    null,
                    filePath,
                    body ?? null,
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error("Error uploading training item:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// PUT update text/link training item
router.put("/training-items/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const { folder_id, type, title, url, file_path, body } = req.body;

        const folderId = Number(folder_id);

        if (!Number.isInteger(folderId)) {
            return res.status(400).json({ message: "folder_id must be a number" });
        }

        if (!type || typeof type !== "string") {
            return res.status(400).json({ message: "type is required" });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "title is required" });
        }

        const result = await pool.query(
            `UPDATE training_items
       SET folder_id = $1,
           type = $2,
           title = $3,
           url = $4,
           file_path = $5,
           body = $6
       WHERE id = $7 AND business_id = $8
       RETURNING id, business_id, folder_id, type, title, url, file_path, body, created_at`,
            [
                folderId,
                type.trim(),
                title.trim(),
                url ?? null,
                file_path ?? null,
                body ?? null,
                id,
                req.user.businessId,
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Training item not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating training item:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT replace uploaded file
router.put(
    "/training-items/:id/upload",
    requireAuth,
    requireRole("employer"),
    upload.single("file"),
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: "Invalid id" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const { title } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({ message: "title is required" });
            }

            const existingResult = await pool.query(
                `SELECT id, file_path
         FROM training_items
         WHERE id = $1 AND business_id = $2`,
                [id, req.user.businessId]
            );

            if (existingResult.rowCount === 0) {
                return res.status(404).json({ message: "Training item not found" });
            }

            const existingItem = existingResult.rows[0];
            const newFilePath = `/uploads/${req.file.filename}`;

            const updateResult = await pool.query(
                `UPDATE training_items
         SET title = $1,
             file_path = $2
         WHERE id = $3 AND business_id = $4
         RETURNING id, business_id, folder_id, type, title, url, file_path, body, created_at`,
                [title.trim(), newFilePath, id, req.user.businessId]
            );

            if (existingItem.file_path) {
                const oldAbsolutePath = path.join(__dirname, "..", existingItem.file_path);

                fs.unlink(oldAbsolutePath, (err) => {
                    if (err) {
                        console.error("Failed to delete old file:", err.message);
                    }
                });
            }

            res.json(updateResult.rows[0]);
        } catch (err) {
            console.error("Error replacing training item file:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// DELETE training item
router.delete("/training-items/:id", requireAuth, requireRole("employer"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const existingResult = await pool.query(
            `SELECT id, file_path
       FROM training_items
       WHERE id = $1 AND business_id = $2`,
            [id, req.user.businessId]
        );

        if (existingResult.rowCount === 0) {
            return res.status(404).json({ message: "Training item not found" });
        }

        const existingItem = existingResult.rows[0];

        const result = await pool.query(
            `DELETE FROM training_items
       WHERE id = $1 AND business_id = $2
       RETURNING id`,
            [id, req.user.businessId]
        );

        if (existingItem.file_path) {
            const absolutePath = path.join(__dirname, "..", existingItem.file_path);

            fs.unlink(absolutePath, (err) => {
                if (err) {
                    console.error("Failed to delete uploaded file:", err.message);
                }
            });
        }

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Error deleting training item:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;