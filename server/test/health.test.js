const request = require("supertest");
const app = require("../index");

describe("Health route", () => {
    test("GET /api/health returns ok response", async () => {
        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status");
    });
});