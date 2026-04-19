import { useState } from "react";
import { Link } from "react-router-dom";

function AdminCreateSupportAdminPage() {

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [newAdminName, setNewAdminName] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [message, setMessage] = useState("");

    async function createSupportAdmin(e: React.FormEvent) {
        e.preventDefault();

        try {
            setMessage("");

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
                setMessage(data.message || "Failed to create support admin");
                return;
            }

            setMessage(`Support admin created: ${data.email}`);
            setNewAdminName("");
            setNewAdminEmail("");
            setNewAdminPassword("");
        } catch (err) {
            console.error("Create support admin error:", err);
            setMessage("Something went wrong while creating support admin");
        }
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
                    <Link to="/admin" className="hover:text-white">
                        Admin
                    </Link>
                    <span>/</span>
                    <span className="text-white">Create Support Admin</span>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                        Create Support Admin
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        Super admins can create support admins for internal platform management.
                    </p>

                    {message && (
                        <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                            {message}
                        </div>
                    )}

                    <form onSubmit={createSupportAdmin} className="mt-6 grid gap-4 md:grid-cols-3">
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
                </div>
            </div>
        </div>
    );
}

export default AdminCreateSupportAdminPage;