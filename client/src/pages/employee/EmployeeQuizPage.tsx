import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Quiz = {
    id: number;
    title: string;
    passing_score: number;
};

type Choice = {
    id: number;
    question_id: number;
    choice_text: string;
};

type Question = {
    id: number;
    question_text: string;
    question_type: "multiple_choice" | "blank";
    question_order: number;
    choices: Choice[];
};

type Answer = {
    question_id: number;
    selected_choice_id?: number;
    selected_choice_ids?: number[];
    answer_text?: string;
};

type QuizAttempt = {
    id: number;
    business_id: number;
    quiz_id: number;
    user_id: number;
    attempt_number: number;
    score: number;
    passed: boolean;
    started_at: string;
    completed_at: string | null;
};

type QuizResult = {
    attempt: QuizAttempt;
    summary: {
        total_questions: number;
        correct_answers: number;
        score: number;
        passed: boolean;
        passing_score: number;
    };
};

function EmployeeQuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [result, setResult] = useState<QuizResult | null>(null);
    const [error, setError] = useState("");

    function authHeaders() {
        return {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
    }

    async function loadQuiz() {
        if (!id) {
            setError("Missing quiz id");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/employee/quizzes/${id}`, {
                headers: authHeaders(),
            });

            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Failed to load quiz");
                return;
            }

            setQuiz(data.quiz as Quiz);
            setQuestions(data.questions as Question[]);

            const initialAnswers: Answer[] = (data.questions as Question[]).map((q) => ({
                question_id: q.id,
                selected_choice_id: undefined,
                selected_choice_ids: [],
                answer_text: "",
            }));

            setAnswers(initialAnswers);
        } catch (err) {
            console.error("Load quiz error:", err);
            setError("Failed to load quiz");
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

        loadQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function toggleChoice(questionId: number, choiceId: number) {
        setAnswers((prev: Answer[]) =>
            prev.map((answer: Answer) => {
                if (answer.question_id !== questionId) return answer;

                const current = answer.selected_choice_ids || [];
                const exists = current.includes(choiceId);

                const next = exists
                    ? current.filter((id) => id !== choiceId)
                    : [...current, choiceId];

                return {
                    ...answer,
                    selected_choice_ids: next,
                    selected_choice_id: next.length === 1 ? next[0] : undefined,
                    answer_text: "",
                };
            })
        );
    }

    function updateBlankAnswer(questionId: number, value: string) {
        setAnswers((prev: Answer[]) =>
            prev.map((answer: Answer) =>
                answer.question_id === questionId
                    ? {
                        ...answer,
                        answer_text: value,
                        selected_choice_id: undefined,
                        selected_choice_ids: [],
                    }
                    : answer
            )
        );
    }
    async function submitQuiz() {
        if (!id) {
            setError("Missing quiz id");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/employee/quizzes/${id}/submit`, {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answers }),
            });

            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
                return;
            }

            if (!res.ok) {
                setError(data.message || "Submission failed");
                return;
            }

            setResult(data as QuizResult);
        } catch (err) {
            console.error("Submit quiz error:", err);
            setError("Submission failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
                <div className="mx-auto max-w-3xl">
                    <p className="text-slate-300">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
                <div className="mx-auto max-w-3xl">
                    <p className="text-red-400">Quiz not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-4 text-3xl font-bold">{quiz.title}</h1>

                <p className="mb-6 text-slate-400">Passing score: {quiz.passing_score}%</p>

                {error && (
                    <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {result ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-xl font-semibold">Result</h2>

                        <p className="mb-2">Score: {result.summary.score}%</p>

                        <p className="mb-2">
                            Status:{" "}
                            {result.summary.passed ? (
                                <span className="text-emerald-400">Passed</span>
                            ) : (
                                <span className="text-red-400">Failed</span>
                            )}
                        </p>

                        <p className="mb-2">Correct: {result.summary.correct_answers}</p>
                        <p className="mb-4">Total: {result.summary.total_questions}</p>

                        <button
                            type="button"
                            onClick={() => navigate("/employee")}
                            className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {questions.map((question: Question, index: number) => (
                                <div
                                    key={question.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                                >
                                    <p className="mb-3 font-semibold">
                                        {index + 1}. {question.question_text}
                                    </p>

                                    {question.question_type === "multiple_choice" ? (
                                        <div className="space-y-2">
                                            {question.choices.map((choice: Choice) => (
                                                <label key={choice.id} className="block text-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            answers
                                                                .find((answer: Answer) => answer.question_id === question.id)
                                                                ?.selected_choice_ids?.includes(choice.id) || false
                                                        }
                                                        onChange={() => toggleChoice(question.id, choice.id)}
                                                        className="mr-2"
                                                    />
                                                    {choice.choice_text}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={
                                                answers.find(
                                                    (answer: Answer) => answer.question_id === question.id
                                                )?.answer_text || ""
                                            }
                                            onChange={(e) => updateBlankAnswer(question.id, e.target.value)}
                                            className="mt-2 w-full rounded-xl bg-slate-800 px-3 py-2 text-white outline-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={submitQuiz}
                            disabled={submitting}
                            className="mt-8 w-full rounded-2xl bg-violet-500 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default EmployeeQuizPage;