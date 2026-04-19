import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type AdminUser = {
    id: number;
    business_id: number | null;
    business_name: string | null;
    full_name: string | null;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

function AdminUsersPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const currentAdminEmail = localStorage.getItem("email");

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "employer" | "employee" | "super_admin" | "support_admin">("all");

    function clearAuthAndRedirect() {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/users`, {
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
                setError("You do not have permission to view admin users.");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to load users");
                return;
            }

            setUsers(data as AdminUser[]);
        } catch (err) {
            console.error("Load admin users error:", err);
            setError("Something went wrong while loading users");
        } finally {
            setLoading(false);
        }
    }
    async function impersonateUser(userId: number) {
        try {
            setError("");


            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/impersonate/${userId}`, {
                method: "POST",
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
                setError(data.message || "Failed to impersonate user");
                return;
            }

            const currentAdminToken = localStorage.getItem("token");
            const currentAdminRole = localStorage.getItem("role");
            const currentAdminEmail = localStorage.getItem("email");

            if (currentAdminToken) {
                localStorage.setItem("admin_return_token", currentAdminToken);
            }
            if (currentAdminRole) {
                localStorage.setItem("admin_return_role", currentAdminRole);
            }
            if (currentAdminEmail) {
                localStorage.setItem("admin_return_email", currentAdminEmail);
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("email", data.email);
            localStorage.setItem("impersonating", "true");
            localStorage.setItem("admin_return_role", "super_admin");
            localStorage.setItem("admin_return_email", "superadmin@test.com");

            if (data.role === "employer") {
                navigate("/employer");
                return;
            }

            if (data.role === "employee") {
                navigate("/employee");
                return;
            }

            setError("Unsupported impersonation role");
        } catch (err) {
            console.error("Impersonate user error:", err);
            setError("Something went wrong while impersonating user");
        }
    }
    async function updateUserStatus(userId: number, nextStatus: boolean) {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_active: nextStatus }),
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

            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, is_active: nextStatus } : user
                )
            );
        } catch (err) {
            console.error("Update user status error:", err);
            setError("Something went wrong while updating user status");
        }
    }
    async function resetUserPassword(userId: number, userEmail: string) {
        const newPassword = window.prompt(`Enter a new password for ${userEmail}:`);

        if (!newPassword) return;

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to reset password");
                return;
            }

            window.alert(`Password updated successfully for ${userEmail}`);
        } catch (err) {
            console.error("Reset user password error:", err);
            setError("Something went wrong while resetting password");
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

        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const inactiveUsers = users.filter((user) => !user.is_active);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <span className="text-white">Users</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Inactive Users
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        View all inactive platform users and reactivate accounts when needed..
                    </p>
                </div>

                {error && (
                    <div
                        className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}
                <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, or business..."
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) =>
                            setRoleFilter(
                                e.target.value as "all" | "employer" | "employee" | "super_admin" | "support_admin"
                            )
                        }
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    >
                        <option value="all">All Roles</option>
                        <option value="employer">Employer</option>
                        <option value="employee">Employee</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="support_admin">Support Admin</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-slate-300">Loading users...</p>
                ) : inactiveUsers.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
                        <div className="overflow-x-auto">
                            <div className="mb-6 flex flex-wrap gap-3">

                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                                        statusFilter === "all"
                                            ? "bg-sky-500 text-slate-950"
                                            : "border border-slate-700 bg-slate-900 text-white hover:border-slate-500 hover:bg-slate-800"
                                    }`}
                                >
                                    All
                                </button>

                                <button
                                    onClick={() => setStatusFilter("active")}
                                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                                        statusFilter === "active"
                                            ? "bg-emerald-500 text-slate-950"
                                            : "border border-slate-700 bg-slate-900 text-white hover:border-slate-500 hover:bg-slate-800"
                                    }`}
                                >
                                    Active
                                </button>


                                <button
                                    onClick={() => setStatusFilter("inactive")}
                                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                                        statusFilter === "inactive"
                                            ? "bg-red-500 text-white"
                                            : "border border-slate-700 bg-slate-900 text-white hover:border-slate-500 hover:bg-slate-800"
                                    }`}
                                >
                                    Inactive
                                </button>

                            </div>
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Business</th>
                                    <th className="px-4 py-3">Enter their Platform</th>
                                    <th className="px-4 py-3">Actions</th>
                                    <th className="px-4 py-3">Status</th>

                                </tr>
                                </thead>
                                <tbody>
                                {inactiveUsers.map((user) => {

                                    const isCurrentAdmin = user.email === currentAdminEmail;
                                    return (
                                        <tr key={user.id} className="border-b border-slate-800 last:border-b-0">
                                            <td className="px-4 py-3 text-white">{user.id}</td>
                                            <td className="px-4 py-3 text-white">{user.full_name || "-"}</td>
                                            <td className="px-4 py-3 text-slate-300">{user.email}</td>
                                            <td className="px-4 py-3 text-slate-300">{user.role}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {user.business_name || "Internal Platform"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(user.role === "employer" || user.role === "employee") ? (
                                                    <button
                                                        onClick={() => impersonateUser(user.id)}
                                                        className="rounded-xl bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                                                    >
                                                        Enter
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => updateUserStatus(user.id, !user.is_active)}
                                                        disabled={isCurrentAdmin}
                                                        className={
                                                            isCurrentAdmin
                                                                ? "rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-500 cursor-not-allowed"
                                                                : user.is_active
                                                                    ? "rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                                                                    : "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                                                        }
                                                    >
                                                        {isCurrentAdmin ? "Current Admin" : user.is_active ? "Deactivate" : "Reactivate"}
                                                    </button>

                                                    <button
                                                        onClick={() => resetUserPassword(user.id, user.email)}
                                                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20"
                                                    >
                                                        Reset Password
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
        <span
            className={
                user.is_active
                    ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300"
                    : "rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300"
            }
        >
            {user.is_active ? "Active" : "Inactive"}
        </span>
                                            </td>

                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUsersPage;