import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AdminNotification = {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    related_business_id: number | null;
    related_request_id: number | null;
    created_at: string;
};

function AdminHomePage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [email] = useState(() => localStorage.getItem("email") || "");
    const [role] = useState(() => localStorage.getItem("role") || "");
    const [pendingSubscriptionRequests, setPendingSubscriptionRequests] = useState(0);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);

    const [newAdminName, setNewAdminName] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [adminCreateMessage, setAdminCreateMessage] = useState("");

    async function createSupportAdmin(e: React.FormEvent) {
        e.preventDefault();

        try {
            setAdminCreateMessage("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/create-support-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: newAdminName,
                    email: newAdminEmail,
                    password: newAdminPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setAdminCreateMessage(data.message || "Failed to create support admin");
                return;
            }

            setAdminCreateMessage(`Support admin created: ${data.email}`);
            setNewAdminName("");
            setNewAdminEmail("");
            setNewAdminPassword("");
        } catch (err) {
            console.error("Create support admin error:", err);
            setAdminCreateMessage("Something went wrong while creating support admin");
        }
    }


    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (savedRole !== "super_admin" && savedRole !== "support_admin") {
            navigate("/login");
            return;
        }

        let cancelled = false;

        async function init() {
            try {
                const res = await fetch(`${apiBaseUrl}/api/admin/subscription-requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    return;
                }

                const data = await res.json();

                if (cancelled) return;

                const pendingCount = (data || []).filter(
                    (request: { status: string }) => request.status === "pending"
                ).length;

                setPendingSubscriptionRequests(pendingCount);

                const notificationsRes = await fetch(`${apiBaseUrl}/api/admin/notifications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (notificationsRes.ok) {
                    const notificationsData = await notificationsRes.json();

                    if (!cancelled) {
                        setNotifications(notificationsData);
                    }
                }
            } catch (err) {
                console.error("Load pending subscription requests error:", err);
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl, navigate]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("impersonating");
        localStorage.removeItem("admin_return_token");
        localStorage.removeItem("admin_return_role");
        localStorage.removeItem("admin_return_email");
        navigate("/login");
    }
    async function markNotificationAsRead(notificationId: number) {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${apiBaseUrl}/api/admin/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                return;
            }

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (err) {
            console.error("Mark notification as read error:", err);
        }
    }

    function openNotification(notification: AdminNotification) {
        if (notification.related_request_id) {
            navigate("/admin/subscription-requests");
            return;
        }

        if (notification.related_business_id) {
            navigate(`/admin/businesses/${notification.related_business_id}`);
            return;
        }
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-300">
                            Internal platform access
                        </p>

                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Admin control center.
                        </h1>

                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Use this internal workspace to manage platform users, support customers,
                            test unrestricted flows, and oversee business accounts.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                            <p className="mt-1 font-semibold text-white">{role || "Admin"}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                            <p className="mt-1 font-semibold text-white">{email || "-"}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <p className="text-sm text-slate-400">Notifications</p>

                    <p className="mt-3 text-2xl font-bold text-white">
                        {unreadCount}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Unread system notifications.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Subscription Requests</p>
                        <p className="mt-3 text-2xl font-bold text-white">{pendingSubscriptionRequests}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Pending subscription requests waiting for admin review.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Customer Support</p>
                        <p className="mt-3 text-2xl font-bold text-white">Enabled</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Admin can view and update employer and employee accounts.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Restrictions</p>
                        <p className="mt-3 text-2xl font-bold text-emerald-300">Bypassed</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Subscription and trial restrictions can be bypassed for internal testing.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-sm text-slate-400">Next Admin Tools</p>
                        <p className="mt-3 text-2xl font-bold text-white">Back Office</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Businesses, employers, employees, subscription controls, and support actions.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Current Responsibilities</h2>
                        <ul className="mt-4 space-y-3 text-slate-300">
                            <li>• Internal testing without normal customer plan restrictions</li>
                            <li>• Platform-level access separate from employer and employee roles</li>
                            <li>• Account support for employers and employees</li>
                            <li>• Subscription and trial management tools</li>
                        </ul>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Back-Office Navigation</h2>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate("/admin/businesses")}
                                className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                            >
                                View Businesses
                            </button>

                            <button
                                onClick={() => navigate("/admin/users")}
                                className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                View Users
                            </button>

                            <button
                                onClick={() => navigate("/admin/search")}
                                className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                Global Search
                            </button>

                            <button
                                onClick={() => navigate("/admin/subscription-requests")}
                                className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                Subscription Requests
                                {pendingSubscriptionRequests > 0 ? ` (${pendingSubscriptionRequests})` : ""}
                            </button>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                            Use these tools to monitor businesses, inspect users, and review platform actions.
                        </p>
                    </section>

                    <button
                        onClick={() => navigate("/admin/users/active")}
                        className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                    >
                        Active Users
                    </button>

                    <button
                        onClick={() => navigate("/admin/users/inactive")}
                        className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                    >
                        Inactive Users
                    </button>

                    {role === "super_admin" && (
                        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                            <h2 className="text-2xl font-semibold text-white">Create Support Admin</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Super admins can create support admins for internal platform management.
                            </p>

                            {adminCreateMessage && (
                                <div
                                    className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                                    {adminCreateMessage}
                                </div>
                            )}

                            <form onSubmit={createSupportAdmin} className="mt-4 grid gap-4 md:grid-cols-3">
                                <input
                                    value={newAdminName}
                                    onChange={(e) => setNewAdminName(e.target.value)}
                                    placeholder="Full name"
                                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />

                                <input
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    placeholder="Email"
                                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />

                                <input
                                    type="password"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    placeholder="Temporary password"
                                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />

                                <div className="md:col-span-3">
                                    <button
                                        type="submit"
                                        className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                                    >
                                        Create Support Admin
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                        <h2 className="text-2xl font-semibold text-white">Recent Notifications</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Latest admin-facing platform updates and subscription events.
                        </p>

                        {notifications.length === 0 ? (
                            <div
                                className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => openNotification(notification)}
                                        className={`rounded-2xl border p-4 cursor-pointer transition hover:border-slate-600 ${
                                            notification.is_read
                                                ? "border-slate-800 bg-slate-950/70"
                                                : "border-amber-500/30 bg-amber-500/5"
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="font-semibold text-white">{notification.title}</p>

                                            <div className="flex items-center gap-2">
        <span
            className={
                notification.is_read
                    ? "rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300"
                    : "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300"
            }
        >
            {notification.is_read ? "Read" : "Unread"}
        </span>

                                                {!notification.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markNotificationAsRead(notification.id);
                                                        }}
                                                        className="rounded-xl bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-2 text-sm text-slate-300">{notification.message}</p>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
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

export default AdminHomePage;