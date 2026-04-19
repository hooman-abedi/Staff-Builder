import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../lib/getSubscriptionStatus", () => ({
    getSubscriptionStatus: vi.fn(() =>
        Promise.resolve({
            ok: true,
            data: {
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
            },
        })
    ),
}));

import EmployeeDashboard from "../pages/EmployeeDashboard";

describe("EmployeeDashboard error handling", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("token", "fake-token");
        localStorage.setItem("role", "employee");
        localStorage.setItem("email", "employee@test.com");

        vi.stubGlobal(
            "fetch",
            vi.fn((url: RequestInfo | URL) => {
                const urlString = String(url);

                if (urlString.includes("/api/employee/my-categories")) {
                    return Promise.resolve({
                        ok: false,
                        status: 500,
                        json: async () => ({
                            message: "Failed to load categories",
                        }),
                    } as Response);
                }

                if (urlString.includes("/api/employee/completions")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => [],
                    } as Response);
                }

                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: async () => [],
                } as Response);
            }) as typeof fetch
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test("shows error message when categories fail to load", async () => {
        render(
            <BrowserRouter>
                <EmployeeDashboard />
            </BrowserRouter>
        );

        expect(
            await screen.findByText(/failed to load categories/i)
        ).toBeInTheDocument();
    });
});