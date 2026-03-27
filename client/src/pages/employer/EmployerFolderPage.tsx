import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

type Quiz = {
    id: number;
    business_id: number;
    folder_id: number;
    title: string;
    passing_score: number;
    is_active: boolean;
    created_at: string;
};

type QuizChoice = {
    id: number;
    question_id: number;
    choice_text: string;
    is_correct: boolean;
    created_at: string;
};

type QuizQuestion = {
    id: number;
    quiz_id: number;
    question_text: string;
    question_type: "multiple_choice" | "blank";
    question_order: number;
    created_at: string;
    choices: QuizChoice[];
};

type ChoiceInput = {
    text: string;
    is_correct: boolean;
};

function EmployerFolderPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");
    const [folder, setFolder] = useState<Folder | null>(null);
    const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);

    const [loadingFolder, setLoadingFolder] = useState(true);
    const [loadingItems, setLoadingItems] = useState(true);

    const [itemType, setItemType] = useState("text");
    const [itemTitle, setItemTitle] = useState("");
    const [itemUrl, setItemUrl] = useState("");
    const [itemBody, setItemBody] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editItemTitle, setEditItemTitle] = useState("");
    const [editItemUrl, setEditItemUrl] = useState("");
    const [editItemBody, setEditItemBody] = useState("");
    const [editItemType, setEditItemType] = useState("");

    const [replacingItemId, setReplacingItemId] = useState<number | null>(null);
    const [replacementTitle, setReplacementTitle] = useState("");
    const [replacementFile, setReplacementFile] = useState<File | null>(null);

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);

    const [quizTitle, setQuizTitle] = useState("");
    const [quizPassingScore, setQuizPassingScore] = useState("70");

    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);

    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState<"multiple_choice" | "blank">(
        "multiple_choice"
    );
    const [questionOrder, setQuestionOrder] = useState("1");

    const [choiceInputs, setChoiceInputs] = useState<ChoiceInput[]>([
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
    ]);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [editQuestionText, setEditQuestionText] = useState("");
    const [editQuestionType, setEditQuestionType] = useState<"multiple_choice" | "blank">("multiple_choice");
    const [editQuestionOrder, setEditQuestionOrder] = useState("1");

    const [editingChoices, setEditingChoices] = useState<
        Record<number, { id?: number; text: string; is_correct: boolean }[]>
    >({});

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

    async function loadFolder() {
        if (!id) {
            setError("Missing folder id");
            return;
        }

        try {
            setLoadingFolder(true);
            setLoadingItems(true);
            setError("");

            const res = await fetch(
                `${apiBaseUrl}/api/training-items?folder_id=${id}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load folder items");
                return;
            }

            const items = data as TrainingItem[];
            setTrainingItems(items);

            if (items.length > 0) {
                const firstItem = items[0];
                setFolder({
                    id: firstItem.folder_id,
                    business_id: firstItem.business_id,
                    staff_category_id: 0,
                    name: `Folder ${firstItem.folder_id}`,
                    description: null,
                    created_at: "",
                });
            } else {
                setFolder({
                    id: Number(id),
                    business_id: 0,
                    staff_category_id: 0,
                    name: `Folder ${id}`,
                    description: null,
                    created_at: "",
                });
            }
        } catch (err) {
            console.error("Load folder error:", err);
            setError("Something went wrong while loading the folder");
        } finally {
            setLoadingFolder(false);
            setLoadingItems(false);
        }
    }

    async function loadQuizzes() {
        if (!id) return;

        try {
            setLoadingQuizzes(true);

            const res = await fetch(`${apiBaseUrl}/api/quizzes?folder_id=${id}`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load quizzes");
                return;
            }

            setQuizzes(data as Quiz[]);
        } catch (err) {
            console.error("Load quizzes error:", err);
            setError("Something went wrong while loading quizzes");
        } finally {
            setLoadingQuizzes(false);
        }
    }

    async function createQuiz(e: React.FormEvent) {
        e.preventDefault();

        if (!id) {
            setError("Missing folder id");
            return;
        }

        if (!quizTitle.trim()) {
            setError("Quiz title is required");
            return;
        }

        const passingScoreValue = Number(quizPassingScore);

        if (
            !Number.isInteger(passingScoreValue) ||
            passingScoreValue < 0 ||
            passingScoreValue > 100
        ) {
            setError("Passing score must be between 0 and 100");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/quizzes`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    folder_id: Number(id),
                    title: quizTitle.trim(),
                    passing_score: passingScoreValue,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create quiz");
                return;
            }

            setQuizzes((prev: Quiz[]) => [data as Quiz, ...prev]);
            setQuizTitle("");
            setQuizPassingScore("70");
        } catch (err) {
            console.error("Create quiz error:", err);
            setError("Something went wrong while creating quiz");
        }
    }

    async function loadQuizDetails(quizId: number) {
        try {
            setLoadingQuizDetails(true);
            setSelectedQuizId(quizId);

            const res = await fetch(`${apiBaseUrl}/api/quizzes/${quizId}`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load quiz details");
                return;
            }

            setSelectedQuiz(data.quiz as Quiz);
            setQuizQuestions(data.questions as QuizQuestion[]);
            setQuestionOrder(String((data.questions as QuizQuestion[]).length + 1));
        } catch (err) {
            console.error("Load quiz details error:", err);
            setError("Something went wrong while loading quiz details");
        } finally {
            setLoadingQuizDetails(false);
        }
    }

    async function createQuestion(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedQuizId) {
            setError("Select a quiz first");
            return;
        }

        if (!questionText.trim()) {
            setError("Question text is required");
            return;
        }

        const questionOrderValue = Number(questionOrder);

        if (!Number.isInteger(questionOrderValue)) {
            setError("Question order must be a number");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/quizzes/${selectedQuizId}/questions`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    question_text: questionText.trim(),
                    question_type: questionType,
                    question_order: questionOrderValue,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create question");
                return;
            }

            const createdQuestion = data as QuizQuestion;

            if (questionType === "multiple_choice" || questionType === "blank") {
                const validChoices = choiceInputs.filter((choice) => choice.text.trim());

                if (questionType === "multiple_choice" && validChoices.length < 4) {
                    setError("Multiple choice questions need at least 4 choices");
                    return;
                }

                if (questionType === "blank" && validChoices.length < 1) {
                    setError("Blank questions need at least one accepted answer");
                    return;
                }

                const hasCorrect = validChoices.some((choice) => choice.is_correct);
                if (!hasCorrect) {
                    setError(
                        questionType === "multiple_choice"
                            ? "Select at least one correct choice"
                            : "Select at least one accepted answer"
                    );
                    return;
                }

                for (const choice of validChoices) {
                    const choiceRes = await fetch(
                        `${apiBaseUrl}/api/quiz-questions/${createdQuestion.id}/choices`,
                        {
                            method: "POST",
                            headers: authHeaders(true),
                            body: JSON.stringify({
                                choice_text: choice.text.trim(),
                                is_correct: choice.is_correct,
                            }),
                        }
                    );

                    const choiceData = await handleJsonResponse(choiceRes);
                    if (!choiceData) return;

                    if (!choiceRes.ok) {
                        setError(choiceData.message || "Failed to create choice");
                        return;
                    }
                }
            }

            setQuestionText("");
            setQuestionType("multiple_choice");
            setQuestionOrder(String(quizQuestions.length + 2));
            setChoiceInputs([
                { text: "", is_correct: false },
                { text: "", is_correct: false },
                { text: "", is_correct: false },
                { text: "", is_correct: false },
            ]);

            await loadQuizDetails(selectedQuizId);
        } catch (err) {
            console.error("Create question error:", err);
            setError("Something went wrong while creating question");
        }
    }

    function updateChoice(index: number, field: "text" | "is_correct", value: string | boolean) {
        setChoiceInputs((prev: ChoiceInput[]) =>
            prev.map((choice: ChoiceInput, i: number) =>
                i === index ? { ...choice, [field]: value } : choice
            )
        );
    }

    function addChoiceInput() {
        setChoiceInputs((prev: ChoiceInput[]) => [
            ...prev,
            { text: "", is_correct: false },
        ]);
    }
    function startEditQuestion(question: QuizQuestion) {
        setEditingQuestionId(question.id);
        setEditQuestionText(question.question_text);
        setEditQuestionType(question.question_type);
        setEditQuestionOrder(String(question.question_order));
        setEditingChoices({
            [question.id]: question.choices.map((choice) => ({
                id: choice.id,
                text: choice.choice_text,
                is_correct: choice.is_correct,
            })),
        });
    }

    function cancelEditQuestion() {
        setEditingQuestionId(null);
        setEditQuestionText("");
        setEditQuestionType("multiple_choice");
        setEditQuestionOrder("1");
        setEditingChoices({});
    }

    function updateEditingChoice(
        questionId: number,
        index: number,
        field: "text" | "is_correct",
        value: string | boolean
    ) {
        setEditingChoices((prev) => ({
            ...prev,
            [questionId]: (prev[questionId] || []).map((choice, i) =>
                i === index ? { ...choice, [field]: value } : choice
            ),
        }));
    }

    function addEditingChoice(questionId: number) {
        setEditingChoices((prev) => ({
            ...prev,
            [questionId]: [...(prev[questionId] || []), { text: "", is_correct: false }],
        }));
    }

    async function saveQuestionEdit(questionId: number) {
        if (!selectedQuizId) return;

        if (!editQuestionText.trim()) {
            setError("Question text is required");
            return;
        }

        const orderValue = Number(editQuestionOrder);
        if (!Number.isInteger(orderValue)) {
            setError("Question order must be a number");
            return;
        }

        const currentChoices = editingChoices[questionId] || [];

        if (editQuestionType === "multiple_choice") {
            const validChoices = currentChoices.filter((choice) => choice.text.trim());
            if (validChoices.length < 4) {
                setError("Multiple choice questions need at least 4 choices");
                return;
            }
            if (!validChoices.some((choice) => choice.is_correct)) {
                setError("Select at least one correct choice");
                return;
            }
        }

        if (editQuestionType === "blank") {
            const validChoices = currentChoices.filter((choice) => choice.text.trim());
            if (validChoices.length < 1) {
                setError("Blank questions need at least one accepted answer");
                return;
            }
            if (!validChoices.some((choice) => choice.is_correct)) {
                setError("Select at least one accepted answer");
                return;
            }
        }

        try {
            setError("");

            const questionRes = await fetch(`${apiBaseUrl}/api/quiz-questions/${questionId}`, {
                method: "PUT",
                headers: authHeaders(true),
                body: JSON.stringify({
                    question_text: editQuestionText.trim(),
                    question_type: editQuestionType,
                    question_order: orderValue,
                }),
            });

            const questionData = await handleJsonResponse(questionRes);
            if (!questionData) return;

            if (!questionRes.ok) {
                setError(questionData.message || "Failed to update question");
                return;
            }

            const originalQuestion = quizQuestions.find((q) => q.id === questionId);
            const originalChoices = originalQuestion?.choices || [];

            for (const existingChoice of originalChoices) {
                if (!currentChoices.some((c) => c.id === existingChoice.id)) {
                    const deleteRes = await fetch(`${apiBaseUrl}/api/quiz-choices/${existingChoice.id}`, {
                        method: "DELETE",
                        headers: authHeaders(),
                    });

                    const deleteData = await handleJsonResponse(deleteRes);
                    if (!deleteData) return;

                    if (!deleteRes.ok) {
                        setError(deleteData.message || "Failed to delete removed choice");
                        return;
                    }
                }
            }

            for (const choice of currentChoices) {
                if (!choice.text.trim()) continue;

                if (choice.id) {
                    const updateRes = await fetch(`${apiBaseUrl}/api/quiz-choices/${choice.id}`, {
                        method: "PUT",
                        headers: authHeaders(true),
                        body: JSON.stringify({
                            choice_text: choice.text.trim(),
                            is_correct: choice.is_correct,
                        }),
                    });

                    const updateData = await handleJsonResponse(updateRes);
                    if (!updateData) return;

                    if (!updateRes.ok) {
                        setError(updateData.message || "Failed to update choice");
                        return;
                    }
                } else {
                    const createRes = await fetch(`${apiBaseUrl}/api/quiz-questions/${questionId}/choices`, {
                        method: "POST",
                        headers: authHeaders(true),
                        body: JSON.stringify({
                            choice_text: choice.text.trim(),
                            is_correct: choice.is_correct,
                        }),
                    });

                    const createData = await handleJsonResponse(createRes);
                    if (!createData) return;

                    if (!createRes.ok) {
                        setError(createData.message || "Failed to create choice");
                        return;
                    }
                }
            }

            await loadQuizDetails(selectedQuizId);
            cancelEditQuestion();
        } catch (err) {
            console.error("Save question edit error:", err);
            setError("Something went wrong while saving question changes");
        }
    }

    async function deleteQuestion(questionId: number) {
        if (!selectedQuizId) return;

        const confirmed = window.confirm("Delete this question?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/quiz-questions/${questionId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete question");
                return;
            }

            await loadQuizDetails(selectedQuizId);
        } catch (err) {
            console.error("Delete question error:", err);
            setError("Something went wrong while deleting question");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        if (!id || Number.isNaN(Number(id))) {
            setError("Invalid folder id");
            return;
        }

        loadFolder();
        loadQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function createTrainingItem(e: React.FormEvent) {
        e.preventDefault();

        if (!id) {
            setError("Missing folder id");
            return;
        }

        if (!itemTitle.trim()) {
            setError("Training item title is required");
            return;
        }

        try {
            setError("");
            let res: Response;

            if (itemType === "document" || itemType === "video") {
                if (!selectedFile) {
                    setError("Please choose a file");
                    return;
                }

                const formData = new FormData();
                formData.append("folder_id", String(id));
                formData.append("type", itemType);
                formData.append("title", itemTitle.trim());
                formData.append("body", itemBody.trim() || "");
                formData.append("file", selectedFile);

                res = await fetch(`${apiBaseUrl}/api/training-items/upload`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                });
            } else {
                res = await fetch(`${apiBaseUrl}/api/training-items`, {
                    method: "POST",
                    headers: authHeaders(true),
                    body: JSON.stringify({
                        folder_id: Number(id),
                        type: itemType,
                        title: itemTitle.trim(),
                        url: itemType === "link" ? itemUrl.trim() || null : null,
                        body: itemType === "text" ? itemBody.trim() || null : null,
                    }),
                });
            }

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create training item");
                return;
            }

            setTrainingItems((prev: TrainingItem[]) => [data as TrainingItem, ...prev]);
            setItemType("text");
            setItemTitle("");
            setItemUrl("");
            setItemBody("");
            setSelectedFile(null);
        } catch (err) {
            console.error("Create training item error:", err);
            setError("Something went wrong while creating training item");
        }
    }

    function startEditTrainingItem(item: TrainingItem) {
        setEditingItemId(item.id);
        setEditItemType(item.type);
        setEditItemTitle(item.title);
        setEditItemUrl(item.url ?? "");
        setEditItemBody(item.body ?? "");
    }

    function cancelEditTrainingItem() {
        setEditingItemId(null);
        setEditItemType("");
        setEditItemTitle("");
        setEditItemUrl("");
        setEditItemBody("");
    }

    async function saveEditTrainingItem(item: TrainingItem) {
        if (!id) {
            setError("Missing folder id");
            return;
        }

        if (!editItemTitle.trim()) {
            setError("Training item title is required");
            return;
        }

        if (item.type === "document" || item.type === "video") {
            setError("Use Replace File for documents or videos");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/training-items/${item.id}`, {
                method: "PUT",
                headers: authHeaders(true),
                body: JSON.stringify({
                    folder_id: Number(id),
                    type: item.type,
                    title: editItemTitle.trim(),
                    url: item.type === "link" ? editItemUrl.trim() || null : null,
                    file_path: item.file_path,
                    body: item.type === "text" ? editItemBody.trim() || null : item.body,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to update training item");
                return;
            }

            setTrainingItems((prev: TrainingItem[]) =>
                prev.map((t: TrainingItem) => (t.id === item.id ? (data as TrainingItem) : t))
            );
            cancelEditTrainingItem();
        } catch (err) {
            console.error("Update training item error:", err);
            setError("Something went wrong while updating training item");
        }
    }

    async function deleteTrainingItem(itemId: number) {
        const confirmed = window.confirm("Delete this training item?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/training-items/${itemId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete training item");
                return;
            }

            setTrainingItems((prev: TrainingItem[]) =>
                prev.filter((item: TrainingItem) => item.id !== itemId)
            );

            if (editingItemId === itemId) cancelEditTrainingItem();
            if (replacingItemId === itemId) cancelReplaceFile();
        } catch (err) {
            console.error("Delete training item error:", err);
            setError("Something went wrong while deleting training item");
        }
    }

    function startReplaceFile(item: TrainingItem) {
        setReplacingItemId(item.id);
        setReplacementTitle(item.title);
        setReplacementFile(null);
    }

    function cancelReplaceFile() {
        setReplacingItemId(null);
        setReplacementTitle("");
        setReplacementFile(null);
    }

    async function saveReplaceFile(item: TrainingItem) {
        if (!replacementFile) {
            setError("Please choose a replacement file");
            return;
        }

        if (!replacementTitle.trim()) {
            setError("Title is required");
            return;
        }

        try {
            setError("");

            const formData = new FormData();
            formData.append("title", replacementTitle.trim());
            formData.append("file", replacementFile);

            const res = await fetch(`${apiBaseUrl}/api/training-items/${item.id}/upload`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to replace file");
                return;
            }

            setTrainingItems((prev: TrainingItem[]) =>
                prev.map((t: TrainingItem) => (t.id === item.id ? (data as TrainingItem) : t))
            );
            cancelReplaceFile();
        } catch (err) {
            console.error("Replace file error:", err);
            setError("Something went wrong while replacing file");
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
              {loadingFolder ? "Loading..." : folder?.name || "Folder"}
            </span>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-300">
                                Folder workspace
                            </p>

                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                                {loadingFolder ? "Loading folder..." : folder?.name || "Folder"}
                            </h1>

                            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                                Manage this folder like a workspace: add files, text, links, videos,
                                and quizzes here.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                                <p className="text-sm text-slate-400">Training Items</p>
                                <p className="mt-2 text-3xl font-bold text-white">{trainingItems.length}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                                <p className="text-sm text-slate-400">Quizzes</p>
                                <p className="mt-2 text-3xl font-bold text-violet-300">{quizzes.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[0.95fr_1.1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-amber-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Add Training Item</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Add text, links, documents, or videos inside this folder.
                            </p>
                        </div>

                        <form onSubmit={createTrainingItem} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Type
                                </label>
                                <select
                                    value={itemType}
                                    onChange={(e) => setItemType(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                >
                                    <option value="text">Text</option>
                                    <option value="link">Link</option>
                                    <option value="document">Document</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Title
                                </label>
                                <input
                                    value={itemTitle}
                                    onChange={(e) => setItemTitle(e.target.value)}
                                    placeholder="Opening Checklist"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                />
                            </div>

                            {itemType === "link" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        URL
                                    </label>
                                    <input
                                        value={itemUrl}
                                        onChange={(e) => setItemUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>
                            )}

                            {itemType === "text" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Body
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={itemBody}
                                        onChange={(e) => setItemBody(e.target.value)}
                                        placeholder="Write the training text here..."
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>
                            )}

                            {(itemType === "document" || itemType === "video") && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Upload File
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-white hover:file:bg-slate-700"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                                Add Training Item
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-amber-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Folder Contents</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Open, edit, replace, or remove content from this folder.
                            </p>
                        </div>

                        {loadingItems ? (
                            <p className="text-slate-300">Loading training items...</p>
                        ) : trainingItems.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                No training items in this folder yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trainingItems.map((item: TrainingItem) => (
                                    <div
                                        key={item.id}
                                        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                                    >
                                        {replacingItemId === item.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    value={replacementTitle}
                                                    onChange={(e) => setReplacementTitle(e.target.value)}
                                                    placeholder="Title"
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                />

                                                <input
                                                    type="file"
                                                    onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                                                    className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-white hover:file:bg-slate-700"
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveReplaceFile(item)}
                                                        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                                                    >
                                                        Save File
                                                    </button>

                                                    <button
                                                        onClick={cancelReplaceFile}
                                                        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : editingItemId === item.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    value={editItemTitle}
                                                    onChange={(e) => setEditItemTitle(e.target.value)}
                                                    placeholder="Title"
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                />

                                                {editItemType === "link" && (
                                                    <input
                                                        value={editItemUrl}
                                                        onChange={(e) => setEditItemUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                    />
                                                )}

                                                {editItemType === "text" && (
                                                    <textarea
                                                        rows={4}
                                                        value={editItemBody}
                                                        onChange={(e) => setEditItemBody(e.target.value)}
                                                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                    />
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveEditTrainingItem(item)}
                                                        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={cancelEditTrainingItem}
                                                        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
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

                                                    {(item.type === "text" || item.type === "link") && (
                                                        <button
                                                            onClick={() => startEditTrainingItem(item)}
                                                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {(item.type === "document" || item.type === "video") && (
                                                        <button
                                                            onClick={() => startReplaceFile(item)}
                                                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                        >
                                                            Replace File
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => deleteTrainingItem(item.id)}
                                                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.1fr]">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-violet-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Quiz Builder</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Create a quiz for this folder and define the passing score.
                            </p>
                        </div>

                        <form onSubmit={createQuiz} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Quiz Title
                                </label>
                                <input
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    placeholder="Manager Opening Quiz"
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-200">
                                    Passing Score
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={quizPassingScore}
                                    onChange={(e) => setQuizPassingScore(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                            >
                                Create Quiz
                            </button>
                        </form>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-white">Folder Quizzes</h3>

                            {loadingQuizzes ? (
                                <p className="mt-3 text-slate-300">Loading quizzes...</p>
                            ) : quizzes.length === 0 ? (
                                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-400">
                                    No quizzes for this folder yet.
                                </div>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {quizzes.map((quiz: Quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="font-semibold text-white">{quiz.title}</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Passing score: {quiz.passing_score}%
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => loadQuizDetails(quiz.id)}
                                                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                                                >
                                                    Open Quiz Builder
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-violet-500/5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-white">Quiz Questions</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Add multiple choice or blank questions to the selected quiz.
                            </p>
                        </div>

                        {!selectedQuizId ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                Select a quiz first to add questions.
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm text-slate-400">Selected Quiz</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {selectedQuiz?.title || "Quiz"}
                                    </p>
                                </div>

                                <form onSubmit={createQuestion} className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-200">
                                            Question Text
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={questionText}
                                            onChange={(e) => setQuestionText(e.target.value)}
                                            placeholder="Enter the question..."
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                                Question Type
                                            </label>
                                            <select
                                                value={questionType}
                                                onChange={(e) =>
                                                    setQuestionType(
                                                        e.target.value as "multiple_choice" | "blank"
                                                    )
                                                }
                                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                            >
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="blank">Blank</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                                Question Order
                                            </label>
                                            <input
                                                type="number"
                                                value={questionOrder}
                                                onChange={(e) => setQuestionOrder(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                            />
                                        </div>
                                    </div>

                                    {(questionType === "multiple_choice" || questionType === "blank") && (
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <label className="block text-sm font-medium text-slate-200">
                                                    {questionType === "multiple_choice" ? "Choices" : "Accepted Answers"}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={addChoiceInput}
                                                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                >
                                                    Add Choice
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {choiceInputs.map((choice: ChoiceInput, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-[1fr_auto]"
                                                    >
                                                        <input
                                                            value={choice.text}
                                                            onChange={(e) =>
                                                                updateChoice(index, "text", e.target.value)
                                                            }
                                                            placeholder={
                                                                questionType === "multiple_choice"
                                                                    ? `Choice ${index + 1}`
                                                                    : `Accepted answer ${index + 1}`
                                                            }                                                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                                                        />

                                                        <label className="flex items-center gap-2 text-sm text-slate-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={choice.is_correct}
                                                                onChange={(e) =>
                                                                    updateChoice(index, "is_correct", e.target.checked)
                                                                }
                                                            />
                                                            {questionType === "multiple_choice" ? "Correct" : "Accepted"}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                                    >
                                        Add Question
                                    </button>
                                </form>

                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-white">Current Questions</h3>

                                    {loadingQuizDetails ? (
                                        <p className="mt-3 text-slate-300">Loading quiz details...</p>
                                    ) : quizQuestions.length === 0 ? (
                                        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-400">
                                            No questions added yet.
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            {quizQuestions.map((question: QuizQuestion) => (
                                                <div
                                                    key={question.id}
                                                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                                                >
                                                    {editingQuestionId === question.id ? (
                                                        <div className="space-y-4">
        <textarea
            rows={3}
            value={editQuestionText}
            onChange={(e) => setEditQuestionText(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
        />

                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <select
                                                                    value={editQuestionType}
                                                                    onChange={(e) =>
                                                                        setEditQuestionType(e.target.value as "multiple_choice" | "blank")
                                                                    }
                                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                                                >
                                                                    <option value="multiple_choice">Multiple Choice</option>
                                                                    <option value="blank">Blank</option>
                                                                </select>

                                                                <input
                                                                    type="number"
                                                                    value={editQuestionOrder}
                                                                    onChange={(e) => setEditQuestionOrder(e.target.value)}
                                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                                                />
                                                            </div>

                                                            <div>
                                                                <div className="mb-3 flex items-center justify-between">
                                                                    <label className="block text-sm font-medium text-slate-200">
                                                                        {editQuestionType === "multiple_choice" ? "Choices" : "Accepted Answers"}
                                                                    </label>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addEditingChoice(question.id)}
                                                                        className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                                    >
                                                                        Add Choice
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {(editingChoices[question.id] || []).map((choice, index) => (
                                                                        <div
                                                                            key={choice.id ?? `new-${index}`}
                                                                            className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-[1fr_auto]"
                                                                        >
                                                                            <input
                                                                                value={choice.text}
                                                                                onChange={(e) =>
                                                                                    updateEditingChoice(question.id, index, "text", e.target.value)
                                                                                }
                                                                                placeholder={
                                                                                    editQuestionType === "multiple_choice"
                                                                                        ? `Choice ${index + 1}`
                                                                                        : `Accepted answer ${index + 1}`
                                                                                }
                                                                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
                                                                            />

                                                                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={choice.is_correct}
                                                                                    onChange={(e) =>
                                                                                        updateEditingChoice(question.id, index, "is_correct", e.target.checked)
                                                                                    }
                                                                                />
                                                                                {editQuestionType === "multiple_choice" ? "Correct" : "Accepted"}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => saveQuestionEdit(question.id)}
                                                                    className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
                                                                >
                                                                    Save Changes
                                                                </button>

                                                                <button
                                                                    onClick={cancelEditQuestion}
                                                                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-semibold text-white">
                                                                    {question.question_order}. {question.question_text}
                                                                </p>
                                                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
            {question.question_type}
          </span>
                                                            </div>

                                                            {question.choices.length > 0 && (
                                                                <div className="mt-3 space-y-2">
                                                                    {question.choices.map((choice: QuizChoice) => (
                                                                        <div
                                                                            key={choice.id}
                                                                            className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
                                                                        >
                                                                            {choice.choice_text}
                                                                            {choice.is_correct && (
                                                                                <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">
                    {question.question_type === "multiple_choice" ? "Correct" : "Accepted"}
                  </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => startEditQuestion(question)}
                                                                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                                                                >
                                                                    Edit Question
                                                                </button>

                                                                <button
                                                                    onClick={() => deleteQuestion(question.id)}
                                                                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                                                >
                                                                    Delete Question
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default EmployerFolderPage;