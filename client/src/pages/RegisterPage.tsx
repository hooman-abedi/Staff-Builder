import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
    const navigate = useNavigate();

    const [businessName, setBusinessName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    function isValidEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const trimmedBusinessName = businessName.trim();
        const trimmedFullName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedBusinessName) {
            setError("Business name is required.");
            return;
        }

        if (!trimmedFullName) {
            setError("Employer full name is required.");
            return;
        }

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

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (!confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${apiBaseUrl}/api/auth/register-employer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    businessName: trimmedBusinessName,
                    full_name: trimmedFullName,
                    email: trimmedEmail,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("email", data.user.email);

            setSuccessMessage("Employer account created successfully.");

            setTimeout(() => {
                navigate("/employer");
            }, 800);
        } catch (err) {
            console.error("Register employer error:", err);
            setError("Something went wrong while creating the account.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                <div>
                    <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                        Employer onboarding
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Create your business training workspace.
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                        Set up your employer account, organize training by staff role,
                        assign learning to employees, and track completion from one place.
                    </p>

                    <div className="mt-8 space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                            <h3 className="font-semibold text-white">What you’ll unlock</h3>
                            <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                <li>• Create staff categories like Manager or Instructor</li>
                                <li>• Add employees and assign training by role</li>
                                <li>• Upload files, videos, links, and text lessons</li>
                                <li>• Monitor completion progress across your team</li>
                            </ul>
                        </div>

                        <p className="text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-sky-300 hover:text-sky-200">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-sky-500/5 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Register Employer</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Create your business account to start building staff training.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="My Business"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Employer Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Hooman Abedi"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Employer Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="owner@business.com"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating Account..." : "Create Employer Account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;