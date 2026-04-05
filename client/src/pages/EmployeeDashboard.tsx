import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscriptionStatus } from "../lib/getSubscriptionStatus";

type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

type Completion = {
    id: number;
    business_id: number;
    user_id: number;
    training_item_id: number;
    completed_at: string;
    training_item_title: string;
    training_item_type: string;
};

function EmployeeDashboard() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [categories, setCategories] = useState<StaffCategory[]>([]);
    const [completions, setCompletions] = useState<Completion[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [subscriptionBlockedMessage, setSubscriptionBlockedMessage] = useState("");
    const [checkingSubscription, setCheckingSubscription] = useState(true);

    function getToken() {
        return localStorage.getItem("token");
    }

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    async function loadMyCategories() {
        try {
            setError("");
            setLoadingCategories(true);

            const token = getToken();

            const res = await fetch(`${apiBaseUrl}/api/employee/my-categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load categories");
                return;
            }

            setCategories(data);
        } catch (err) {
            console.error("Load employee categories error:", err);
            setError("Something went wrong while loading categories");
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadMyCompletions() {
        try {
            const token = getToken();

            const res = await fetch(`${apiBaseUrl}/api/employee/completions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load completions");
                return;
            }

            setCompletions(data);
        } catch (err) {
            console.error("Load completions error:", err);
            setError("Something went wrong while loading completions");
        }
    }
    async function checkSubscriptionAccess() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return false;
            }

            const result = await getSubscriptionStatus(apiBaseUrl, token);

            if (!result.ok) {
                if (result.status === 401) {
                    clearAuthAndRedirect();
                    return false;
                }

                setSubscriptionBlockedMessage(result.message);
                return false;
            }

            const effectiveStatus = result.data.effective_status;

            if (effectiveStatus !== "trial_active" && effectiveStatus !== "active") {
                setSubscriptionBlockedMessage(
                    "Your company subscription is inactive. Please contact your employer."
                );
                return false;
            }

            return true;
        } catch (err) {
            console.error("Check subscription access error:", err);
            setSubscriptionBlockedMessage(
                "Unable to verify company subscription. Please contact your employer."
            );
            return false;
        } finally {
            setCheckingSubscription(false);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employee") {
            navigate("/login");
            return;
        }

        async function init() {
            const allowed = await checkSubscriptionAccess();
            if (!allowed) return;

            loadMyCategories();
            loadMyCompletions();
        }

        init();
    }, []);

    const completedCount = useMemo(() => completions.length, [completions]);
    if (checkingSubscription) {
        return (
            <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
                <div className="mx-auto w-full max-w-[900px]">
                    <p className="text-slate-300">Checking company access...</p>
                </div>
            </div>
        );
    }

    if (subscriptionBlockedMessage) {
        return (
            <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
                <div className="mx-auto w-full max-w-[900px]">
                    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8">
                        <h1 className="text-3xl font-bold text-white">Access Restricted</h1>
                        <p className="mt-4 text-lg leading-8 text-amber-100">
                            {subscriptionBlockedMessage}
                        </p>
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
                            Employee workspace
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Your assigned training, organized clearly.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Open your assigned categories, enter folder workspaces, review files or notes,
                            and track what you have already completed.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Assigned Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{categories.length}</p>
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Completed Items</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-300">{completedCount}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[1.15fr_1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Assigned Categories</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Open a category to view its folders in workspace mode.
                            </p>
                        </div>

                        {loadingCategories ? (
                            <p className="text-slate-300">Loading categories...</p>
                        ) : categories.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No categories assigned yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => navigate(`/employee/category/${category.id}`)}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:border-slate-600 hover:bg-slate-950"
                                    >
                                        <div className="mb-3 text-3xl">🧩</div>
                                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {category.description || "Role-based training category"}
                                        </p>
                                        <div className="mt-4">
                      <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">
                        Open Workspace
                      </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-5">
                            <h2 className="text-2xl font-semibold text-white">My Completed Items</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                A quick history of finished training items.
                            </p>
                        </div>

                        {completions.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No completed items yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {completions.map((completion) => (
                                    <div
                                        key={completion.id}
                                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {completion.training_item_title}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {completion.training_item_type}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                      Completed
                    </span>
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

export default EmployeeDashboard;