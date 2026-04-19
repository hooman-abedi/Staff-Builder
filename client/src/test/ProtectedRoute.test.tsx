import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

function AdminPageMock() {
    return <div>Admin Secret Page</div>;
}

function LoginPageMock() {
    return <div>Login Page</div>;
}

describe("ProtectedRoute", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("redirects employee away from admin route", () => {
        localStorage.setItem("token", "fake-token");
        localStorage.setItem("role", "employee");

        render(
            <MemoryRouter initialEntries={["/admin"]}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                <AdminPageMock />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPageMock />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });

    test("allows super admin into admin route", () => {
        localStorage.setItem("token", "fake-token");
        localStorage.setItem("role", "super_admin");

        render(
            <MemoryRouter initialEntries={["/admin"]}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                <AdminPageMock />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPageMock />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/admin secret page/i)).toBeInTheDocument();
    });
});