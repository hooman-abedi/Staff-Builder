import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950">
            <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
                <div className="grid gap-10 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-lg font-bold text-sky-300">
                                SB
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                                    Staff Builder
                                </p>
                                <p className="text-xs text-slate-400">Training platform</p>
                            </div>
                        </div>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                            Organize staff training with categories, folders, files, videos, and
                            completion tracking in one place.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Product
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="transition hover:text-white">
                                    Start Free Trial
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Company
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="transition hover:text-white">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Legal
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>© 2026 Staff Builder. All rights reserved.</p>
                    <p>Built for employers who want structured, trackable staff training.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;