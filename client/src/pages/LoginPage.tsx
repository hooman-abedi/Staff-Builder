import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const [role, setRole] = useState("employer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    function isValidEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setError("Email is required.");
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                    role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed.");
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
            console.error("Login error:", err);
            setError("Something went wrong while logging in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                <div>
                    <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                        Access your training workspace
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Login and continue building or completing training.
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                        Employers can manage staff training, assignments, folders, and progress.
                        Employees can access assigned learning and mark training as completed.
                    </p>

                    <div className="mt-8 space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                            <h3 className="font-semibold text-white">Use the right account type</h3>
                            <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                <li>• Employer: manage staff, folders, files, and progress</li>
                                <li>• Employee: view assigned training and complete lessons</li>
                            </ul>
                        </div>

                        <p className="text-sm text-slate-400">
                            Don&apos;t have an employer account yet?{" "}
                            <Link to="/register" className="font-medium text-sky-300 hover:text-sky-200">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-sky-500/5 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Login</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Enter your account details to continue.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Login As
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                            >
                                <option value="employer">Employer</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Logging In..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;