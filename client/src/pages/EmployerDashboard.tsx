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

    const [inviteFullName, setInviteFullName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteSuccessMessage, setInviteSuccessMessage] = useState("");
    const [latestInviteLink, setLatestInviteLink] = useState("");

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

    async function inviteEmployee(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setInviteSuccessMessage("");
        setLatestInviteLink("");

        const trimmedFullName = inviteFullName.trim();
        const trimmedEmail = inviteEmail.trim().toLowerCase();

        if (!trimmedFullName) {
            setError("Employee full name is required");
            return;
        }

        if (!trimmedEmail) {
            setError("Employee email is required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid employee email");
            return;
        }

        try {
            setInviteLoading(true);

            const res = await fetch(`${apiBaseUrl}/api/employees/invite`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({
                    full_name: trimmedFullName,
                    email: trimmedEmail,
                }),
            });

            const data = await handleJsonResponse(res);
            if (!data) return;

            if (!res.ok) {
                setError(data.message || "Failed to invite employee");
                return;
            }

            setInviteSuccessMessage("Employee invited successfully.");
            setLatestInviteLink(`${window.location.origin}/set-password/${data.invite_token}`);
            setInviteFullName("");
            setInviteEmail("");

            await loadEmployees();
        } catch (err) {
            console.error("Invite employee error:", err);
            setError("Something went wrong while inviting employee");
        } finally {
            setInviteLoading(false);
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
        <div className="min-h-[calc(100vh-160px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Employer workspace
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Manage people, training, and progress in one place.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Create staff categories, add or invite employees, assign role-based training,
                            build folders, upload learning content, and track who completed what.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Employees</p>
                            <p className="mt-2 text-3xl font-bold text-white">{employees.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{staffCategories.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Assignments</p>
                            <p className="mt-2 text-3xl font-bold text-white">{assignments.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm text-slate-400">Completions</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-300">{completions.length}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 xl:grid-cols-[1.05fr_1fr]">
                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Invite Employee</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Send a secure setup link to a new employee.
                                </p>
                            </div>

                            <form onSubmit={inviteEmployee} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={inviteFullName}
                                        onChange={(e) => setInviteFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="employee@company.com"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {inviteLoading ? "Sending Invite..." : "Send Invitation"}
                                </button>
                            </form>

                            {inviteSuccessMessage && (
                                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                    {inviteSuccessMessage}
                                </div>
                            )}

                            {latestInviteLink && (
                                <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                                    <p className="mb-2 text-sm text-slate-200">Invite link for testing</p>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <a
                                            href={latestInviteLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="break-all text-sm text-sky-300"
                                        >
                                            {latestInviteLink}
                                        </a>

                                        <button
                                            onClick={() => navigator.clipboard.writeText(latestInviteLink)}
                                            className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-white transition hover:border-slate-500 hover:bg-slate-800"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Create Employee Manually</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Create an employee directly with a password.
                                </p>
                            </div>

                            <form onSubmit={createEmployee} className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Full Name
                                    </label>
                                    <input
                                        value={employeeFullName}
                                        onChange={(e) => setEmployeeFullName(e.target.value)}
                                        placeholder="Hooman Abedi"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={employeeEmail}
                                        onChange={(e) => setEmployeeEmail(e.target.value)}
                                        placeholder="employee@test.com"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Temporary Password
                                    </label>
                                    <input
                                        type="password"
                                        value={employeePassword}
                                        onChange={(e) => setEmployeePassword(e.target.value)}
                                        placeholder="123456"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                                    >
                                        Create Employee
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Employees</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    View and manage employees in this business.
                                </p>
                            </div>

                            {loadingEmployees ? (
                                <p className="text-slate-300">Loading employees...</p>
                            ) : employees.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No employees yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {employees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold text-white">{employee.full_name}</p>
                                                <p className="mt-1 text-sm text-slate-400">{employee.email}</p>
                                            </div>

                                            <button
                                                onClick={() => deleteEmployee(employee.id)}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Assignments</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Assign one or more staff categories to each employee.
                                </p>
                            </div>

                            <form onSubmit={createAssignment} className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Employee
                                    </label>
                                    <select
                                        value={assignmentUserId}
                                        onChange={(e) => setAssignmentUserId(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                    >
                                        <option value="">Select employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.full_name} ({employee.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Staff Category
                                    </label>
                                    <select
                                        value={assignmentStaffCategoryId}
                                        onChange={(e) => setAssignmentStaffCategoryId(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                    >
                                        <option value="">Select category</option>
                                        {staffCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                                    >
                                        Assign Category
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 space-y-3">
                                {loadingAssignments ? (
                                    <p className="text-slate-300">Loading assignments...</p>
                                ) : assignments.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                        No assignments yet.
                                    </div>
                                ) : (
                                    assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {assignment.employee_name}
                                                    <span className="font-normal text-slate-400">
                            {" "}
                                                        ({assignment.employee_email})
                          </span>
                                                </p>
                                                <p className="mt-1 text-sm text-slate-300">
                                                    Assigned to:{" "}
                                                    <span className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-300">
                            {assignment.staff_category_name}
                          </span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => deleteAssignment(assignment.id)}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Staff Categories</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Build role-based training structures like Manager or Instructor.
                                </p>
                            </div>

                            <form onSubmit={createStaffCategory} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Category Name
                                    </label>
                                    <input
                                        value={staffCategoryName}
                                        onChange={(e) => setStaffCategoryName(e.target.value)}
                                        placeholder="e.g. Manager"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">
                                        Description
                                    </label>
                                    <input
                                        value={staffCategoryDescription}
                                        onChange={(e) => setStaffCategoryDescription(e.target.value)}
                                        placeholder="Training for managers"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Create Staff Category
                                </button>
                            </form>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {loadingCategories ? (
                                    <p className="text-slate-300">Loading staff categories...</p>
                                ) : staffCategories.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                        No staff categories yet.
                                    </div>
                                ) : (
                                    staffCategories.map((category) => {
                                        const isOpen = selectedStaffCategoryId === category.id;

                                        return (
                                            <div
                                                key={category.id}
                                                className={`rounded-3xl border p-5 transition ${
                                                    isOpen
                                                        ? "border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                                                        : "border-slate-800 bg-slate-950/80"
                                                }`}
                                            >
                                                <div className="mb-3 text-3xl">🧩</div>
                                                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                                    {category.description || "Role-based category"}
                                                </p>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => loadFolders(category.id, category.name)}
                                                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                                    >
                                                        {isOpen ? "Opened" : "Open"}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteStaffCategory(category.id)}
                                                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {selectedStaffCategoryId && (
                            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-slate-400">
                                            Open Category
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-white">
                                            Folders in {selectedStaffCategoryName}
                                        </h2>
                                    </div>

                                    <button
                                        onClick={closeStaffCategory}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                                    >
                                        Close Category
                                    </button>
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
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
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
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
                                    >
                                        Create Folder
                                    </button>
                                </form>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    {loadingFolders ? (
                                        <p className="text-slate-300">Loading folders...</p>
                                    ) : folders.length === 0 ? (
                                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                            No folders in this category yet.
                                        </div>
                                    ) : (
                                        folders.map((folder) => (
                                            <div
                                                key={folder.id}
                                                className={`rounded-3xl border p-5 transition ${
                                                    selectedFolderId === folder.id
                                                        ? "border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                                                        : "border-slate-800 bg-slate-950/80"
                                                }`}
                                            >
                                                {editingFolderId === folder.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editFolderName}
                                                            onChange={(e) => setEditFolderName(e.target.value)}
                                                            placeholder="Folder name"
                                                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                        />
                                                        <input
                                                            value={editFolderDescription}
                                                            onChange={(e) => setEditFolderDescription(e.target.value)}
                                                            placeholder="Description"
                                                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => saveEditFolder(folder.id)}
                                                                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEditFolder}
                                                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="mb-3 text-4xl">📁</div>
                                                        <h3 className="text-xl font-semibold text-white">{folder.name}</h3>
                                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                                            {folder.description || "Training folder"}
                                                        </p>

                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => loadTrainingItems(folder.id, folder.name)}
                                                                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                                            >
                                                                {selectedFolderId === folder.id ? "Opened" : "Open"}
                                                            </button>

                                                            <button
                                                                onClick={() => startEditFolder(folder)}
                                                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() => deleteFolder(folder.id)}
                                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}

                        {selectedFolderId && (
                            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-slate-400">
                                            Open Folder
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-white">
                                            Training in {selectedFolderName}
                                        </h2>
                                    </div>

                                    <button
                                        onClick={closeFolder}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                                    >
                                        Close Folder
                                    </button>
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

                                <div className="mt-6 space-y-4">
                                    {loadingTrainingItems ? (
                                        <p className="text-slate-300">Loading training items...</p>
                                    ) : trainingItems.length === 0 ? (
                                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                            No training items in this folder yet.
                                        </div>
                                    ) : (
                                        trainingItems.map((item) => (
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
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white">Training Completions</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Track which employees completed which training items.
                        </p>
                    </div>

                    {loadingCompletions ? (
                        <p className="text-slate-300">Loading completions...</p>
                    ) : completions.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                            No completions yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completions.map((completion) => (
                                <div
                                    key={completion.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
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

export default EmployerDashboard;