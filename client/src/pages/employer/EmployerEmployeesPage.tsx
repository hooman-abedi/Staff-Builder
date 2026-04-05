import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BusinessSubscription } from "../../lib/getSubscriptionStatus";
import { getSubscriptionStatus } from "../../lib/getSubscriptionStatus";

type EmployeeUser = {
    id: number;
    business_id: number;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
};

type StaffCategory = {
    id: number;
    business_id: number;
    name: string;
    description: string | null;
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

function EmployerEmployeesPage() {
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

    const [error, setError] = useState("");

    const [employees, setEmployees] = useState<EmployeeUser[]>([]);
    const [staffCategories, setStaffCategories] = useState<StaffCategory[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const [inviteFullName, setInviteFullName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteSuccessMessage, setInviteSuccessMessage] = useState("");
    const [latestInviteLink, setLatestInviteLink] = useState("");

    const [employeeFullName, setEmployeeFullName] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [employeePassword, setEmployeePassword] = useState("");

    const [assignmentUserId, setAssignmentUserId] = useState("");
    const [assignmentStaffCategoryId, setAssignmentStaffCategoryId] = useState("");

    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [subscriptionError, setSubscriptionError] = useState("");

    const token = localStorage.getItem("token");
    const isExpired = subscription?.effective_status === "expired";

    function clearAuthAndRedirect() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
    }

    function authHeaders(isJson = false) {
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

    useEffect(() => {
        const role = localStorage.getItem("role");

        if (!token || role !== "employer") {
            navigate("/login");
            return;
        }

        loadEmployees();
        loadStaffCategories();
        loadAssignments();

        async function loadSubscription() {
            const result = await getSubscriptionStatus(apiBaseUrl, token);

            if (!result.ok) {
                if (result.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("email");
                    navigate("/login");
                    return;
                }

                setSubscriptionError(result.message);
                return;
            }

            setSubscription(result.data);
        }

        loadSubscription();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function inviteEmployee(e: React.FormEvent) {
        e.preventDefault();

        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to invite employees.");
            return;
        }

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

    async function createEmployee(e: React.FormEvent) {
        e.preventDefault();

        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to create employees.");
            return;
        }

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
        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to delete employees.");
            return;
        }

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

        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to assign categories.");
            return;
        }

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
        if (isExpired) {
            setError("Your subscription has expired. Renew your plan to remove assignments.");
            return;
        }

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

    return (
        <div className="min-h-[calc(100vh-140px)] bg-slate-950 px-6 py-14 text-white md:px-10">
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300">
                            Employee management
                        </p>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            Manage employees, invitations, and role assignments.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                            Invite staff members securely, create employee accounts manually if needed,
                            and assign training categories to the right people.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Employees</p>
                            <p className="mt-2 text-3xl font-bold text-white">{employees.length}</p>
                        </div>
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Categories</p>
                            <p className="mt-2 text-3xl font-bold text-white">{staffCategories.length}</p>
                        </div>
                        <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                            <p className="text-sm leading-5 text-slate-400">Assignments</p>
                            <p className="mt-2 text-3xl font-bold text-white">{assignments.length}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {subscriptionError && (
                    <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {subscriptionError}
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

                            {isExpired && (
                                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    Your subscription has expired. Employee creation, invitation, and account changes are disabled until you renew your plan.
                                </div>
                            )}

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
                                    disabled={isExpired || inviteLoading}
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-slate-300"
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
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(latestInviteLink)}
                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white transition hover:border-slate-500 hover:bg-slate-800"
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

                            {isExpired && (
                                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    Your subscription has expired. Employee creation, invitation, and account changes are disabled until you renew your plan.
                                </div>
                            )}

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
                                        disabled={isExpired}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-slate-300"
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
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white">{employee.full_name}</p>
                                                <p className="mt-1 break-all text-sm text-slate-400">{employee.email}</p>
                                            </div>

                                            <button
                                                onClick={() => deleteEmployee(employee.id)}
                                                disabled={isExpired}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Assign Categories</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Assign one or more training categories to each employee.
                                </p>
                            </div>

                            {isExpired && (
                                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    Your subscription has expired. Category assignment changes are disabled until you renew your plan.
                                </div>
                            )}

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
                                        disabled={isExpired}
                                        className="w-full rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        Assign Category
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white">Current Assignments</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Review and remove employee-category assignments.
                                </p>
                            </div>

                            {loadingAssignments ? (
                                <p className="text-slate-300">Loading assignments...</p>
                            ) : assignments.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No assignments yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
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
                                                disabled={isExpired}
                                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/5">
                            <div className="mb-4">
                                <h2 className="text-2xl font-semibold text-white">Available Staff Categories</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    These are the current categories available for assignment.
                                </p>
                            </div>

                            {loadingCategories ? (
                                <p className="text-slate-300">Loading staff categories...</p>
                            ) : staffCategories.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-slate-400">
                                    No staff categories yet.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {staffCategories.map((category) => (
                                        <span
                                            key={category.id}
                                            className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300"
                                        >
                                            {category.name}
                                        </span>
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

export default EmployerEmployeesPage;