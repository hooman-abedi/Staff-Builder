const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../index");
const pool = require("../db");

describe("Auth route", () => {
    const testEmail = "vitest-auth@test.com";
    const testPassword = "test1234";
    let createdUserId = null;

    beforeAll(async () => {
        await pool.query(`DELETE FROM users WHERE email = $1`, [testEmail]);

        const hashedPassword = await bcrypt.hash(testPassword, 10);

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
        RETURNING id
        `,
            [
                null,
                "Vitest Auth User",
                testEmail,
                hashedPassword,
                "support_admin",
                true,
            ]
        );

        createdUserId = result.rows[0].id;
    });

    afterAll(async () => {
        if (createdUserId) {
            await pool.query(`DELETE FROM users WHERE id = $1`, [createdUserId]);
        }
    });

    test("POST /api/auth/login logs in with valid credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: testPassword,
                role: "support_admin",
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    test("POST /api/auth/login rejects wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "wrongpassword",
                role: "support_admin",
            });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});