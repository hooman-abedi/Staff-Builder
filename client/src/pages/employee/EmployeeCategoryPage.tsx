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

function EmployeeCategoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [category, setCategory] = useState<StaffCategory | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function authHeaders() {
        const token = localStorage.getItem("token");
        return {
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

            const categoryRes = await fetch(`${apiBaseUrl}/api/employee/my-categories`, {
                headers: authHeaders(),
            });
            const categoryData = await handleJsonResponse(categoryRes);
            if (!categoryData) return;

            if (!categoryRes.ok) {
                setError(categoryData.message || "Failed to load categories");
                return;
            }

            const foundCategory = (categoryData as StaffCategory[]).find(
                (item) => item.id === Number(id)
            );

            if (!foundCategory) {
                setError("Assigned category not found");
                return;
            }

            setCategory(foundCategory);

            const foldersRes = await fetch(
                `${apiBaseUrl}/api/employee/my-folders?staff_category_id=${id}`,
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
            console.error("Load employee category page error:", err);
            setError("Something went wrong while loading this category");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employee") {
            navigate("/login");
            return;
        }

        loadPageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <Link to="/employee" className="hover:text-white">
                            Dashboard
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
                        {category?.description || "Open a folder to view your assigned training."}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white">Folders</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Open a folder to enter its training workspace.
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
                                    className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-600"
                                >
                                    <div className="mb-3 text-4xl">📁</div>

                                    <h3 className="text-xl font-semibold text-white">{folder.name}</h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {folder.description || "Training folder"}
                                    </p>

                                    <div className="mt-4">
                                        <Link
                                            to={`/employee/folder/${folder.id}`}
                                            className="inline-block rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                        >
                                            Open Workspace
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default EmployeeCategoryPage;