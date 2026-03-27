import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

type Folder = {
    id: number;
    business_id: number;
    staff_category_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

function EmployerCategoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [category, setCategory] = useState<StaffCategory | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    const [folderName, setFolderName] = useState("");
    const [folderDescription, setFolderDescription] = useState("");

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

    async function loadPageData() {
        if (!id) {
            setError("Missing category id");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const categoryRes = await fetch(`${apiBaseUrl}/api/staff-categories`, {
                headers: authHeaders(),
            });
            const categoryData = await handleJsonResponse(categoryRes);
            if (!categoryData) return;

            if (!categoryRes.ok) {
                setError(categoryData.message || "Failed to load staff categories");
                return;
            }

            const foundCategory = (categoryData as StaffCategory[]).find(
                (item) => item.id === Number(id)
            );

            if (!foundCategory) {
                setError("Category not found");
                return;
            }

            setCategory(foundCategory);

            const foldersRes = await fetch(
                `${apiBaseUrl}/api/folders?staff_category_id=${id}`,
                {
                    headers: authHeaders(),
                }
            );
            const foldersData = await handleJsonResponse(foldersRes);
            if (!foldersData) return;

            if (!foldersRes.ok) {
                setError(foldersData.message || "Failed to load folders");
                return;
            }

            setFolders(foldersData as Folder[]);
        } catch (err) {
            console.error("Load category page error:", err);
            setError("Something went wrong while loading this category");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        loadPageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function createFolder(e: React.FormEvent) {
        e.preventDefault();

        if (!id) {
            setError("Missing category id");
            return;
        }

        if (!folderName.trim()) {
            setError("Folder name is required");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/folders`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    staff_category_id: Number(id),
                    name: folderName.trim(),
                    description: folderDescription.trim() || null,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create folder");
                return;
            }

            setFolders((prev) => [data as Folder, ...prev]);
            setFolderName("");
            setFolderDescription("");
        } catch (err) {
            console.error("Create folder error:", err);
            setError("Something went wrong while creating folder");
        }
    }

    async function deleteFolder(folderId: number) {
        const confirmed = window.confirm("Delete this folder?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/folders/${folderId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete folder");
                return;
            }

            setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
        } catch (err) {
            console.error("Delete folder error:", err);
            setError("Something went wrong while deleting folder");
        }
    }

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <Link to="/employer" className="hover:text-white">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link to="/employer/training" className="hover:text-white">
                            Training
                        </Link>
                        <span>/</span>
                        <span className="text-white">
              {loading ? "Loading..." : category?.name || "Category"}
            </span>
                    </div>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        {loading ? "Loading category..." : category?.name || "Category"}
                    </h1>

                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                        {category?.description || "Manage folders inside this category."}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[0.95fr_1.1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Create Folder</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Add a folder inside this category.
                            </p>
                        </div>

                        <form onSubmit={createFolder} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Folder Name
                                </label>
                                <input
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    placeholder="Leadership"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Description
                                </label>
                                <input
                                    value={folderDescription}
                                    onChange={(e) => setFolderDescription(e.target.value)}
                                    placeholder="Leadership training files"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
                            >
                                Create Folder
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Folders</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Open a folder to enter its workspace.
                            </p>
                        </div>

                        {loading ? (
                            <p className="text-slate-300">Loading folders...</p>
                        ) : folders.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No folders in this category yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                                    >
                                        <div className="mb-3 text-4xl">📁</div>

                                        <h3 className="text-xl font-semibold text-white">{folder.name}</h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {folder.description || "Training folder"}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Link
                                                to={`/employer/training/folder/${folder.id}`}
                                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                            >
                                                Open Workspace
                                            </Link>

                                            <button
                                                onClick={() => deleteFolder(folder.id)}
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

export default EmployerCategoryPage;