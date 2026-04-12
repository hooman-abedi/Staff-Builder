import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BusinessSubscription } from "../../lib/getSubscriptionStatus";

type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

type SubscriptionRequest = {
    id: number;
    business_id: number;
    requested_by_user_id: number;
    requested_plan: string;
    requested_max_employees: number;
    status: string;
    admin_note: string | null;
    reviewed_by_user_id: number | null;
    reviewed_at: string | null;
    created_at: string;
};

function EmployerTrainingPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [staffCategories, setStaffCategories] = useState<StaffCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [staffCategoryName, setStaffCategoryName] = useState("");
    const [staffCategoryDescription, setStaffCategoryDescription] = useState("");

    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);

    const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const token = localStorage.getItem("token");
    const isExpired = subscription?.effective_status === "expired";

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function authHeaders(isJson = false) {
        return {
            ...(isJson ? { "Content-Type": "application/json" } : {}),
            Authorization: `Bearer ${token}`,
        };
    }

    async function handleJsonResponse(res: Response) {
        if (res.status === 401) {
            clearAuthAndRedirect();
            return null;
        }
        return res.json();
    }

    async function loadStaffCategories() {
        try {
            setLoadingCategories(true);
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load staff categories");
                return;
            }

            setStaffCategories(data);
        } catch (err) {
            console.error("Load staff categories error:", err);
            setError("Something went wrong while loading staff categories");
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadSubscription() {
        try {
            setLoadingSubscription(true);

            const res = await fetch(`${apiBaseUrl}/api/business/subscription-status`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load subscription");
                return;
            }

            setSubscription(data);
        } catch (err) {
            console.error("Load subscription error:", err);
            setError("Something went wrong while loading subscription");
        } finally {
            setLoadingSubscription(false);
        }
    }

    async function loadSubscriptionRequests() {
        try {
            setLoadingRequests(true);

            const res = await fetch(`${apiBaseUrl}/api/subscription-requests/me`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load subscription requests");
                return;
            }

            setSubscriptionRequests(data);
        } catch (err) {
            console.error("Load subscription requests error:", err);
            setError("Something went wrong while loading subscription requests");
        } finally {
            setLoadingRequests(false);
        }
    }

    async function requestPlanChange(requestedPlan: string) {
        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/subscription-requests`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({ requested_plan: requestedPlan }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create subscription request");
                return;
            }

            await loadSubscriptionRequests();
        } catch (err) {
            console.error("Create subscription request error:", err);
            setError("Something went wrong while creating subscription request");
        }
    }

    useEffect(() => {
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        loadStaffCategories();
        loadSubscription();
        loadSubscriptionRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function createStaffCategory(e: React.FormEvent) {
        e.preventDefault();

        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to create staff categories.");
            return;
        }

        if (!staffCategoryName.trim()) {
            setError("Staff category name is required");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    name: staffCategoryName.trim(),
                    description: staffCategoryDescription.trim() || null,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create staff category");
                return;
            }

            setStaffCategories((prev) => [data, ...prev]);
            setStaffCategoryName("");
            setStaffCategoryDescription("");
        } catch (err) {
            console.error("Create staff category error:", err);
            setError("Something went wrong while creating staff category");
        }
    }

    async function deleteStaffCategory(id: number) {
        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to delete staff categories.");
            return;
        }

        const confirmed = window.confirm("Delete this staff category?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete staff category");
                return;
            }

            setStaffCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Delete staff category error:", err);
            setError("Something went wrong while deleting staff category");
        }
    }

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Training management
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Create categories and open training workspaces.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Build training by role, then enter each category to manage folders like a
                            workspace.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{staffCategories.length}</p>
                        </div>

                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Training Area</p>
                            <p className="mt-2 text-xl font-bold text-white">Workspace Mode</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white">Subscription</h2>

                    {loadingSubscription ? (
                        <p className="text-slate-400">Loading subscription...</p>
                    ) : (
                        <>
                            <p className="mb-2 text-slate-300">
                                Plan:{" "}
                                <span className="font-semibold text-white">
                                    {subscription?.subscription_plan || "free"}
                                </span>
                            </p>

                            <p className="mb-4 text-slate-300">
                                Status:{" "}
                                <span
                                    className={
                                        subscription?.effective_status === "active"
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    }
                                >
                                    {subscription?.effective_status || "inactive"}
                                </span>
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => requestPlanChange("basic")}
                                    className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950"
                                >
                                    Basic
                                </button>

                                <button
                                    type="button"
                                    onClick={() => requestPlanChange("growth")}
                                    className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Growth
                                </button>

                                <button
                                    type="button"
                                    onClick={() => requestPlanChange("enterprise")}
                                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
                                >
                                    Enterprise
                                </button>
                            </div>

                            <div className="mt-6 border-t border-slate-800 pt-6">
                                <h3 className="text-lg font-semibold text-white">Subscription Requests</h3>

                                {loadingRequests ? (
                                    <p className="mt-3 text-slate-400">Loading requests...</p>
                                ) : subscriptionRequests.length === 0 ? (
                                    <p className="mt-3 text-slate-400">No subscription requests yet.</p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {subscriptionRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                            >
                                                <p className="text-white">
                                                    Requested plan:{" "}
                                                    <span className="font-semibold">{request.requested_plan}</span>
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
                className={
                    request.status === "approved"
                        ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300"
                        : request.status === "rejected"
                            ? "rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300"
                            : "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300"
                }
            >
                {request.status === "approved"
                    ? "Approved"
                    : request.status === "rejected"
                        ? "Rejected"
                        : "Pending Review"}
            </span>
                                                </div>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    Requested employee limit: {request.requested_max_employees}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Requested on: {new Date(request.created_at).toLocaleString()}
                                                </p>

                                                {request.admin_note && (
                                                    <div className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                                                            Admin Note
                                                        </p>
                                                        <p className="mt-1 text-sm text-amber-100">{request.admin_note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[0.95fr_1.1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Create Staff Category</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Categories group training by role, such as Manager or Instructor.
                            </p>

                        </div>

                        {isExpired && (
                            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                Your subscription has expired. Creating or deleting training categories is disabled
                                until you renew your plan.
                            </div>
                        )}

                        <form onSubmit={createStaffCategory} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Category Name
                                </label>
                                <input
                                    value={staffCategoryName}
                                    onChange={(e) => setStaffCategoryName(e.target.value)}
                                    placeholder="e.g. Manager"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Description
                                </label>
                                <input
                                    value={staffCategoryDescription}
                                    onChange={(e) => setStaffCategoryDescription(e.target.value)}
                                    placeholder="Training for managers"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isExpired}
                                className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-slate-300"
                            >
                                Create Staff Category
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Categories</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Open a category to enter its folder workspace.
                            </p>

                        </div>

                        {loadingCategories ? (
                            <p className="text-slate-300">Loading staff categories...</p>
                        ) : staffCategories.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No staff categories yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {staffCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600"
                                    >
                                        <div className="mb-3 text-3xl">🧩</div>

                                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {category.description || "Role-based category"}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Link
                                                to={`/employer/training/category/${category.id}`}
                                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                            >
                                                Open Workspace
                                            </Link>

                                            <button
                                                onClick={() => deleteStaffCategory(category.id)}
                                                disabled={isExpired}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default EmployerTrainingPage;