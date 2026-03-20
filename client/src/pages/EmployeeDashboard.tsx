import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

type TrainingItem = {
    id: number;
    business_id: number;
    folder_id: number;
    type: string;
    title: string;
    url: string | null;
    file_path: string | null;
    body: string | null;
    created_at: string;
};

type Completion = {
    id: number;
    business_id: number;
    user_id: number;
    training_item_id: number;
    completed_at: string;
    training_item_title: string;
    training_item_type: string;
};

function EmployeeDashboard() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<StaffCategory[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
    const [completions, setCompletions] = useState<Completion[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedFolderName, setSelectedFolderName] = useState("");

    const [error, setError] = useState("");
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [markingCompleteId, setMarkingCompleteId] = useState<number | null>(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    function getToken() {
        return localStorage.getItem("token");
    }

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function closeCategory() {
        setSelectedCategoryId(null);
        setSelectedCategoryName("");
        setFolders([]);
        closeFolder();
    }

    function closeFolder() {
        setSelectedFolderId(null);
        setSelectedFolderName("");
        setTrainingItems([]);
    }

    async function loadMyCategories() {
        try {
            setError("");
            setLoadingCategories(true);

            const token = getToken();

            const res = await fetch(`${apiBaseUrl}/api/employee/my-categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401 || res.status === 403) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load categories");
                return;
            }

            setCategories(data);
        } catch (err) {
            console.error("Load employee categories error:", err);
            setError("Something went wrong while loading categories");
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadMyFolders(staffCategoryId: number, categoryName: string) {
        try {
            setError("");
            setLoadingFolders(true);

            setSelectedCategoryId(staffCategoryId);
            setSelectedCategoryName(categoryName);
            setSelectedFolderId(null);
            setSelectedFolderName("");
            setTrainingItems([]);

            const token = getToken();

            const res = await fetch(
                `${apiBaseUrl}/api/employee/my-folders?staff_category_id=${staffCategoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 401 || res.status === 403) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load folders");
                return;
            }

            setFolders(data);
        } catch (err) {
            console.error("Load employee folders error:", err);
            setError("Something went wrong while loading folders");
        } finally {
            setLoadingFolders(false);
        }
    }

    async function loadMyTrainingItems(folderId: number, folderName: string) {
        try {
            setError("");
            setLoadingItems(true);

            setSelectedFolderId(folderId);
            setSelectedFolderName(folderName);

            const token = getToken();

            const res = await fetch(
                `${apiBaseUrl}/api/employee/my-training-items?folder_id=${folderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 401 || res.status === 403) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load training items");
                return;
            }

            setTrainingItems(data);
        } catch (err) {
            console.error("Load employee training items error:", err);
            setError("Something went wrong while loading training items");
        } finally {
            setLoadingItems(false);
        }
    }

    async function loadMyCompletions() {
        try {
            const token = getToken();

            const res = await fetch(`${apiBaseUrl}/api/employee/completions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401 || res.status === 403) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to load completions");
                return;
            }

            setCompletions(data);
        } catch (err) {
            console.error("Load completions error:", err);
            setError("Something went wrong while loading completions");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employee") {
            navigate("/login");
            return;
        }

        loadMyCategories();
        loadMyCompletions();
    }, []);

    function isCompleted(trainingItemId: number) {
        return completions.some((c) => c.training_item_id === trainingItemId);
    }

    async function markComplete(trainingItemId: number) {
        if (isCompleted(trainingItemId)) return;

        try {
            setError("");
            setMarkingCompleteId(trainingItemId);

            const token = getToken();

            const res = await fetch(`${apiBaseUrl}/api/employee/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    training_item_id: trainingItemId,
                }),
            });

            if (res.status === 401 || res.status === 403) {
                clearAuthAndRedirect();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to mark item complete");
                return;
            }

            await loadMyCompletions();
        } catch (err) {
            console.error("Mark complete error:", err);
            setError("Something went wrong while marking item complete");
        } finally {
            setMarkingCompleteId(null);
        }
    }

    function getItemIcon(type: string) {
        switch (type) {
            case "document":
                return "📄";
            case "video":
                return "🎥";
            case "link":
                return "🔗";
            case "text":
                return "📝";
            default:
                return "📘";
        }
    }

    const completedCount = useMemo(() => completions.length, [completions]);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Employee workspace
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Your assigned training, organized clearly.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Open your assigned categories, browse training folders, review files or notes,
                            and mark your lessons complete as you go.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Assigned Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{categories.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Completed Items</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-300">{completedCount}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[1.15fr_1fr]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">Assigned Categories</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Open a role category to view its folders.
                                    </p>
                                </div>
                            </div>

                            {loadingCategories ? (
                                <p className="text-slate-300">Loading categories...</p>
                            ) : categories.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No categories assigned yet.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {categories.map((category) => {
                                        const isOpen = selectedCategoryId === category.id;

                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => loadMyFolders(category.id, category.name)}
                                                className={`rounded-3xl border p-5 text-left transition ${
                                                    isOpen
                                                        ? "border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                                                        : "border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-950"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="mb-3 text-3xl">🧩</div>
                                                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                                            {category.description || "Role-based training category"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            isOpen
                                                                ? "bg-sky-500/20 text-sky-300"
                                                                : "bg-slate-800 text-slate-300"
                                                        }`}
                                                    >
                            {isOpen ? "Open" : "View"}
                          </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {selectedCategoryId && (
                            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-slate-400">
                                            Open Category
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-white">
                                            {selectedCategoryName}
                                        </h2>
                                    </div>

                                    <button
                                        onClick={closeCategory}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                                    >
                                        Close Category
                                    </button>
                                </div>

                                {loadingFolders ? (
                                    <p className="text-slate-300">Loading folders...</p>
                                ) : folders.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                        No folders in this category yet.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {folders.map((folder) => {
                                            const isOpen = selectedFolderId === folder.id;

                                            return (
                                                <button
                                                    key={folder.id}
                                                    type="button"
                                                    onClick={() => loadMyTrainingItems(folder.id, folder.name)}
                                                    className={`rounded-3xl border p-5 text-left transition ${
                                                        isOpen
                                                            ? "border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                                                            : "border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-950"
                                                    }`}
                                                >
                                                    <div className="mb-3 text-4xl">📁</div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-white">{folder.name}</h3>
                                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                                {folder.description || "Training folder"}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                isOpen
                                                                    ? "bg-amber-500/20 text-amber-300"
                                                                    : "bg-slate-800 text-slate-300"
                                                            }`}
                                                        >
                              {isOpen ? "Opened" : "Open"}
                            </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-slate-400">
                                        Training Viewer
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-white">
                                        {selectedFolderId ? selectedFolderName : "Select a folder"}
                                    </h2>
                                </div>

                                {selectedFolderId && (
                                    <button
                                        onClick={closeFolder}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                                    >
                                        Close Folder
                                    </button>
                                )}
                            </div>

                            {!selectedFolderId ? (
                                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-slate-400">
                                    Open a category, then open a folder to view your training items.
                                </div>
                            ) : loadingItems ? (
                                <p className="text-slate-300">Loading training items...</p>
                            ) : trainingItems.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No training items in this folder yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {trainingItems.map((item) => {
                                        const completed = isCompleted(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                                            >
                                                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl">
                                                            {getItemIcon(item.type)}
                                                        </div>

                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                                  {item.type}
                                </span>
                                                                {completed && (
                                                                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                                    Completed
                                  </span>
                                                                )}
                                                            </div>

                                                            {item.body && (
                                                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                                                    {item.body}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    {item.url && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20"
                                                        >
                                                            Open Link
                                                        </a>
                                                    )}

                                                    {item.file_path && (
                                                        <a
                                                            href={`${apiBaseUrl}${item.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                                                        >
                                                            Open File
                                                        </a>
                                                    )}

                                                    {!completed && (
                                                        <button
                                                            onClick={() => markComplete(item.id)}
                                                            disabled={markingCompleteId === item.id}
                                                            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {markingCompleteId === item.id
                                                                ? "Marking..."
                                                                : "Mark Complete"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-5">
                                <h2 className="text-2xl font-semibold text-white">My Completed Items</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    A quick history of finished training items.
                                </p>
                            </div>

                            {completions.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No completed items yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completions.map((completion) => (
                                        <div
                                            key={completion.id}
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-white">
                                                    {completion.training_item_title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {completion.training_item_type}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        Completed
                      </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;