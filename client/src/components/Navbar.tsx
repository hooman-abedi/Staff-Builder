import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    const isLoggedIn = Boolean(token);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-lg font-bold text-sky-300">
                            SB
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                                Staff Builder
                            </p>
                            <p className="text-xs text-slate-400">Training platform</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        <Link
                            to="/"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Home
                        </Link>

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
                            <Link
                                to="/employer"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Employer Dashboard
                            </Link>
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

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-right sm:block">
                                <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
                                <p className="max-w-[220px] truncate text-sm text-slate-200">{email}</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400 sm:block">
                            Not logged in
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;