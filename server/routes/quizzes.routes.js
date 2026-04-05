const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const pool = require("../db");
const { requireActiveSubscription } = require("../middleware/subscription");

// POST create quiz for a folder
router.post("/quizzes", requireAuth, requireRole("employer"), requireActiveSubscription, async (req, res) => {
    try {
        const { folder_id, title, passing_score } = req.body;

        if (!folder_id || !Number.isInteger(Number(folder_id))) {
            return res.status(400).json({ message: "Valid folder_id is required" });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "title is required" });
        }

        const passingScoreValue =
            passing_score === undefined || passing_score === null
                ? 70
                : Number(passing_score);

        if (!Number.isInteger(passingScoreValue) || passingScoreValue < 0 || passingScoreValue > 100) {
            return res.status(400).json({ message: "passing_score must be an integer between 0 and 100" });
        }

        const folderCheck = await pool.query(
            `
            SELECT id, business_id
            FROM folders
            WHERE id = $1 AND business_id = $2
            `,
            [Number(folder_id), req.user.businessId]
        );

        if (folderCheck.rowCount === 0) {
            return res.status(404).json({ message: "Folder not found" });
        }

        const result = await pool.query(
            `
            INSERT INTO quizzes (business_id, folder_id, title, passing_score)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [req.user.businessId, Number(folder_id), title.trim(), passingScoreValue]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Create quiz error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET quizzes for one folder
router.get("/quizzes", requireAuth, async (req, res) => {
    try {
        const { folder_id } = req.query;

        if (!folder_id || !Number.isInteger(Number(folder_id))) {
            return res.status(400).json({ message: "Valid folder_id is required" });
        }

        const result = await pool.query(
            `
            SELECT *
            FROM quizzes
            WHERE folder_id = $1 AND business_id = $2
            ORDER BY created_at DESC
            `,
            [Number(folder_id), req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Get quizzes error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET one quiz with questions and choices
router.get("/quizzes/:id", requireAuth, async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({ message: "Invalid quiz id" });
        }

        const quizResult = await pool.query(
            `
            SELECT *
            FROM quizzes
            WHERE id = $1 AND business_id = $2
            `,
            [quizId, req.user.businessId]
        );

        if (quizResult.rowCount === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const questionsResult = await pool.query(
            `
            SELECT *
            FROM quiz_questions
            WHERE quiz_id = $1
            ORDER BY question_order ASC, id ASC
            `,
            [quizId]
        );

        const questionIds = questionsResult.rows.map((q) => q.id);

        let choices = [];
        if (questionIds.length > 0) {
            const choicesResult = await pool.query(
                `
                SELECT *
                FROM quiz_choices
                WHERE question_id = ANY($1::int[])
                ORDER BY id ASC
                `,
                [questionIds]
            );
            choices = choicesResult.rows;
        }

        const questionsWithChoices = questionsResult.rows.map((question) => ({
            ...question,
            choices: choices.filter((choice) => choice.question_id === question.id),
        }));

        res.json({
            quiz: quizResult.rows[0],
            questions: questionsWithChoices,
        });
    } catch (err) {
        console.error("Get quiz details error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST add question to quiz
router.post("/quizzes/:id/questions", requireAuth, requireRole("employer"), requireActiveSubscription, async (req, res) => {
    try {
        const quizId = Number(req.params.id);
        const { question_text, question_type, question_order } = req.body;

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({ message: "Invalid quiz id" });
        }

        if (!question_text || typeof question_text !== "string" || !question_text.trim()) {
            return res.status(400).json({ message: "question_text is required" });
        }

        if (!["multiple_choice", "blank"].includes(question_type)) {
            return res.status(400).json({ message: "question_type must be multiple_choice or blank" });
        }

        if (!Number.isInteger(Number(question_order))) {
            return res.status(400).json({ message: "question_order must be an integer" });
        }

        const quizCheck = await pool.query(
            `
            SELECT id
            FROM quizzes
            WHERE id = $1 AND business_id = $2
            `,
            [quizId, req.user.businessId]
        );

        if (quizCheck.rowCount === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const result = await pool.query(
            `
            INSERT INTO quiz_questions (quiz_id, question_text, question_type, question_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [quizId, question_text.trim(), question_type, Number(question_order)]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Create quiz question error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST add choice to a multiple-choice question
router.post("/quiz-questions/:id/choices", requireAuth, requireRole("employer"), requireActiveSubscription, async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const { choice_text, is_correct } = req.body;

        if (!Number.isInteger(questionId)) {
            return res.status(400).json({ message: "Invalid question id" });
        }

        if (!choice_text || typeof choice_text !== "string" || !choice_text.trim()) {
            return res.status(400).json({ message: "choice_text is required" });
        }

        const questionCheck = await pool.query(
            `
            SELECT qq.*, q.business_id
            FROM quiz_questions qq
            JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = $1 AND q.business_id = $2
            `,
            [questionId, req.user.businessId]
        );

        if (questionCheck.rowCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        const question = questionCheck.rows[0];

        if (!["multiple_choice", "blank"].includes(question.question_type)) {
            return res.status(400).json({ message: "Choices can only be added to multiple_choice or blank questions" });
        }

        const result = await pool.query(
            `
            INSERT INTO quiz_choices (question_id, choice_text, is_correct)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [questionId, choice_text.trim(), Boolean(is_correct)]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Create quiz choice error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// GET one quiz for employee
router.get("/employee/quizzes/:id", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({ message: "Invalid quiz id" });
        }

        const quizResult = await pool.query(
            `
            SELECT q.*
            FROM quizzes q
            JOIN employee_category_assignments a ON a.business_id = q.business_id
            JOIN folders f ON f.id = q.folder_id
            WHERE q.id = $1
              AND a.user_id = $2
              AND a.business_id = $3
              AND a.staff_category_id = f.staff_category_id
              AND q.is_active = TRUE
            `,
            [quizId, req.user.userId, req.user.businessId]
        );

        if (quizResult.rowCount === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const questionsResult = await pool.query(
            `
            SELECT *
            FROM quiz_questions
            WHERE quiz_id = $1
            ORDER BY question_order ASC, id ASC
            `,
            [quizId]
        );

        const questionIds = questionsResult.rows.map((q) => q.id);

        let choices = [];
        if (questionIds.length > 0) {
            const choicesResult = await pool.query(
                `
                SELECT id, question_id, choice_text
                FROM quiz_choices
                WHERE question_id = ANY($1::int[])
                ORDER BY id ASC
                `,
                [questionIds]
            );
            choices = choicesResult.rows;
        }

        const questionsWithChoices = questionsResult.rows.map((question) => ({
            ...question,
            choices: choices.filter((choice) => choice.question_id === question.id),
        }));

        res.json({
            quiz: quizResult.rows[0],
            questions: questionsWithChoices,
        });
    } catch (err) {
        console.error("Get employee quiz error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET all quizzes available in one folder for employee
router.get("/employee/quizzes", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const { folder_id } = req.query;

        if (!folder_id || !Number.isInteger(Number(folder_id))) {
            return res.status(400).json({ message: "Valid folder_id is required" });
        }

        const accessCheck = await pool.query(
            `
            SELECT f.id
            FROM folders f
            JOIN employee_category_assignments a ON a.staff_category_id = f.staff_category_id
            WHERE f.id = $1
              AND a.user_id = $2
              AND f.business_id = $3
            `,
            [Number(folder_id), req.user.userId, req.user.businessId]
        );

        if (accessCheck.rowCount === 0) {
            return res.json([]);
        }

        const result = await pool.query(
            `
            SELECT *
            FROM quizzes
            WHERE folder_id = $1
              AND business_id = $2
              AND is_active = TRUE
            ORDER BY created_at DESC
            `,
            [Number(folder_id), req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Get employee folder quizzes error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// GET quiz attempts for logged-in employee
router.get("/employee/quiz-attempts", requireAuth, requireRole("employee"), async (req, res) => {
    try {
        const { quiz_id } = req.query;

        if (!quiz_id || !Number.isInteger(Number(quiz_id))) {
            return res.status(400).json({ message: "Valid quiz_id is required" });
        }

        const result = await pool.query(
            `
            SELECT *
            FROM quiz_attempts
            WHERE quiz_id = $1
              AND user_id = $2
              AND business_id = $3
            ORDER BY attempt_number DESC, started_at DESC
            `,
            [Number(quiz_id), req.user.userId, req.user.businessId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Get employee quiz attempts error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST submit quiz attempt
router.post("/employee/quizzes/:id/submit", requireAuth, requireRole("employee"), async (req, res) => {
    const client = await pool.connect();

    try {
        const quizId = Number(req.params.id);
        const { answers } = req.body;

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({ message: "Invalid quiz id" });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "answers array is required" });
        }

        const quizAccessResult = await client.query(
            `
            SELECT q.*
            FROM quizzes q
            JOIN folders f ON f.id = q.folder_id
            JOIN employee_category_assignments a ON a.staff_category_id = f.staff_category_id
            WHERE q.id = $1
              AND q.business_id = $2
              AND a.user_id = $3
              AND a.business_id = $2
              AND q.is_active = TRUE
            `,
            [quizId, req.user.businessId, req.user.userId]
        );

        if (quizAccessResult.rowCount === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quiz = quizAccessResult.rows[0];

        const questionsResult = await client.query(
            `
            SELECT *
            FROM quiz_questions
            WHERE quiz_id = $1
            ORDER BY question_order ASC, id ASC
            `,
            [quizId]
        );

        const questions = questionsResult.rows;

        if (questions.length === 0) {
            return res.status(400).json({ message: "Quiz has no questions" });
        }

        const questionIds = questions.map((q) => q.id);

        const choicesResult = await client.query(
            `
            SELECT *
            FROM quiz_choices
            WHERE question_id = ANY($1::int[])
            ORDER BY id ASC
            `,
            [questionIds]
        );

        const choices = choicesResult.rows;

        const nextAttemptResult = await client.query(
            `
            SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt
            FROM quiz_attempts
            WHERE quiz_id = $1
              AND user_id = $2
              AND business_id = $3
            `,
            [quizId, req.user.userId, req.user.businessId]
        );

        const attemptNumber = Number(nextAttemptResult.rows[0].next_attempt);

        await client.query("BEGIN");

        const attemptInsertResult = await client.query(
            `
            INSERT INTO quiz_attempts (business_id, quiz_id, user_id, attempt_number, score, passed, started_at, completed_at)
            VALUES ($1, $2, $3, $4, 0, FALSE, NOW(), NOW())
            RETURNING *
            `,
            [req.user.businessId, quizId, req.user.userId, attemptNumber]
        );

        const attempt = attemptInsertResult.rows[0];

        let correctCount = 0;

        for (const question of questions) {
            const submittedAnswer = answers.find(
                (answer) => Number(answer.question_id) === question.id
            );

            let isCorrect = false;
            let selectedChoiceId = null;
            let answerText = null;

            if (submittedAnswer) {
                if (question.question_type === "multiple_choice") {
                    const submittedChoiceIds = Array.isArray(submittedAnswer.selected_choice_ids)
                        ? submittedAnswer.selected_choice_ids.map((id) => Number(id)).filter(Number.isInteger)
                        : submittedAnswer.selected_choice_id
                            ? [Number(submittedAnswer.selected_choice_id)]
                            : [];

                    const correctChoiceIds = choices
                        .filter(
                            (choice) =>
                                choice.question_id === question.id && choice.is_correct
                        )
                        .map((choice) => choice.id)
                        .sort((a, b) => a - b);

                    const selectedSorted = [...submittedChoiceIds].sort((a, b) => a - b);

                    isCorrect =
                        selectedSorted.length === correctChoiceIds.length &&
                        selectedSorted.every((value, index) => value === correctChoiceIds[index]);

                    answerText = JSON.stringify(submittedChoiceIds);
                    selectedChoiceId = submittedChoiceIds.length === 1 ? submittedChoiceIds[0] : null;
                } else if (question.question_type === "blank") {
                    answerText =
                        typeof submittedAnswer.answer_text === "string"
                            ? submittedAnswer.answer_text.trim()
                            : "";

                    const correctChoicesForBlank = choices.filter(
                        (choice) =>
                            choice.question_id === question.id && choice.is_correct
                    );

                    const normalizedAnswer = answerText.toLowerCase();

                    if (
                        correctChoicesForBlank.some(
                            (choice) =>
                                choice.choice_text.trim().toLowerCase() === normalizedAnswer
                        )
                    ) {
                        isCorrect = true;
                    }
                }
            }
            if (isCorrect) {
                correctCount += 1;
            }

            await client.query(
                `
                INSERT INTO quiz_answers (attempt_id, question_id, selected_choice_id, answer_text, is_correct)
                VALUES ($1, $2, $3, $4, $5)
                `,
                [attempt.id, question.id, selectedChoiceId, answerText, isCorrect]
            );
        }

        const score = Number(((correctCount / questions.length) * 100).toFixed(2));
        const passed = score >= Number(quiz.passing_score);

        const updatedAttemptResult = await client.query(
            `
            UPDATE quiz_attempts
            SET score = $1,
                passed = $2,
                completed_at = NOW()
            WHERE id = $3
            RETURNING *
            `,
            [score, passed, attempt.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            attempt: updatedAttemptResult.rows[0],
            summary: {
                total_questions: questions.length,
                correct_answers: correctCount,
                score,
                passed,
                passing_score: Number(quiz.passing_score),
            },
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Submit employee quiz error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        client.release();
    }
});
// PUT update quiz question
router.put("/quiz-questions/:id", requireAuth, requireRole("employer"), requireActiveSubscription,async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const { question_text, question_type, question_order } = req.body;

        if (!Number.isInteger(questionId)) {
            return res.status(400).json({ message: "Invalid question id" });
        }

        if (!question_text || typeof question_text !== "string" || !question_text.trim()) {
            return res.status(400).json({ message: "question_text is required" });
        }

        if (!["multiple_choice", "blank"].includes(question_type)) {
            return res.status(400).json({ message: "question_type must be multiple_choice or blank" });
        }

        if (!Number.isInteger(Number(question_order))) {
            return res.status(400).json({ message: "question_order must be an integer" });
        }

        const check = await pool.query(
            `
            SELECT qq.id
            FROM quiz_questions qq
            JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = $1
              AND q.business_id = $2
            `,
            [questionId, req.user.businessId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        const result = await pool.query(
            `
            UPDATE quiz_questions
            SET question_text = $1,
                question_type = $2,
                question_order = $3
            WHERE id = $4
            RETURNING *
            `,
            [question_text.trim(), question_type, Number(question_order), questionId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Update question error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE quiz question
router.delete("/quiz-questions/:id", requireAuth, requireRole("employer"), requireActiveSubscription, async (req, res) => {
    try {
        const questionId = Number(req.params.id);

        if (!Number.isInteger(questionId)) {
            return res.status(400).json({ message: "Invalid question id" });
        }

        const check = await pool.query(
            `
            SELECT qq.id
            FROM quiz_questions qq
            JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = $1
              AND q.business_id = $2
            `,
            [questionId, req.user.businessId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        const result = await pool.query(
            `
            DELETE FROM quiz_questions
            WHERE id = $1
            RETURNING id
            `,
            [questionId]
        );

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Delete question error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT update quiz choice
router.put("/quiz-choices/:id", requireAuth, requireRole("employer"), requireActiveSubscription,async (req, res) => {
    try {
        const choiceId = Number(req.params.id);
        const { choice_text, is_correct } = req.body;

        if (!Number.isInteger(choiceId)) {
            return res.status(400).json({ message: "Invalid choice id" });
        }

        if (!choice_text || typeof choice_text !== "string" || !choice_text.trim()) {
            return res.status(400).json({ message: "choice_text is required" });
        }

        const check = await pool.query(
            `
            SELECT qc.id
            FROM quiz_choices qc
            JOIN quiz_questions qq ON qq.id = qc.question_id
            JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qc.id = $1
              AND q.business_id = $2
            `,
            [choiceId, req.user.businessId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ message: "Choice not found" });
        }

        const result = await pool.query(
            `
            UPDATE quiz_choices
            SET choice_text = $1,
                is_correct = $2
            WHERE id = $3
            RETURNING *
            `,
            [choice_text.trim(), Boolean(is_correct), choiceId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Update choice error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE quiz choice
router.delete("/quiz-choices/:id", requireAuth, requireRole("employer"), requireActiveSubscription,async (req, res) => {
    try {
        const choiceId = Number(req.params.id);

        if (!Number.isInteger(choiceId)) {
            return res.status(400).json({ message: "Invalid choice id" });
        }

        const check = await pool.query(
            `
            SELECT qc.id
            FROM quiz_choices qc
            JOIN quiz_questions qq ON qq.id = qc.question_id
            JOIN quizzes q ON q.id = qq.quiz_id
            WHERE qc.id = $1
              AND q.business_id = $2
            `,
            [choiceId, req.user.businessId]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ message: "Choice not found" });
        }

        const result = await pool.query(
            `
            DELETE FROM quiz_choices
            WHERE id = $1
            RETURNING id
            `,
            [choiceId]
        );

        res.json({ deletedId: result.rows[0].id });
    } catch (err) {
        console.error("Delete choice error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;