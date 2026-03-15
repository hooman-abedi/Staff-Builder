import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const [role, setRole] = useState("employer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("email", data.user.email);

            if (data.user.role === "employer") {
                navigate("/employer");
            } else {
                navigate("/employee");
            }
        } catch (err) {
            console.error("login error:", err);
            setError("Something went wrong while logging in");
        }
    }

    return (
        <div style={{ padding: 24, maxWidth: 500 }}>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Login as
                        <br />
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="employer">Employer</option>
                            <option value="employee">Employee</option>
                        </select>
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        Email
                        <br />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        Password
                        <br />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </label>
                </div>

                <button type="submit">Login</button>
            </form>

            {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}
        </div>
    );
}

export default LoginPage;