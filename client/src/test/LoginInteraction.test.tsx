import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

describe("LoginPage interaction", () => {
    test("user can type into email and password fields", async () => {
        const user = userEvent.setup();

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const emailInput =
            screen.queryByPlaceholderText(/email/i) ||
            screen.getByLabelText(/email/i);

        const passwordInput =
            screen.queryByPlaceholderText(/password/i) ||
            screen.getByLabelText(/password/i);

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "test1234");

        expect(emailInput).toHaveValue("test@example.com");
        expect(passwordInput).toHaveValue("test1234");
    });

    test("login button is present", () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
});