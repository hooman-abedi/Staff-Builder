import { useEffect, useState } from "react";
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

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    function getToken() {
        return localStorage.getItem("token");
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
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
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
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
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
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
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
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
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
        if (isCompleted(trainingItemId)) {
            return;
        }

        try {
            setError("");

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
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                navigate("/login");
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
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Employee Dashboard</h1>
            <p>View your assigned training categories, folders, and items.</p>

            {error && <p style={{ color: "crimson" }}>{error}</p>}

            <h2>Assigned Categories</h2>

            {loadingCategories ? (
                <p>Loading categories...</p>
            ) : categories.length === 0 ? (
                <p>No categories assigned yet.</p>
            ) : (
                <ul>
                    {categories.map((category) => (
                        <li key={category.id} style={{ marginBottom: 12 }}>
                            <button
                                style={{ marginRight: 10 }}
                                onClick={() => loadMyFolders(category.id, category.name)}
                            >
                                Open
                            </button>
                            <strong>{category.name}</strong>
                            {category.description ? ` — ${category.description}` : ""}
                        </li>
                    ))}
                </ul>
            )}

            {selectedCategoryId && (
                <div style={{ marginTop: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Folders in {selectedCategoryName}</h2>
                        <button onClick={closeCategory}>Close Category</button>
                    </div>

                    {loadingFolders ? (
                        <p>Loading folders...</p>
                    ) : folders.length === 0 ? (
                        <p>No folders in this category yet.</p>
                    ) : (
                        <ul>
                            {folders.map((folder) => (
                                <li key={folder.id} style={{ marginBottom: 12 }}>
                                    <button
                                        style={{ marginRight: 10 }}
                                        onClick={() => loadMyTrainingItems(folder.id, folder.name)}
                                    >
                                        Open
                                    </button>
                                    <strong>{folder.name}</strong>
                                    {folder.description ? ` — ${folder.description}` : ""}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {selectedFolderId && (
                <div style={{ marginTop: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Training Items in {selectedFolderName}</h2>
                        <button onClick={closeFolder}>Close Folder</button>
                    </div>

                    {loadingItems ? (
                        <p>Loading training items...</p>
                    ) : trainingItems.length === 0 ? (
                        <p>No training items in this folder yet.</p>
                    ) : (
                        <ul>
                            {trainingItems.map((item) => (
                                <li key={item.id} style={{ marginBottom: 16 }}>
                                    <div>
                                        <strong>{item.type}</strong> — {item.title}
                                        {isCompleted(item.id) ? (
                                            <span style={{ marginLeft: 10, color: "green" }}>
                        Completed
                      </span>
                                        ) : null}
                                    </div>

                                    {item.body ? <p>{item.body}</p> : null}

                                    {item.url ? (
                                        <p>
                                            <a href={item.url} target="_blank" rel="noreferrer">
                                                Open Link
                                            </a>
                                        </p>
                                    ) : null}

                                    {item.file_path ? (
                                        <p>
                                            <a
                                                href={`${apiBaseUrl}${item.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Open File
                                            </a>
                                        </p>
                                    ) : null}

                                    {!isCompleted(item.id) && (
                                        <button onClick={() => markComplete(item.id)}>
                                            Mark Complete
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div style={{ marginTop: 32 }}>
                <h2>My Completed Items</h2>

                {completions.length === 0 ? (
                    <p>No completed items yet.</p>
                ) : (
                    <ul>
                        {completions.map((completion) => (
                            <li key={completion.id} style={{ marginBottom: 8 }}>
                                <strong>{completion.training_item_type}</strong> —{" "}
                                {completion.training_item_title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard;