import { Link } from "react-router-dom";

function EmployerHomePage() {
    const email = localStorage.getItem("email") || "No email available";

    const businessName = "Staff Builder Business";
    const planName = "Free Trial";
    const trialDaysLeft = 7;
    const planLimit = "Up to 5 employees";
    const billingStatus = "Trial Active";

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Employer overview
                        </p>

                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Welcome back. Here is your business workspace overview.
                        </h1>

                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Review your membership status, business account details, and quickly
                            jump into employee management, training setup, or progress tracking.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-5">
                        <p className="text-sm text-sky-200">Current Membership</p>
                        <p className="mt-2 text-2xl font-bold text-white">{planName}</p>
                        <p className="mt-1 text-sm text-sky-100">
                            {billingStatus} • {trialDaysLeft} days left
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Business Details</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Basic account and subscription information.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Business Name</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{businessName}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Employer Email</p>
                                    <p className="mt-2 break-all text-lg font-semibold text-white">{email}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Plan</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{planName}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Employee Limit</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{planLimit}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 md:col-span-2">
                                    <p className="text-sm text-slate-400">Billing / Membership Status</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                      {billingStatus}
                    </span>
                                        <span className="text-sm text-slate-300">
                      Trial ends in {trialDaysLeft} days
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">
                                    Manage Subscription
                                </button>

                                <button className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800">
                                    Edit Business Details
                                </button>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Jump directly into the main parts of the platform.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Link
                                    to="/employer/employees"
                                    className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600 hover:bg-slate-950"
                                >
                                    <div className="mb-3 text-3xl">👥</div>
                                    <h3 className="text-xl font-semibold text-white">Employees</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Invite staff, create employee accounts, and assign categories.
                                    </p>
                                </Link>

                                <Link
                                    to="/employer/training"
                                    className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600 hover:bg-slate-950"
                                >
                                    <div className="mb-3 text-3xl">📚</div>
                                    <h3 className="text-xl font-semibold text-white">Training</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Build categories, folders, lessons, documents, and videos.
                                    </p>
                                </Link>

                                <Link
                                    to="/employer/progress"
                                    className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600 hover:bg-slate-950"
                                >
                                    <div className="mb-3 text-3xl">📈</div>
                                    <h3 className="text-xl font-semibold text-white">Progress</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Track employee completions and monitor training progress.
                                    </p>
                                </Link>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Membership Summary</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Current plan details and upcoming account needs.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Current Plan</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{planName}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Trial Period</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{trialDaysLeft} days left</p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                    <p className="text-sm text-slate-400">Current Limit</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{planLimit}</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                <p className="text-sm font-medium text-amber-300">
                                    Reminder
                                </p>
                                <p className="mt-2 text-sm leading-6 text-amber-100">
                                    Your free trial is active. After the trial period, subscription purchase
                                    will be required to continue full access and employee growth.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Account Actions</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Future account and business management actions.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-left font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800">
                                    Update Business Information
                                </button>

                                <button className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-left font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800">
                                    View Billing Plans
                                </button>

                                <button className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-left font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800">
                                    Contact Support
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployerHomePage;