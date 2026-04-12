import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type SearchUser = {
    id: number;
    business_id: number | null;
    business_name: string | null;
    full_name: string | null;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

type SearchBusiness = {
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

function AdminSearchPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<SearchUser[]>([]);
    const [businesses, setBusinesses] = useState<SearchBusiness[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("impersonating");
        localStorage.removeItem("admin_return_token");
        localStorage.removeItem("admin_return_role");
        localStorage.removeItem("admin_return_email");
        navigate("/login");
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
            console.error("Admin search impersonation error:", err);
            setError("Something went wrong while impersonating user");
        }
    }

    async function runSearch(searchText: string) {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${apiBaseUrl}/api/admin/search?q=${encodeURIComponent(searchText)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Search failed");
                return;
            }

            setUsers(data.users || []);
            setBusinesses(data.businesses || []);
        } catch (err) {
            console.error("Admin search error:", err);
            setError("Something went wrong while searching");
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        runSearch(query.trim());
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
        }
    }, [navigate]);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <span className="text-white">Search</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Admin Search
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Search businesses, employers, and employees by name, email, or franchise.
                    </p>
                </div>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by user name, email, or business..."
                            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                        />

                        <button
                            type="submit"
                            className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                        >
                            Search
                        </button>
                    </form>
                </section>

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="mt-6 text-slate-300">Searching...</div>
                )}

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-2xl font-semibold text-white">Businesses</h2>

                    {businesses.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                            No businesses found.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Plan</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {businesses.map((business) => (
                                        <tr
                                            key={business.id}
                                            className="border-b border-slate-800 last:border-b-0"
                                        >
                                            <td className="px-4 py-3 text-white">{business.id}</td>
                                            <td className="px-4 py-3 text-white">{business.name}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {business.subscription_plan}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {business.subscription_status}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/admin/businesses/${business.id}`)}
                                                    className="rounded-xl bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                                                >
                                                    Open Business
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <h2 className="text-2xl font-semibold text-white">Users</h2>

                    {users.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                            No users found.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Business</th>
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
                                                {user.business_name || "Internal Platform"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {user.is_active ? "Yes" : "No"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(user.role === "employer" || user.role === "employee") ? (
                                                    <button
                                                        onClick={() => impersonateUser(user.id)}
                                                        className="rounded-xl bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                                                    >
                                                        Enter Account
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
                </section>
            </div>
        </div>
    );
}

export default AdminSearchPage;