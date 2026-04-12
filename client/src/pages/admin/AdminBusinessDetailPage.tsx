import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

type BusinessUser = {
    id: number;
    business_id: number;
    full_name: string | null;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

function AdminBusinessDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [business, setBusiness] = useState<Business | null>(null);
    const [users, setUsers] = useState<BusinessUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editPlan, setEditPlan] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editMaxEmployees, setEditMaxEmployees] = useState("");
    const [savingSubscription, setSavingSubscription] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    async function loadBusinessDetail() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/businesses/${id}`, {
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
                setError("You do not have permission to view this business.");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to load business details");
                return;
            }

            setBusiness(data.business);
            setEditPlan(data.business.subscription_plan || "");
            setEditStatus(data.business.subscription_status || "");
            setEditMaxEmployees(String(data.business.max_employees ?? ""));
            setUsers(data.users || []);
        } catch (err) {
            console.error("Load admin business detail error:", err);
            setError("Something went wrong while loading business details");
        } finally {
            setLoading(false);
        }
    }

    async function saveSubscriptionChanges() {
        try {
            setSavingSubscription(true);
            setError("");
            setSuccessMessage("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/businesses/${id}/subscription`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    subscription_plan: editPlan,
                    subscription_status: editStatus,
                    max_employees: Number(editMaxEmployees),
                }),
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (res.status === 403) {
                setError("You do not have permission to update this business subscription.");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to update subscription");
                return;
            }

            setSuccessMessage("Subscription settings updated successfully.");
            await loadBusinessDetail();
        } catch (err) {
            console.error("Save admin subscription changes error:", err);
            setError("Something went wrong while updating subscription settings");
        } finally {
            setSavingSubscription(false);
        }
    }
    async function updateUserStatus(userId: number, isActive: boolean) {
        try {
            setError("");
            setSuccessMessage("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    is_active: isActive,
                }),
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to update user status");
                return;
            }

            setSuccessMessage("User status updated successfully.");
            await loadBusinessDetail();
        } catch (err) {
            console.error("Update user status error:", err);
            setError("Something went wrong while updating user status");
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

        if (!id) {
            setError("Missing business id");
            return;
        }

        loadBusinessDetail();

    }, [id]);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <Link to="/admin/businesses" className="hover:text-white">
                        Businesses
                    </Link>
                    <span>/</span>
                    <span className="text-white">{business?.name || "Business Detail"}</span>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading business details...</p>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                ) : !business ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        Business not found.
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                                {business.name}
                            </h1>
                            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                                Review business subscription details and all users inside this franchise.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                                <p className="text-sm text-slate-400">Plan</p>
                                <p className="mt-3 text-2xl font-bold text-white">
                                    {business.subscription_plan}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                                <p className="text-sm text-slate-400">Status</p>
                                <p className="mt-3 text-2xl font-bold text-white">
                                    {business.subscription_status}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                                <p className="text-sm text-slate-400">Employee Limit</p>
                                <p className="mt-3 text-2xl font-bold text-white">
                                    {business.max_employees ?? "-"}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                                <p className="text-sm text-slate-400">Users</p>
                                <p className="mt-3 text-2xl font-bold text-white">
                                    {users.length}
                                </p>
                            </div>
                        </div>

                        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                            <h2 className="text-2xl font-semibold text-white">Subscription Controls</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Update the business plan, status, and employee limit from the admin back office.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Subscription Plan
                                    </label>
                                    <select
                                        value={editPlan}
                                        onChange={(e) => setEditPlan(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                    >
                                        <option value="trial">trial</option>
                                        <option value="basic">basic</option>
                                        <option value="growth">growth</option>
                                        <option value="enterprise">enterprise</option>
                                        <option value="internal">internal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Subscription Status
                                    </label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                    >
                                        <option value="trial_active">trial_active</option>
                                        <option value="active">active</option>
                                        <option value="expired">expired</option>
                                        <option value="cancelled">cancelled</option>
                                        <option value="suspended">suspended</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Employee Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editMaxEmployees}
                                        onChange={(e) => setEditMaxEmployees(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={saveSubscriptionChanges}
                                    disabled={savingSubscription}
                                    className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {savingSubscription ? "Saving..." : "Save Subscription Changes"}
                                </button>
                            </div>
                        </section>

                        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                            <h2 className="text-2xl font-semibold text-white">Business Details</h2>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm text-slate-400">Trial Ends</p>
                                    <p className="mt-2 text-white">
                                        {business.trial_ends_at
                                            ? new Date(business.trial_ends_at).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm text-slate-400">Subscription Ends</p>
                                    <p className="mt-2 text-white">
                                        {business.subscription_ends_at
                                            ? new Date(business.subscription_ends_at).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm text-slate-400">Created At</p>
                                    <p className="mt-2 text-white">
                                        {new Date(business.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm text-slate-400">Business ID</p>
                                    <p className="mt-2 text-white">{business.id}</p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                            <h2 className="text-2xl font-semibold text-white">Users in This Business</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Employers and employees currently connected to this franchise.
                            </p>

                            {users.length === 0 ? (
                                <div
                                    className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No users found for this business.
                                </div>
                            ) : (
                                <div
                                    className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                            <tr>
                                                <th className="px-4 py-3">ID</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3">Active</th>
                                                <th className="px-4 py-3">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {users.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="border-b border-slate-800 last:border-b-0"
                                                >
                                                    <td className="px-4 py-3 text-white">{user.id}</td>
                                                    <td className="px-4 py-3 text-white">
                                                        {user.full_name || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                                                    <td className="px-4 py-3 text-slate-300">{user.role}</td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {user.is_active ? "Yes" : "No"}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => updateUserStatus(user.id, false)}
                                                                className="rounded-xl bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-400"
                                                            >
                                                                Suspend
                                                            </button>

                                                            <button
                                                                onClick={() => updateUserStatus(user.id, true)}
                                                                className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-400"
                                                            >
                                                                Activate
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminBusinessDetailPage;