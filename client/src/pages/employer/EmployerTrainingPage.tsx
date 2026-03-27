import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

function EmployerTrainingPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [staffCategories, setStaffCategories] = useState<StaffCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [staffCategoryName, setStaffCategoryName] = useState("");
    const [staffCategoryDescription, setStaffCategoryDescription] = useState("");

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function authHeaders(isJson = false) {
        const token = localStorage.getItem("token");
        return {
            ...(isJson ? { "Content-Type": "application/json" } : {}),
            Authorization: `Bearer ${token}`,
        };
    }

    async function handleJsonResponse(res: Response) {
        if (res.status === 401) {
            clearAuthAndRedirect();
            return null;
        }
        return res.json();
    }

    async function loadStaffCategories() {
        try {
            setLoadingCategories(true);
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load staff categories");
                return;
            }

            setStaffCategories(data);
        } catch (err) {
            console.error("Load staff categories error:", err);
            setError("Something went wrong while loading staff categories");
        } finally {
            setLoadingCategories(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        loadStaffCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function createStaffCategory(e: React.FormEvent) {
        e.preventDefault();

        if (!staffCategoryName.trim()) {
            setError("Staff category name is required");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    name: staffCategoryName.trim(),
                    description: staffCategoryDescription.trim() || null,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create staff category");
                return;
            }

            setStaffCategories((prev) => [data, ...prev]);
            setStaffCategoryName("");
            setStaffCategoryDescription("");
        } catch (err) {
            console.error("Create staff category error:", err);
            setError("Something went wrong while creating staff category");
        }
    }

    async function deleteStaffCategory(id: number) {
        const confirmed = window.confirm("Delete this staff category?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/staff-categories/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete staff category");
                return;
            }

            setStaffCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Delete staff category error:", err);
            setError("Something went wrong while deleting staff category");
        }
    }

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Training management
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Create categories and open training workspaces.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Build training by role, then enter each category to manage folders like a
                            workspace.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{staffCategories.length}</p>
                        </div>

                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Training Area</p>
                            <p className="mt-2 text-xl font-bold text-white">Workspace Mode</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[0.95fr_1.1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Create Staff Category</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Categories group training by role, such as Manager or Instructor.
                            </p>
                        </div>

                        <form onSubmit={createStaffCategory} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Category Name
                                </label>
                                <input
                                    value={staffCategoryName}
                                    onChange={(e) => setStaffCategoryName(e.target.value)}
                                    placeholder="e.g. Manager"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Description
                                </label>
                                <input
                                    value={staffCategoryDescription}
                                    onChange={(e) => setStaffCategoryDescription(e.target.value)}
                                    placeholder="Training for managers"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                            >
                                Create Staff Category
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Categories</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Open a category to enter its folder workspace.
                            </p>
                        </div>

                        {loadingCategories ? (
                            <p className="text-slate-300">Loading staff categories...</p>
                        ) : staffCategories.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No staff categories yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {staffCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600"
                                    >
                                        <div className="mb-3 text-3xl">🧩</div>

                                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {category.description || "Role-based category"}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Link
                                                to={`/employer/training/category/${category.id}`}
                                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                            >
                                                Open Workspace
                                            </Link>

                                            <button
                                                onClick={() => deleteStaffCategory(category.id)}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default EmployerTrainingPage;