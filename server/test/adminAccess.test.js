const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../index");
const pool = require("../db");

describe("Admin access control", () => {
    const supportAdminEmail = "vitest-support-admin@test.com";
    const employeeEmail = "vitest-employee@test.com";

    let supportAdminId = null;
    let employeeId = null;

    let supportAdminToken = "";
    let employeeToken = "";

    beforeAll(async () => {
        await pool.query(`DELETE FROM users WHERE email IN ($1, $2)`, [
            supportAdminEmail,
            employeeEmail,
        ]);

        const hashedPassword = await bcrypt.hash("test1234", 10);

        const supportAdminResult = await pool.query(
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
            RETURNING id, role
            `,
            [
                null,
                "Vitest Support Admin",
                supportAdminEmail,
                hashedPassword,
                "support_admin",
                true,
            ]
        );

        supportAdminId = supportAdminResult.rows[0].id;

        const employeeResult = await pool.query(
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
            RETURNING id, role
            `,
            [
                1,
                "Vitest Employee",
                employeeEmail,
                hashedPassword,
                "employee",
                true,
            ]
        );

        employeeId = employeeResult.rows[0].id;

        supportAdminToken = jwt.sign(
            {
                userId: supportAdminId,
                role: "support_admin",
                businessId: null,
                email: supportAdminEmail,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        employeeToken = jwt.sign(
            {
                userId: employeeId,
                role: "employee",
                businessId: 1,
                email: employeeEmail,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    });

    afterAll(async () => {
        if (supportAdminId) {
            await pool.query(`DELETE FROM users WHERE id = $1`, [supportAdminId]);
        }

        if (employeeId) {
            await pool.query(`DELETE FROM users WHERE id = $1`, [employeeId]);
        }
    });

    test("support_admin can access admin businesses route", async () => {
        const res = await request(app)
            .get("/api/admin/businesses")
            .set("Authorization", `Bearer ${supportAdminToken}`);

        expect(res.status).toBe(200);
    });

    test("employee cannot access admin businesses route", async () => {
        const res = await request(app)
            .get("/api/admin/businesses")
            .set("Authorization", `Bearer ${employeeToken}`);

        expect(res.status).toBe(403);
    });
});