import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type BusinessSubscription = {
    id: number | null;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    effective_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    max_employees: number | null;
    subscription_started_at: string | null;
    subscription_ends_at: string | null;
};

function EmployerHomePage() {
    const navigate = useNavigate();
    const email = localStorage.getItem("email") || "No email available";
    const token = localStorage.getItem("token");
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [business, setBusiness] = useState<BusinessSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function formatPlanName(plan: string | null | undefined) {
        if (!plan) return "Not available";

        if (plan === "trial") return "Free Trial";
        if (plan === "internal") return "Internal Access";

        return plan
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function formatStatus(status: string | null | undefined) {
        if (!status) return "Unknown";

        if (status === "trial_active") return "Trial Active";
        if (status === "active") return "Active";
        if (status === "expired") return "Expired";
        if (status === "cancelled") return "Cancelled";

        return status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function getDaysLeft(endDate: string | null) {
        if (!endDate) return 0;

        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return 0;

        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    useEffect(() => {
        async function fetchBusinessSubscription() {
            if (!token) {
                clearAuthAndRedirect();
                return;
            }

            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${apiBaseUrl}/api/business/subscription-status`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (res.status === 401) {
                    clearAuthAndRedirect();
                    return;
                }

                if (!res.ok) {
                    setError(data.message || "Failed to load business subscription info.");
                    return;
                }

                setBusiness(data);
            } catch (err) {
                console.error("Failed to fetch business subscription info:", err);
                setError("Something went wrong while loading subscription information.");
            } finally {
                setLoading(false);
            }
        }

        fetchBusinessSubscription();
    }, [apiBaseUrl, token, navigate]);

    const planName = useMemo(() => {
        return formatPlanName(business?.subscription_plan);
    }, [business]);

    const billingStatus = useMemo(() => {
        return formatStatus(business?.effective_status || business?.subscription_status);
    }, [business]);

    const isTrialPlan = business?.subscription_plan === "trial";
    const isExpired = business?.effective_status === "expired";

    const trialDaysLeft = useMemo(() => {
        return getDaysLeft(business?.trial_ends_at || null);
    }, [business]);

    const subscriptionDaysLeft = useMemo(() => {
        return getDaysLeft(business?.subscription_ends_at || null);
    }, [business]);

    const displayedDaysLeft = isTrialPlan ? trialDaysLeft : subscriptionDaysLeft;

    const periodLabel = useMemo(() => {
        if (isExpired) return "Expired";
        return `${displayedDaysLeft} days left`;
    }, [isExpired, displayedDaysLeft]);

    const billingMessage = useMemo(() => {
        if (isExpired) {
            return "Your trial or subscription has expired";
        }

        if (isTrialPlan) {
            return `Trial ends in ${trialDaysLeft} days`;
        }

        return `Subscription ends in ${subscriptionDaysLeft} days`;
    }, [isExpired, isTrialPlan, trialDaysLeft, subscriptionDaysLeft]);

    const planLimit = useMemo(() => {
        if (business?.max_employees == null) return "Not available";
        return `Up to ${business.max_employees} employees`;
    }, [business]);

    const businessName = business?.name || "Business name unavailable";

    const statusBadgeClass =
        billingStatus === "Trial Active" || billingStatus === "Active"
            ? "rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300"
            : billingStatus === "Expired" || billingStatus === "Cancelled"
                ? "rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-300"
                : "rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200";

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
                <div className="mx-auto w-full max-w-[1400px]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
                        <p className="text-lg text-slate-300">Loading business subscription information...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                            {isExpired ? billingStatus : `${billingStatus} • ${periodLabel}`}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

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
                                        <span className={statusBadgeClass}>
                                            {billingStatus}
                                        </span>

                                        <span className="text-sm text-slate-300">
                                            {billingMessage}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate("/employer/training")}
                                    className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Manage Subscription
                                </button>

                                <button
                                    onClick={() => navigate("/employer/business")}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                                >
                                    Edit Business Details
                                </button>
                            </div>
                        </section>

                        <section
                            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
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
                                    <p className="text-sm text-slate-400">
                                        {isTrialPlan ? "Trial Period" : "Subscription Period"}
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-white">
                                        {periodLabel}
                                    </p>
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
                                    {billingStatus === "Trial Active"
                                        ? "Your free trial is active. After the trial period, subscription purchase will be required to continue full access and employee growth."
                                        : billingStatus === "Expired"
                                            ? "Your trial or subscription has expired. Renew or upgrade your plan to continue using employer features without restrictions."
                                            : "Review your plan details regularly to make sure your current subscription still matches your business needs."}
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