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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "super_admin") {
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
                                </tr>
                                </thead>
                                <tbody>
                                {businesses.map((business) => (
                                    <tr key={business.id} className="border-b border-slate-800 last:border-b-0">
                                        <td className="px-4 py-3 text-white">{business.id}</td>
                                        <td className="px-4 py-3 text-white">{business.name}</td>
                                        <td className="px-4 py-3 text-slate-300">{business.subscription_plan}</td>
                                        <td className="px-4 py-3 text-slate-300">{business.subscription_status}</td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {business.trial_ends_at
                                                ? new Date(business.trial_ends_at).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {business.max_employees ?? "-"}
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