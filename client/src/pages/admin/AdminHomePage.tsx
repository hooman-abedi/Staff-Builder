import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminHomePage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");
        const savedEmail = localStorage.getItem("email");

        if (!token) {
            navigate("/login");
            return;
        }

        if (savedRole !== "super_admin" && savedRole !== "support_admin") {
            navigate("/login");
            return;
        }

        // FIX: wrap state updates in microtask
        Promise.resolve().then(() => {
            setRole(savedRole || "");
            setEmail(savedEmail || "");
        });
    }, [navigate]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-300">
                            Internal platform access
                        </p>

                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Admin control center.
                        </h1>

                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Use this internal workspace to manage platform users, support customers,
                            test unrestricted flows, and oversee business accounts.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                            <p className="mt-1 font-semibold text-white">{role || "Admin"}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                            <p className="mt-1 font-semibold text-white">{email || "-"}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                        >
                            Logout
                        </button>
                    </div>
                </div>


                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Platform Role</p>
                        <p className="mt-3 text-2xl font-bold text-white">Admin</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Internal unrestricted platform access for testing and support.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Customer Support</p>
                        <p className="mt-3 text-2xl font-bold text-white">Enabled</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Admin can later view and update employer and employee accounts.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Restrictions</p>
                        <p className="mt-3 text-2xl font-bold text-emerald-300">Bypassed</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Subscription and trial restrictions can be bypassed for internal testing.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Next Admin Tools</p>
                        <p className="mt-3 text-2xl font-bold text-white">Back Office</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Businesses, employers, employees, subscription controls, and support actions.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Current Responsibilities</h2>
                        <ul className="mt-4 space-y-3 text-slate-300">
                            <li>• Internal testing without normal customer plan restrictions</li>
                            <li>• Platform-level access separate from employer and employee roles</li>
                            <li>• Future account support for employers and employees</li>
                            <li>• Future subscription and trial management tools</li>
                        </ul>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Back-Office Navigation</h2>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate("/admin/businesses")}
                                className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                            >
                                View Businesses
                            </button>

                            <button
                                onClick={() => navigate("/admin/users")}
                                className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                View Users
                            </button>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                            Use these tools to monitor businesses, inspect users, and prepare future support actions.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default AdminHomePage;