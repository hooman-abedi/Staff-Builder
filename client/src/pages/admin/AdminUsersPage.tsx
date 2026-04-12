import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type AdminUser = {
    id: number;
    business_id: number | null;
    business_name: string | null;
    full_name: string | null;
    email: string;
    role: string;
    created_at: string;
};

function AdminUsersPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                        All Users
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        View employers, employees, and internal platform users from one place.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading users...</p>
                ) : users.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Business</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map((user) => (
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

export default AdminUsersPage;