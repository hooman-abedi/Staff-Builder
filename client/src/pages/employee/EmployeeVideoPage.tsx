import { useEffect, useState } from "react";
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

function EmployeeVideoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [item, setItem] = useState<TrainingItem | null>(null);
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

    async function loadVideoItem() {
        if (!id) {
            setError("Missing training item id");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/employee/all-training-items`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load video");
                return;
            }

            const found = (data as TrainingItem[]).find(
                (trainingItem) => trainingItem.id === Number(id)
            );

            if (!found) {
                setError("Video not found");
                return;
            }

            if (found.type !== "video") {
                setError("This training item is not a video");
                return;
            }

            setItem(found);
        } catch (err) {
            console.error("Load video item error:", err);
            setError("Something went wrong while loading the video");
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

        loadVideoItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <Link to="/employee" className="hover:text-white">
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-white">Video Viewer</span>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-300">Loading video...</p>
                ) : item ? (
                    <div className="space-y-6">
                        <div>
                            <p className="mb-3 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-300">
                                Video training
                            </p>

                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                                {item.title}
                            </h1>

                            {item.body && (
                                <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
                                    {item.body}
                                </p>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-violet-500/5">
                            {item.file_path ? (
                                <video
                                    controls
                                    controlsList="nodownload"
                                    className="w-full rounded-2xl bg-black"
                                >
                                    <source src={`${apiBaseUrl}${item.file_path}`} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : item.url ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
                                    <p className="mb-4 text-slate-300">
                                        This video is hosted externally.
                                    </p>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                                    >
                                        Open External Video
                                    </a>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-slate-400">
                                    No video source is available.
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default EmployeeVideoPage;