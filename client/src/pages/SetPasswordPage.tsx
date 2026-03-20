import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function SetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loadingInvite, setLoadingInvite] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadInvite() {
            if (!token) {
                setError("Invite token is missing.");
                setLoadingInvite(false);
                return;
            }

            try {
                setError("");
                const res = await fetch(`${apiBaseUrl}/api/employees/invite/${token}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Failed to load invite.");
                    return;
                }

                setFullName(data.full_name || "");
                setEmail(data.email || "");
                setExpiresAt(data.expires_at || "");
            } catch (err) {
                console.error("Load invite error:", err);
                setError("Something went wrong while loading the invite.");
            } finally {
                setLoadingInvite(false);
            }
        }

        loadInvite();
    }, [apiBaseUrl, token]);

    async function handleSetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

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

        if (!token) {
            setError("Invite token is missing.");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch(
                `${apiBaseUrl}/api/employees/invite/${token}/set-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to set password.");
                return;
            }

            setSuccessMessage("Password set successfully. Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            console.error("Set password error:", err);
            setError("Something went wrong while setting your password.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
                <div>
                    <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                        Employee invitation
                    </p>

                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Set your password and activate your account.
                    </h1>

                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                        You’ve been invited to join your company’s Staff Builder workspace.
                        Set your password once, then log in to access your assigned training.
                    </p>

                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <h3 className="font-semibold text-white">What happens next</h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                            <li>• Set your password</li>
                            <li>• Log in with your employee email</li>
                            <li>• Access your assigned categories and folders</li>
                            <li>• Complete your training items</li>
                        </ul>
                    </div>

                    <p className="mt-6 text-sm text-slate-400">
                        Already set your password?{" "}
                        <Link to="/login" className="font-medium text-sky-300 hover:text-sky-200">
                            Go to login
                        </Link>
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-sky-500/5 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Set Password</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Complete your account setup to continue.
                        </p>
                    </div>

                    {loadingInvite ? (
                        <p className="text-slate-300">Loading invite...</p>
                    ) : error && !fullName && !email ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                                <p className="text-sm text-slate-400">Invited employee</p>
                                <p className="mt-1 font-semibold text-white">{fullName || "Employee"}</p>
                                <p className="text-sm text-slate-300">{email}</p>
                                {expiresAt ? (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Invite expires: {new Date(expiresAt).toLocaleString()}
                                    </p>
                                ) : null}
                            </div>

                            <form onSubmit={handleSetPassword} className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        New Password
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
                                    disabled={submitting}
                                    className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? "Saving Password..." : "Set Password"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SetPasswordPage;