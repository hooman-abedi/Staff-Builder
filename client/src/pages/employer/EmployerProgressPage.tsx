import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Completion = {
    id: number;
    business_id: number;
    user_id: number;
    training_item_id: number;
    completed_at: string;
    employee_name: string;
    employee_email: string;
    training_item_title: string;
    training_item_type: string;
};

function EmployerProgressPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [completions, setCompletions] = useState<Completion[]>([]);
    const [loadingCompletions, setLoadingCompletions] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

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

    async function loadCompletions() {
        try {
            setLoadingCompletions(true);

            const res = await fetch(`${apiBaseUrl}/api/completions`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load completions");
                return;
            }

            setCompletions(data);
        } catch (err) {
            console.error("Load completions error:", err);
            setError("Something went wrong while loading completions");
        } finally {
            setLoadingCompletions(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        loadCompletions();
    }, []);

    const filteredCompletions = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();

        return completions.filter((completion) => {
            const matchesSearch =
                !q ||
                completion.employee_name.toLowerCase().includes(q) ||
                completion.employee_email.toLowerCase().includes(q) ||
                completion.training_item_title.toLowerCase().includes(q);

            const matchesType =
                typeFilter === "all" || completion.training_item_type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [completions, searchTerm, typeFilter]);

    const uniqueEmployeeCount = useMemo(() => {
        return new Set(completions.map((c) => c.user_id)).size;
    }, [completions]);

    const uniqueTrainingItemCount = useMemo(() => {
        return new Set(completions.map((c) => c.training_item_id)).size;
    }, [completions]);

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Training progress
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Track employee completion across training content.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Review who completed which training item, filter progress records,
                            and monitor how learning is moving across your team.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Completions</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-300">
                                {completions.length}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Employees Active</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {uniqueEmployeeCount}
                            </p>
                        </div>

                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Training Items Completed</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {uniqueTrainingItemCount}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-white">Completion Records</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Search by employee or training item and filter by content type.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search employee or training item"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                            />

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                            >
                                <option value="all">All Types</option>
                                <option value="text">Text</option>
                                <option value="link">Link</option>
                                <option value="document">Document</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                    </div>

                    {loadingCompletions ? (
                        <p className="text-slate-300">Loading completions...</p>
                    ) : filteredCompletions.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                            No completion records found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCompletions.map((completion) => (
                                <div
                                    key={completion.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-white">
                                            {completion.employee_name}
                                            <span className="font-normal text-slate-400">
                        {" "}
                                                ({completion.employee_email})
                      </span>
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300">
                                            {completion.training_item_title}
                                            <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">
                        {completion.training_item_type}
                      </span>
                                        </p>
                                    </div>

                                    <span className="text-sm text-slate-400">
                    {new Date(completion.completed_at).toLocaleString()}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default EmployerProgressPage;