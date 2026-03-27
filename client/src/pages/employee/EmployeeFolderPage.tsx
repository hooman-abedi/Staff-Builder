import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
type Quiz = {
    id: number;
    title: string;
    passing_score: number;
};



function EmployeeFolderPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
    const [completions, setCompletions] = useState<Completion[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingCompleteId, setMarkingCompleteId] = useState<number | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

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
            setError("Missing folder id");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const itemsRes = await fetch(
                `${apiBaseUrl}/api/employee/my-training-items?folder_id=${id}`,
                {
                    headers: authHeaders(),
                }
            );
            const itemsData = await handleJsonResponse(itemsRes);
            if (!itemsData) return;

            if (!itemsRes.ok) {
                setError(itemsData.message || "Failed to load training items");
                return;
            }

            setTrainingItems(itemsData as TrainingItem[]);

            const completionsRes = await fetch(`${apiBaseUrl}/api/employee/completions`, {
                headers: authHeaders(),
            });
            const completionsData = await handleJsonResponse(completionsRes);
            if (!completionsData) return;

            if (!completionsRes.ok) {
                setError(completionsData.message || "Failed to load completions");
                return;
            }

            setCompletions(completionsData as Completion[]);
        } catch (err) {
            console.error("Load employee folder page error:", err);
            setError("Something went wrong while loading this folder");
        } finally {
            setLoading(false);
        }
    }
    async function loadQuizzes(folderId: string) {
        try {
            const res = await fetch(
                `${apiBaseUrl}/api/employee/quizzes?folder_id=${folderId}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();

            if (!res.ok) return;

            setQuizzes(data);
        } catch (err) {
            console.error("Load quizzes error:", err);
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
        if (id) {
            loadQuizzes(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function isCompleted(trainingItemId: number) {
        return completions.some((c) => c.training_item_id === trainingItemId);
    }

    async function markComplete(trainingItemId: number) {
        if (isCompleted(trainingItemId)) return;

        try {
            setError("");
            setMarkingCompleteId(trainingItemId);

            const res = await fetch(`${apiBaseUrl}/api/employee/completions`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    training_item_id: trainingItemId,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to mark item complete");
                return;
            }

            await loadPageData();
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

    const completedCount = useMemo(
        () => trainingItems.filter((item) => isCompleted(item.id)).length,
        [trainingItems, completions]
    );

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <Link to="/employee" className="hover:text-white">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span className="text-white">Folder Workspace</span>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300">
                                Folder workspace
                            </p>

                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                                Training Folder
                            </h1>

                            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                                Read, watch, and complete the training items assigned inside this folder.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                                <p className="text-sm text-slate-400">Items in Folder</p>
                                <p className="mt-2 text-3xl font-bold text-white">{trainingItems.length}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                                <p className="text-sm text-slate-400">Completed Here</p>
                                <p className="mt-2 text-3xl font-bold text-emerald-300">{completedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}
                {quizzes.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Quizzes</h3>

                        <div className="space-y-3">
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="rounded-xl border border-slate-700 bg-slate-900 p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold">{quiz.title}</p>
                                        <p className="text-sm text-slate-400">
                                            Passing score: {quiz.passing_score}%
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/employee/quiz/${quiz.id}`)}
                                        className="bg-violet-500 px-4 py-2 rounded-xl hover:bg-violet-400"
                                    >
                                        Take Quiz
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/5">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white">Folder Contents</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Open links, view files, read text content, and mark items complete.
                        </p>
                    </div>

                    {loading ? (
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
                                        <div className="mb-4 flex items-start justify-between gap-4">
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

                                        <div className="flex flex-wrap gap-2">
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20"
                                                >
                                                    Open Link
                                                </a>
                                            )}

                                            {item.file_path && (
                                                <a
                                                    href={`${apiBaseUrl}${item.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                                                >
                                                    Open File
                                                </a>
                                            )}

                                            {!completed && (
                                                <button
                                                    onClick={() => markComplete(item.id)}
                                                    disabled={markingCompleteId === item.id}
                                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {markingCompleteId === item.id ? "Marking..." : "Mark Complete"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default EmployeeFolderPage;