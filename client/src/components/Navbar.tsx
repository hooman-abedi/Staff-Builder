import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect} from "react";

function Navbar() {
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const navigate = useNavigate();

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const isImpersonating = localStorage.getItem("impersonating") === "true";

    useEffect(() => {
        async function loadUnreadNotificationsCount() {
            try {
                if (!token) {
                    setUnreadNotificationsCount(0);
                    return;
                }

                let endpoint: string | null = null;

                if (role === "super_admin" || role === "support_admin") {
                    endpoint = `${apiBaseUrl}/api/admin/notifications`;
                } else if (role === "employer") {
                    endpoint = `${apiBaseUrl}/api/notifications`;
                }

                if (!endpoint) {
                    setUnreadNotificationsCount(0);
                    return;
                }

                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-cache",
                });

                if (!res.ok) {
                    return;
                }

                const data = await res.json();

                const unreadCount = (data || []).filter(
                    (notification: { is_read: boolean }) => !notification.is_read
                ).length;

                setUnreadNotificationsCount(unreadCount);
            } catch (err) {
                console.error("Load navbar unread notifications count error:", err);
            }
        }

        function handleNotificationsUpdated() {
            void loadUnreadNotificationsCount();
        }

        void loadUnreadNotificationsCount();
        window.addEventListener("notifications-updated", handleNotificationsUpdated);

        return () => {
            window.removeEventListener("notifications-updated", handleNotificationsUpdated);
        };
    }, [apiBaseUrl, token, role]);



    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }
    function handleReturnToAdmin() {
        const adminReturnToken = localStorage.getItem("admin_return_token");
        const adminReturnRole = localStorage.getItem("admin_return_role");
        const adminReturnEmail = localStorage.getItem("admin_return_email");

        if (!adminReturnToken || !adminReturnRole) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("email");
            localStorage.removeItem("impersonating");
            localStorage.removeItem("admin_return_token");
            localStorage.removeItem("admin_return_role");
            localStorage.removeItem("admin_return_email");
            window.location.href = "/login";
            return;
        }

        localStorage.setItem("token", adminReturnToken);
        localStorage.setItem("role", adminReturnRole);
        localStorage.setItem("email", adminReturnEmail || "");

        localStorage.removeItem("impersonating");
        localStorage.removeItem("admin_return_token");
        localStorage.removeItem("admin_return_role");
        localStorage.removeItem("admin_return_email");

        window.location.href = "/admin";
    }
    function handleLogoClick() {
        if (!token) {
            navigate("/");
            return;
        }

        if (role === "super_admin" || role === "support_admin") {
            navigate("/admin");
            return;
        }

        if (role === "employer") {
            navigate("/employer");
            return;
        }

        if (role === "employee") {
            navigate("/employee");
            return;
        }

        navigate("/");
    }

    const isLoggedIn = Boolean(token);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
                <div className="flex items-center gap-8">
                    <div
                        onClick={handleLogoClick}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="Staff Builder Logo"
                                className="h-10 w-10 object-contain"
                            />
                            <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-wide">
            STAFF BUILDER
        </span>
                                <span className="text-xs text-slate-400">
            Training platform
        </span>
                            </div>
                        </div>
                    </div>


                    <nav className="hidden items-center gap-6 md:flex">
                {!isLoggedIn && (
                            <Link
                                to="/"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Home
                            </Link>
                        )}


                        {!isLoggedIn && (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {isLoggedIn && role === "employer" && (
                            <>
                                <Link
                                    to="/employer"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/employer/employees"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Employees
                                </Link>
                                <Link
                                    to="/employer/training"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Training
                                </Link>
                                <Link
                                    to="/employer/progress"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Progress
                                </Link>
                            </>
                        )}

                        {isLoggedIn && role === "employee" && (
                            <Link
                                to="/employee"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Employee Dashboard
                            </Link>
                        )}
                    </nav>
                </div>
                {isLoggedIn && (role === "super_admin" || role === "support_admin") && (
                    <>
                        <Link
                            to="/admin"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Admin Home
                        </Link>

                        <Link
                            to="/admin/businesses"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Businesses
                        </Link>

                        <Link
                            to="/admin/users"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Users
                        </Link>

                        <Link
                            to="/admin/search"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Search
                        </Link>

                        <Link
                            to="/admin/subscription-requests"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Requests
                        </Link>

                        {role === "super_admin" && (
                            <Link
                                to="/admin/create-admin"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Create Admin
                            </Link>
                        )}
                    </>
                )}

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div
                                className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-right sm:block">
                                <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
                                <p className="max-w-[220px] truncate text-sm text-slate-200">{email}</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                            >
                                Logout
                            </button>
                            <button
                                onClick={() => navigate("/notifications")}
                                className="relative rounded-xl border border-slate-700 px-3 py-2 text-white hover:bg-slate-800"
                            >
                                🔔

                                {unreadNotificationsCount > 0 && (
                                    <span
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {unreadNotificationsCount}
        </span>
                                )}
                            </button>
                            {isImpersonating && (
                                <button
                                    onClick={handleReturnToAdmin}
                                    className="rounded-2xl bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400"
                                >
                                    Return to Admin
                                </button>
                            )}

                        </>
                    ) : (
                        <div
                            className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400 sm:block">
                            Not logged in
                        </div>

                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;