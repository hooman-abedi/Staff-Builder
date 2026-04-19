import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import EmployerDashboardPage from "../pages/employer/EmployerHomePage";

describe("EmployerDashboardPage", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("token", "fake-token");
        localStorage.setItem("role", "employer");
        localStorage.setItem("email", "owner@test.com");

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
            )
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test("renders employer dashboard core actions and sections", async () => {
        render(
            <BrowserRouter>
                <EmployerDashboardPage />
            </BrowserRouter>
        );

        expect(
            await screen.findByRole("heading", { name: /business details/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /manage subscription/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /edit business details/i })
        ).toBeInTheDocument();

        expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
        expect(screen.getByText(/^employees$/i)).toBeInTheDocument();
        expect(screen.getByText(/^training$/i)).toBeInTheDocument();
        expect(screen.getByText(/^progress$/i)).toBeInTheDocument();
        expect(screen.getByText(/membership summary/i)).toBeInTheDocument();
        expect(screen.getByText(/account actions/i)).toBeInTheDocument();
    });
});