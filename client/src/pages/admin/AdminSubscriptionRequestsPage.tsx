import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type SubscriptionRequest = {
    id: number;
    business_id: number;
    business_name: string;
    requested_by_user_id: number;
    requested_by_name: string | null;
    requested_by_email: string;
    requested_plan: string;
    requested_max_employees: number;
    status: string;
    admin_note: string | null;
    reviewed_by_user_id: number | null;
    reviewed_at: string | null;
    created_at: string;
};

function AdminSubscriptionRequestsPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
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

    async function loadRequests() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/subscription-requests`, {
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
                setError(data.message || "Failed to load subscription requests");
                return;
            }

            setRequests(data);
        } catch (err) {
            console.error("Load admin subscription requests error:", err);
            setError("Something went wrong while loading subscription requests");
        } finally {
            setLoading(false);
        }
    }

    async function reviewRequest(requestId: number, action: "approve" | "reject") {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${apiBaseUrl}/api/admin/subscription-requests/${requestId}/review`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action,
                        admin_note: action === "reject" ? "Request rejected by admin" : null,
                    }),
                }
            );

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to review request");
                return;
            }

            await loadRequests();
        } catch (err) {
            console.error("Review subscription request error:", err);
            setError("Something went wrong while reviewing request");
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

        loadRequests();
    }, [navigate]);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <span className="text-white">Subscription Requests</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Subscription Requests
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Review employer subscription upgrade requests and approve or reject them.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading requests...</p>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        No subscription requests found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
                            >
                                <h2 className="text-xl font-semibold text-white">
                                    {request.business_name}
                                </h2>

                                <div className="mt-3">
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

                                <p className="mt-2 text-sm text-slate-300">
                                    Requested plan: {request.requested_plan}
                                </p>

                                <p className="mt-2 text-sm text-slate-300">
                                    Requested employee limit: {request.requested_max_employees}
                                </p>

                                <p className="mt-2 text-sm text-slate-400">
                                    Requested on: {new Date(request.created_at).toLocaleString()}
                                </p>


                                {request.admin_note && (
                                    <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                                            Admin Note
                                        </p>
                                        <p className="mt-1 text-sm text-amber-100">{request.admin_note}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => reviewRequest(request.id, "approve")}
                                        disabled={request.status !== "pending"}
                                        className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => reviewRequest(request.id, "reject")}
                                        disabled={request.status !== "pending"}
                                        className="rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminSubscriptionRequestsPage;