import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { getSubscriptionStatus } from "../lib/getSubscriptionStatus";

describe("getSubscriptionStatus", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test("returns 401-style result when token is missing", async () => {
        const result = await getSubscriptionStatus("http://localhost:5050", null);

        expect(result.ok).toBe(false);

        if (!result.ok) {
            expect(result.status).toBe(401);
            expect(result.message).toMatch(/missing token/i);
        }
    });

    test("returns successful subscription data when fetch succeeds", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: async () => ({
                        id: 1,
                        name: "Test Business",
                        subscription_plan: "enterprise",
                        subscription_status: "active",
                        effective_status: "active",
                        trial_started_at: null,
                        trial_ends_at: null,
                        max_employees: 100,
                        subscription_started_at: null,
                        subscription_ends_at: null,
                    }),
                } as Response)
            ) as typeof fetch
        );

        const result = await getSubscriptionStatus(
            "http://localhost:5050",
            "fake-token"
        );

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.data.name).toBe("Test Business");
            expect(result.data.subscription_plan).toBe("enterprise");
            expect(result.data.effective_status).toBe("active");
        }
    });

    test("returns failure result when fetch returns non-ok response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 500,
                    json: async () => ({
                        message: "Failed to load subscription status",
                    }),
                } as Response)
            ) as typeof fetch
        );

        const result = await getSubscriptionStatus(
            "http://localhost:5050",
            "fake-token"
        );

        expect(result.ok).toBe(false);

        if (!result.ok) {
            expect(result.status).toBe(500);
            expect(result.message).toMatch(/failed to load subscription status/i);
        }
    });
});