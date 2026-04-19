import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import EmployeeFolderPage from "../pages/employee/EmployeeFolderPage";

describe("EmployeeFolderPage", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("token", "fake-token");
        localStorage.setItem("role", "employee");
        localStorage.setItem("email", "employee@test.com");

        vi.stubGlobal(
            "fetch",
            vi.fn((url: RequestInfo | URL) => {
                const urlString = String(url);

                if (urlString.includes("/api/employee/my-training-items?folder_id=3")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => [
                            {
                                id: 4,
                                business_id: 1,
                                folder_id: 3,
                                type: "document",
                                title: "Opening Checklist",
                                url: null,
                                file_path: "/uploads/opening-checklist.pdf",
                                body: null,
                                created_at: "2026-04-17T00:00:00.000Z",
                            },
                        ],
                    } as Response);
                }

                if (urlString.includes("/api/employee/completions")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => [],
                    } as Response);
                }

                if (urlString.includes("/api/employee/quizzes?folder_id=3")) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: async () => [
                            {
                                id: 11,
                                title: "Opening Quiz",
                                passing_score: 70,
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

    test("renders training items, quiz, and mark complete action", async () => {
        render(
            <MemoryRouter initialEntries={["/employee/folder/3"]}>
                <Routes>
                    <Route path="/employee/folder/:id" element={<EmployeeFolderPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            await screen.findByRole("heading", { name: /folder contents/i })
        ).toBeInTheDocument();

        expect(screen.getByText(/opening checklist/i)).toBeInTheDocument();
        expect(screen.getByText(/opening quiz/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /mark complete/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /take quiz/i })
        ).toBeInTheDocument();
    });
});