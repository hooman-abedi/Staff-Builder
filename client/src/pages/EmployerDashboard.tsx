import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
    created_at: string;
};

type EmployeeUser = {
    id: number;
    business_id: number;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
};

type Assignment = {
    id: number;
    business_id: number;
    user_id: number;
    staff_category_id: number;
    created_at: string;
    employee_name: string;
    employee_email: string;
    staff_category_name: string;
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
    employee_name: string;
    employee_email: string;
    training_item_title: string;
    training_item_type: string;
};

function EmployerDashboard() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");

    const [staffCategories, setStaffCategories] = useState<StaffCategory[]>([]);
    const [employees, setEmployees] = useState<EmployeeUser[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
    const [completions, setCompletions] = useState<Completion[]>([]);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [loadingTrainingItems, setLoadingTrainingItems] = useState(false);
    const [loadingCompletions, setLoadingCompletions] = useState(true);

    const [selectedStaffCategoryId, setSelectedStaffCategoryId] = useState<number | null>(null);
    const [selectedStaffCategoryName, setSelectedStaffCategoryName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedFolderName, setSelectedFolderName] = useState("");

    const [staffCategoryName, setStaffCategoryName] = useState("");
    const [staffCategoryDescription, setStaffCategoryDescription] = useState("");

    const [employeeFullName, setEmployeeFullName] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [employeePassword, setEmployeePassword] = useState("");

    const [assignmentUserId, setAssignmentUserId] = useState("");
    const [assignmentStaffCategoryId, setAssignmentStaffCategoryId] = useState("");

    const [folderName, setFolderName] = useState("");
    const [folderDescription, setFolderDescription] = useState("");

    const [itemType, setItemType] = useState("text");
    const [itemTitle, setItemTitle] = useState("");
    const [itemUrl, setItemUrl] = useState("");
    const [itemBody, setItemBody] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editFolderName, setEditFolderName] = useState("");
    const [editFolderDescription, setEditFolderDescription] = useState("");

    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editItemTitle, setEditItemTitle] = useState("");
    const [editItemUrl, setEditItemUrl] = useState("");
    const [editItemBody, setEditItemBody] = useState("");
    const [editItemType, setEditItemType] = useState("");

    const [replacingItemId, setReplacingItemId] = useState<number | null>(null);
    const [replacementTitle, setReplacementTitle] = useState("");
    const [replacementFile, setReplacementFile] = useState<File | null>(null);

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
        if (res.status === 401 || res.status === 403) {
            clearAuthAndRedirect();
            return null;
        }
        return res.json();
    }

    function closeStaffCategory() {
        setSelectedStaffCategoryId(null);
        setSelectedStaffCategoryName("");
        setFolders([]);
        closeFolder();
    }

    function closeFolder() {
        setSelectedFolderId(null);
        setSelectedFolderName("");
        setTrainingItems([]);
        setEditingItemId(null);
        setReplacingItemId(null);
    }

    async function loadStaffCategories() {
        try {
            setLoadingCategories(true);

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

    async function loadEmployees() {
        try {
            setLoadingEmployees(true);

            const res = await fetch(`${apiBaseUrl}/api/employees`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load employees");
                return;
            }

            setEmployees(data);
        } catch (err) {
            console.error("Load employees error:", err);
            setError("Something went wrong while loading employees");
        } finally {
            setLoadingEmployees(false);
        }
    }

    async function loadAssignments() {
        try {
            setLoadingAssignments(true);

            const res = await fetch(`${apiBaseUrl}/api/assignments`, {
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load assignments");
                return;
            }

            setAssignments(data);
        } catch (err) {
            console.error("Load assignments error:", err);
            setError("Something went wrong while loading assignments");
        } finally {
            setLoadingAssignments(false);
        }
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

    async function loadFolders(staffCategoryId: number, staffCategoryNameValue: string) {
        try {
            setError("");
            setLoadingFolders(true);
            setSelectedStaffCategoryId(staffCategoryId);
            setSelectedStaffCategoryName(staffCategoryNameValue);
            setSelectedFolderId(null);
            setSelectedFolderName("");
            setTrainingItems([]);

            const res = await fetch(
                `${apiBaseUrl}/api/folders?staff_category_id=${staffCategoryId}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load folders");
                return;
            }

            setFolders(data);
        } catch (err) {
            console.error("Load folders error:", err);
            setError("Something went wrong while loading folders");
        } finally {
            setLoadingFolders(false);
        }
    }

    async function loadTrainingItems(folderId: number, folderNameValue: string) {
        try {
            setError("");
            setLoadingTrainingItems(true);
            setSelectedFolderId(folderId);
            setSelectedFolderName(folderNameValue);

            const res = await fetch(
                `${apiBaseUrl}/api/training-items?folder_id=${folderId}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to load training items");
                return;
            }

            setTrainingItems(data);
        } catch (err) {
            console.error("Load training items error:", err);
            setError("Something went wrong while loading training items");
        } finally {
            setLoadingTrainingItems(false);
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
        loadEmployees();
        loadAssignments();
        loadCompletions();
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
            setAssignments((prev) => prev.filter((a) => a.staff_category_id !== id));

            if (selectedStaffCategoryId === id) {
                closeStaffCategory();
            }
        } catch (err) {
            console.error("Delete staff category error:", err);
            setError("Something went wrong while deleting staff category");
        }
    }

    async function createEmployee(e: React.FormEvent) {
        e.preventDefault();

        if (!employeeFullName.trim() || !employeeEmail.trim() || !employeePassword.trim()) {
            setError("Full name, email, and password are required");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/employees`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    full_name: employeeFullName.trim(),
                    email: employeeEmail.trim(),
                    password: employeePassword,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to create employee");
                return;
            }

            setEmployees((prev) => [data, ...prev]);
            setEmployeeFullName("");
            setEmployeeEmail("");
            setEmployeePassword("");
        } catch (err) {
            console.error("Create employee error:", err);
            setError("Something went wrong while creating employee");
        }
    }

    async function deleteEmployee(id: number) {
        const confirmed = window.confirm("Delete this employee?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/employees/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete employee");
                return;
            }

            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
            setAssignments((prev) => prev.filter((a) => a.user_id !== id));
        } catch (err) {
            console.error("Delete employee error:", err);
            setError("Something went wrong while deleting employee");
        }
    }

    async function createAssignment(e: React.FormEvent) {
        e.preventDefault();

        if (!assignmentUserId || !assignmentStaffCategoryId) {
            setError("Select an employee and a staff category");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/assignments`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    user_id: Number(assignmentUserId),
                    staff_category_id: Number(assignmentStaffCategoryId),
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to assign category");
                return;
            }

            setAssignmentUserId("");
            setAssignmentStaffCategoryId("");
            await loadAssignments();
        } catch (err) {
            console.error("Create assignment error:", err);
            setError("Something went wrong while assigning category");
        }
    }

    async function deleteAssignment(id: number) {
        const confirmed = window.confirm("Remove this assignment?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/assignments/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete assignment");
                return;
            }

            setAssignments((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error("Delete assignment error:", err);
            setError("Something went wrong while deleting assignment");
        }
    }

    async function createFolder(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedStaffCategoryId) {
            setError("Select a staff category first");
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
                    staff_category_id: selectedStaffCategoryId,
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

            setFolders((prev) => [data, ...prev]);
            setFolderName("");
            setFolderDescription("");
        } catch (err) {
            console.error("Create folder error:", err);
            setError("Something went wrong while creating folder");
        }
    }

    function startEditFolder(folder: Folder) {
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
        setEditFolderDescription(folder.description ?? "");
    }

    function cancelEditFolder() {
        setEditingFolderId(null);
        setEditFolderName("");
        setEditFolderDescription("");
    }

    async function saveEditFolder(folderId: number) {
        if (!editFolderName.trim()) {
            setError("Folder name is required");
            return;
        }

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/folders/${folderId}`, {
                method: "PUT",
                headers: authHeaders(true),
                body: JSON.stringify({
                    name: editFolderName.trim(),
                    description: editFolderDescription.trim() || null,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to update folder");
                return;
            }

            setFolders((prev) => prev.map((folder) => (folder.id === folderId ? data : folder)));

            if (selectedFolderId === folderId) {
                setSelectedFolderName(data.name);
            }

            cancelEditFolder();
        } catch (err) {
            console.error("Update folder error:", err);
            setError("Something went wrong while updating folder");
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

            if (selectedFolderId === folderId) {
                closeFolder();
            }
        } catch (err) {
            console.error("Delete folder error:", err);
            setError("Something went wrong while deleting folder");
        }
    }

    async function createTrainingItem(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedFolderId) {
            setError("Select a folder first");
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
                formData.append("folder_id", String(selectedFolderId));
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
                        folder_id: selectedFolderId,
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

            setTrainingItems((prev) => [data, ...prev]);
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
        if (!selectedFolderId) {
            setError("No folder selected");
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
                    folder_id: selectedFolderId,
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

            setTrainingItems((prev) => prev.map((t) => (t.id === item.id ? data : t)));
            cancelEditTrainingItem();
        } catch (err) {
            console.error("Update training item error:", err);
            setError("Something went wrong while updating training item");
        }
    }

    async function deleteTrainingItem(id: number) {
        const confirmed = window.confirm("Delete this training item?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${apiBaseUrl}/api/training-items/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to delete training item");
                return;
            }

            setTrainingItems((prev) => prev.filter((item) => item.id !== id));

            if (editingItemId === id) cancelEditTrainingItem();
            if (replacingItemId === id) cancelReplaceFile();
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

            setTrainingItems((prev) => prev.map((t) => (t.id === item.id ? data : t)));
            cancelReplaceFile();
        } catch (err) {
            console.error("Replace file error:", err);
            setError("Something went wrong while replacing file");
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Employer Dashboard</h1>
            <p>Manage staff categories, employees, assignments, folders, training items, and completions.</p>

            {error && <p style={{ color: "crimson" }}>{error}</p>}

            <div style={{ marginTop: 24 }}>
                <h2>Staff Categories</h2>

                <form onSubmit={createStaffCategory} style={{ marginBottom: 20 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Category name
                            <br />
                            <input
                                value={staffCategoryName}
                                onChange={(e) => setStaffCategoryName(e.target.value)}
                                placeholder="e.g. Manager"
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Description
                            <br />
                            <input
                                value={staffCategoryDescription}
                                onChange={(e) => setStaffCategoryDescription(e.target.value)}
                                placeholder="Training for managers"
                            />
                        </label>
                    </div>

                    <button type="submit">Create Staff Category</button>
                </form>

                {loadingCategories ? (
                    <p>Loading staff categories...</p>
                ) : staffCategories.length === 0 ? (
                    <p>No staff categories yet.</p>
                ) : (
                    <ul>
                        {staffCategories.map((category) => (
                            <li key={category.id} style={{ marginBottom: 12 }}>
                                <button
                                    style={{ marginRight: 10 }}
                                    onClick={() => loadFolders(category.id, category.name)}
                                >
                                    Open
                                </button>

                                <strong>{category.name}</strong>
                                {category.description ? ` — ${category.description}` : ""}

                                <button
                                    style={{ marginLeft: 12 }}
                                    onClick={() => deleteStaffCategory(category.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginTop: 32 }}>
                <h2>Employees</h2>

                <form onSubmit={createEmployee} style={{ marginBottom: 20 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Full name
                            <br />
                            <input
                                value={employeeFullName}
                                onChange={(e) => setEmployeeFullName(e.target.value)}
                                placeholder="Hooman"
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Email
                            <br />
                            <input
                                type="email"
                                value={employeeEmail}
                                onChange={(e) => setEmployeeEmail(e.target.value)}
                                placeholder="hooman@test.com"
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Temporary password
                            <br />
                            <input
                                type="password"
                                value={employeePassword}
                                onChange={(e) => setEmployeePassword(e.target.value)}
                                placeholder="123456"
                            />
                        </label>
                    </div>

                    <button type="submit">Create Employee</button>
                </form>

                {loadingEmployees ? (
                    <p>Loading employees...</p>
                ) : employees.length === 0 ? (
                    <p>No employees yet.</p>
                ) : (
                    <ul>
                        {employees.map((employee) => (
                            <li key={employee.id} style={{ marginBottom: 10 }}>
                                <strong>{employee.full_name}</strong> ({employee.email})
                                <button
                                    style={{ marginLeft: 12 }}
                                    onClick={() => deleteEmployee(employee.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginTop: 32 }}>
                <h2>Assignments</h2>

                <form onSubmit={createAssignment} style={{ marginBottom: 20 }}>
                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Employee
                            <br />
                            <select
                                value={assignmentUserId}
                                onChange={(e) => setAssignmentUserId(e.target.value)}
                            >
                                <option value="">Select employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.full_name} ({employee.email})
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <label>
                            Staff category
                            <br />
                            <select
                                value={assignmentStaffCategoryId}
                                onChange={(e) => setAssignmentStaffCategoryId(e.target.value)}
                            >
                                <option value="">Select category</option>
                                {staffCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <button type="submit">Assign Category</button>
                </form>

                {loadingAssignments ? (
                    <p>Loading assignments...</p>
                ) : assignments.length === 0 ? (
                    <p>No assignments yet.</p>
                ) : (
                    <ul>
                        {assignments.map((assignment) => (
                            <li key={assignment.id} style={{ marginBottom: 10 }}>
                                <strong>{assignment.employee_name}</strong> ({assignment.employee_email}) —{" "}
                                {assignment.staff_category_name}
                                <button
                                    style={{ marginLeft: 12 }}
                                    onClick={() => deleteAssignment(assignment.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedStaffCategoryId && (
                <div style={{ marginTop: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <h2 style={{ margin: 0 }}>Folders in {selectedStaffCategoryName}</h2>
                        <button onClick={closeStaffCategory}>Close Category</button>
                    </div>

                    <form onSubmit={createFolder} style={{ marginBottom: 20 }}>
                        <div style={{ marginBottom: 10 }}>
                            <label>
                                Folder name
                                <br />
                                <input
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    placeholder="Leadership"
                                />
                            </label>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>
                                Description
                                <br />
                                <input
                                    value={folderDescription}
                                    onChange={(e) => setFolderDescription(e.target.value)}
                                    placeholder="Leadership training files"
                                />
                            </label>
                        </div>

                        <button type="submit">Create Folder</button>
                    </form>

                    {loadingFolders ? (
                        <p>Loading folders...</p>
                    ) : folders.length === 0 ? (
                        <p>No folders in this category yet.</p>
                    ) : (
                        <ul>
                            {folders.map((folder) => (
                                <li key={folder.id} style={{ marginBottom: 14 }}>
                                    {editingFolderId === folder.id ? (
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <input
                                                    value={editFolderName}
                                                    onChange={(e) => setEditFolderName(e.target.value)}
                                                    placeholder="Folder name"
                                                />
                                            </div>

                                            <div style={{ marginBottom: 8 }}>
                                                <input
                                                    value={editFolderDescription}
                                                    onChange={(e) => setEditFolderDescription(e.target.value)}
                                                    placeholder="Description"
                                                />
                                            </div>

                                            <button onClick={() => saveEditFolder(folder.id)}>Save</button>
                                            <button style={{ marginLeft: 8 }} onClick={cancelEditFolder}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                style={{ marginRight: 10 }}
                                                onClick={() => loadTrainingItems(folder.id, folder.name)}
                                            >
                                                Open
                                            </button>

                                            <strong>{folder.name}</strong>
                                            {folder.description ? ` — ${folder.description}` : ""}

                                            <button
                                                style={{ marginLeft: 12 }}
                                                onClick={() => startEditFolder(folder)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                style={{ marginLeft: 8 }}
                                                onClick={() => deleteFolder(folder.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {selectedFolderId && (
                <div style={{ marginTop: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <h2 style={{ margin: 0 }}>Training Items in {selectedFolderName}</h2>
                        <button onClick={closeFolder}>Close Folder</button>
                    </div>

                    <form onSubmit={createTrainingItem} style={{ marginBottom: 24 }}>
                        <div style={{ marginBottom: 10 }}>
                            <label>
                                Type
                                <br />
                                <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                                    <option value="text">Text</option>
                                    <option value="link">Link</option>
                                    <option value="document">Document</option>
                                    <option value="video">Video</option>
                                </select>
                            </label>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>
                                Title
                                <br />
                                <input
                                    value={itemTitle}
                                    onChange={(e) => setItemTitle(e.target.value)}
                                    placeholder="Opening Checklist"
                                />
                            </label>
                        </div>

                        {itemType === "link" && (
                            <div style={{ marginBottom: 10 }}>
                                <label>
                                    URL
                                    <br />
                                    <input
                                        value={itemUrl}
                                        onChange={(e) => setItemUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </label>
                            </div>
                        )}

                        {itemType === "text" && (
                            <div style={{ marginBottom: 10 }}>
                                <label>
                                    Body
                                    <br />
                                    <textarea
                                        rows={4}
                                        style={{ width: 320 }}
                                        value={itemBody}
                                        onChange={(e) => setItemBody(e.target.value)}
                                        placeholder="Write the training text here..."
                                    />
                                </label>
                            </div>
                        )}

                        {(itemType === "document" || itemType === "video") && (
                            <div style={{ marginBottom: 10 }}>
                                <label>
                                    Upload file
                                    <br />
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        )}

                        <button type="submit">Add Training Item</button>
                    </form>

                    {loadingTrainingItems ? (
                        <p>Loading training items...</p>
                    ) : trainingItems.length === 0 ? (
                        <p>No training items in this folder yet.</p>
                    ) : (
                        <ul>
                            {trainingItems.map((item) => (
                                <li key={item.id} style={{ marginBottom: 14 }}>
                                    {replacingItemId === item.id ? (
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <input
                                                    value={replacementTitle}
                                                    onChange={(e) => setReplacementTitle(e.target.value)}
                                                    placeholder="Title"
                                                />
                                            </div>

                                            <div style={{ marginBottom: 8 }}>
                                                <input
                                                    type="file"
                                                    onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                                                />
                                            </div>

                                            <button onClick={() => saveReplaceFile(item)}>Save File</button>
                                            <button style={{ marginLeft: 8 }} onClick={cancelReplaceFile}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : editingItemId === item.id ? (
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <input
                                                    value={editItemTitle}
                                                    onChange={(e) => setEditItemTitle(e.target.value)}
                                                    placeholder="Title"
                                                />
                                            </div>

                                            {editItemType === "link" && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <input
                                                        value={editItemUrl}
                                                        onChange={(e) => setEditItemUrl(e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            )}

                                            {editItemType === "text" && (
                                                <div style={{ marginBottom: 8 }}>
                          <textarea
                              rows={4}
                              style={{ width: 320 }}
                              value={editItemBody}
                              onChange={(e) => setEditItemBody(e.target.value)}
                          />
                                                </div>
                                            )}

                                            <button onClick={() => saveEditTrainingItem(item)}>Save</button>
                                            <button style={{ marginLeft: 8 }} onClick={cancelEditTrainingItem}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <strong>{item.type}</strong> — {item.title}
                                            {item.body ? ` — ${item.body}` : ""}
                                            {item.url ? (
                                                <>
                                                    {" "}
                                                    —{" "}
                                                    <a href={item.url} target="_blank" rel="noreferrer">
                                                        Open Link
                                                    </a>
                                                </>
                                            ) : null}
                                            {item.file_path ? (
                                                <>
                                                    {" "}
                                                    —{" "}
                                                    <a
                                                        href={`${apiBaseUrl}${item.file_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Open File
                                                    </a>
                                                </>
                                            ) : null}

                                            {(item.type === "text" || item.type === "link") && (
                                                <button
                                                    style={{ marginLeft: 12 }}
                                                    onClick={() => startEditTrainingItem(item)}
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            {(item.type === "document" || item.type === "video") && (
                                                <button
                                                    style={{ marginLeft: 12 }}
                                                    onClick={() => startReplaceFile(item)}
                                                >
                                                    Replace File
                                                </button>
                                            )}

                                            <button
                                                style={{ marginLeft: 8 }}
                                                onClick={() => deleteTrainingItem(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div style={{ marginTop: 32 }}>
                <h2>Training Completions</h2>

                {loadingCompletions ? (
                    <p>Loading completions...</p>
                ) : completions.length === 0 ? (
                    <p>No completions yet.</p>
                ) : (
                    <ul>
                        {completions.map((completion) => (
                            <li key={completion.id} style={{ marginBottom: 10 }}>
                                <strong>{completion.employee_name}</strong> ({completion.employee_email}) —{" "}
                                <strong>{completion.training_item_type}</strong> — {completion.training_item_title} —{" "}
                                {new Date(completion.completed_at).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default EmployerDashboard;