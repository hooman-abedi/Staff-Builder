import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type NotificationItem = {
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

function NotificationsPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

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

    function getNotificationsEndpoint() {
        if (role === "super_admin" || role === "support_admin") {
            return `${apiBaseUrl}/api/admin/notifications`;
        }

        if (role === "employer" || role === "employee") {
            return `${apiBaseUrl}/api/notifications`;
        }

        return null;
    }
    function openNotification(notification: NotificationItem) {
        if (role === "super_admin" || role === "support_admin") {
            if (notification.related_request_id) {
                navigate("/admin/subscription-requests");
                return;
            }

            if (notification.related_business_id) {
                navigate(`/admin/businesses/${notification.related_business_id}`);
                return;
            }
        }

        if (role === "employer") {
            if (notification.related_request_id) {
                navigate("/employer/training");
                return;
            }

            if (notification.related_business_id) {
                navigate("/employer");
                return;
            }
        }

        if (role === "employee") {
            navigate("/employee");
        }
    }
    async function loadNotifications() {
        try {
            setLoading(true);
            setError("");

            const endpoint = getNotificationsEndpoint();

            if (!endpoint) {
                setError("Notifications are not available for this role yet.");
                return;
            }

            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await res.json();

            if (res.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to load notifications");
                return;
            }

            setNotifications(data);
        } catch (err) {
            console.error("Load notifications error:", err);
            setError("Something went wrong while loading notifications");
        } finally {
            setLoading(false);
        }
    }

    async function markNotificationAsRead(notificationId: number) {
        try {
            let endpoint: string | null = null;

            if (role === "super_admin" || role === "support_admin") {
                endpoint = `${apiBaseUrl}/api/admin/notifications/${notificationId}/read`;
            } else if (role === "employer" || role === "employee") {
                endpoint = `${apiBaseUrl}/api/notifications/${notificationId}/read`;
            }

            if (!endpoint) {
                return;
            }

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
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

            window.dispatchEvent(new Event("notifications-updated"));
        } catch (err) {
            console.error("Mark notification as read error:", err);
        }
    }
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        function handleNotificationsUpdated() {
            loadNotifications();
        }
        console.log("NOTIFICATIONS PAGE ROLE:", role);
        console.log("NOTIFICATIONS PAGE ENDPOINT:", getNotificationsEndpoint());
        loadNotifications();
        window.addEventListener("notifications-updated", handleNotificationsUpdated);

        return () => {
            window.removeEventListener("notifications-updated", handleNotificationsUpdated);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold md:text-5xl">Notifications</h1>
                    <p className="mt-3 text-lg text-slate-300">
                        View recent system activity and important platform events.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">
                        No notifications found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}

                                onClick={() => {
                                    openNotification(notification);

                                    if (!notification.is_read) {
                                        markNotificationAsRead(notification.id);
                                    }
                                }}
                                className={`rounded-2xl border p-4 transition ${
                                    notification.is_read
                                        ? "border-slate-800 bg-slate-900/50"
                                        : "border-sky-500/40 bg-sky-500/10"
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
                                                onClick={() => markNotificationAsRead(notification.id)}
                                                className="text-xs text-sky-400 hover:underline"
                                            >
                                                Mark as read
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
            </div>
        </div>
    );
}

export default NotificationsPage;