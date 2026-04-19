import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Business = {
    id: number;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    max_employees: number | null;
    subscription_started_at: string | null;
    subscription_ends_at: string | null;
    created_at: string;
};

function AdminBusinessesPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingBusinessId, setEditingBusinessId] = useState<number | null>(null);
    const [editBusinessName, setEditBusinessName] = useState("");
    const [editSubscriptionPlan, setEditSubscriptionPlan] = useState("basic");
    const [editSubscriptionStatus, setEditSubscriptionStatus] = useState("active");
    const [editMaxEmployees, setEditMaxEmployees] = useState("");

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    async function loadBusinesses() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/businesses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (res.status === 403) {
                setError("You do not have permission to view admin businesses.");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to load businesses");
                return;
            }

            setBusinesses(data as Business[]);
        } catch (err) {
            console.error("Load admin businesses error:", err);
            setError("Something went wrong while loading businesses");
        } finally {
            setLoading(false);
        }
    }
    function startEditBusiness(business: Business) {
        setEditingBusinessId(business.id);
        setEditBusinessName(business.name);
        setEditSubscriptionPlan(business.subscription_plan);
        setEditSubscriptionStatus(business.subscription_status);
        setEditMaxEmployees(String(business.max_employees ?? 0));
    }

    function cancelEditBusiness() {
        setEditingBusinessId(null);
        setEditBusinessName("");
        setEditSubscriptionPlan("basic");
        setEditSubscriptionStatus("active");
        setEditMaxEmployees("");
    }

    async function saveBusinessEdit(businessId: number) {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/businesses/${businessId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editBusinessName,
                    subscription_plan: editSubscriptionPlan,
                    subscription_status: editSubscriptionStatus,
                    max_employees: Number(editMaxEmployees),
                }),
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to update business");
                return;
            }

            setBusinesses((prev) =>
                prev.map((business) =>
                    business.id === businessId ? { ...business, ...data } : business
                )
            );

            cancelEditBusiness();
        } catch (err) {
            console.error("Save business edit error:", err);
            setError("Something went wrong while updating business");
        }
    }

    async function deleteBusiness(businessId: number) {
        console.log("DELETE BUSINESS CLICKED:", businessId);

        const confirmed = window.confirm(
            "Are you sure you want to delete this business? This only works if no users are still assigned to it."
        );
        if (!confirmed) return;

        try {
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/businesses/${businessId}`, {
                method: "DELETE",
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
                setError(data.message || "Failed to delete business");
                return;
            }

            setBusinesses((prev) => prev.filter((business) => business.id !== businessId));
        } catch (err) {
            console.error("Delete business error:", err);
            setError("Something went wrong while deleting business");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "super_admin" && role !== "support_admin") {
            navigate("/login");
            return;
        }

        loadBusinesses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <span className="text-white">Businesses</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        All Businesses
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        View all customer businesses, subscription plans, trial dates, and limits.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading businesses...</p>
                ) : businesses.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        No businesses found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Trial Ends</th>
                                    <th className="px-4 py-3">Max Employees</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {businesses.map((business) => (
                                    <tr key={business.id} className="border-b border-slate-800 last:border-b-0">
                                        <td className="px-4 py-3 text-white">{business.id}</td>

                                        <td className="px-4 py-3 text-white">
                                            {editingBusinessId === business.id ? (
                                                <input
                                                    value={editBusinessName}
                                                    onChange={(e) => setEditBusinessName(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-400"
                                                />
                                            ) : (
                                                business.name
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-slate-300">
                                            {editingBusinessId === business.id ? (
                                                <select
                                                    value={editSubscriptionPlan}
                                                    onChange={(e) => setEditSubscriptionPlan(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-400"
                                                >
                                                    <option value="free">free</option>
                                                    <option value="basic">basic</option>
                                                    <option value="growth">growth</option>
                                                    <option value="enterprise">enterprise</option>
                                                    <option value="internal">internal</option>
                                                </select>
                                            ) : (
                                                business.subscription_plan
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-slate-300">
                                            {editingBusinessId === business.id ? (
                                                <select
                                                    value={editSubscriptionStatus}
                                                    onChange={(e) => setEditSubscriptionStatus(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-400"
                                                >
                                                    <option value="active">active</option>
                                                    <option value="inactive">inactive</option>
                                                    <option value="expired">expired</option>
                                                    <option value="trial_active">trial_active</option>
                                                    <option value="suspended">suspended</option>
                                                </select>
                                            ) : (
                                                business.subscription_status
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-slate-300">
                                            {business.trial_ends_at
                                                ? new Date(business.trial_ends_at).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-300">
                                            {editingBusinessId === business.id ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editMaxEmployees}
                                                    onChange={(e) => setEditMaxEmployees(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-400"
                                                />
                                            ) : (
                                                business.max_employees ?? "-"
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {editingBusinessId === business.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveBusinessEdit(business.id)}
                                                            className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            onClick={cancelEditBusiness}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditBusiness(business)}
                                                            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => deleteBusiness(business.id)}
                                                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminBusinessesPage;