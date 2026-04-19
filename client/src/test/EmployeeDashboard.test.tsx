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

describe("EmployeeDashboard", () => {
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
                        ok: true,
                        status: 200,
                        json: async () => [
                            {
                                id: 1,
                                business_id: 1,
                                name: "Manager Training",
                                description: "Manager onboarding category",
                                created_at: "2026-04-17T00:00:00.000Z",
                            },
                        ],
                    } as Response);
                }

                if (urlString.includes("/api/employee/completions")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => [
                            {
                                id: 1,
                                business_id: 1,
                                user_id: 12,
                                training_item_id: 4,
                                completed_at: "2026-04-17T00:00:00.000Z",
                                training_item_title: "Opening Checklist",
                                training_item_type: "document",
                            },
                        ],
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

    test("renders employee dashboard categories and completions", async () => {
        render(
            <BrowserRouter>
                <EmployeeDashboard />
            </BrowserRouter>
        );

        expect(
            await screen.findByRole("heading", { name: /assigned categories/i })
        ).toBeInTheDocument();

        expect(screen.getByText(/manager training/i)).toBeInTheDocument();
        expect(screen.getByText(/opening checklist/i)).toBeInTheDocument();
        expect(screen.getByText(/my completed items/i)).toBeInTheDocument();
    });
});