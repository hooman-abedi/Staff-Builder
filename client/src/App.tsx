import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
    status: string;
    message: string;
};
type Category = {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
}

function App() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    useEffect(() => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

        async function loadHealth() {
            try {
                const res = await fetch(`${apiBaseUrl}/api/health`);

                if (!res.ok) {
                    throw new Error(`Request failed with status ${res.status}`);
                }

                const data: HealthResponse = await res.json();
                setHealth(data);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(message);
            }
        }
        async function loadCategories(){
            try{
                const res = await fetch(`${apiBaseUrl}/api/categories`);
                if (!res.ok)throw new Error(`Category request failed with status ${res.status}`);
                const data: Category[] = await res.json();
                setCategories(data);
            }
            catch (err){
                    const message = err instanceof Error ? err.message : "Failed to load categories";
                    setError(message);
            }
        }


        loadHealth();
        loadCategories();

    }, []);
    async function createCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
        const res = await fetch(`${apiBaseUrl}/api/categories`, {
            method: "POST",
            headers : { "content-type": "application/json" },
            body : JSON.stringify({
                name : newName.trim(),
                description : newDescription.trim() ? newDescription.trim() : null,
            }),
        });
        if (!res.ok){
            console.error("Failed to create category:", await res.text());
            return;
        }
        const created : Category = await res.json();

        setCategories((prev) => [created, ...prev ]);

        setNewName("");
        setNewDescription("");

    }
    async function deleteCategory(id: number) {
        const ok = window.confirm("Are you sure you want to delete this category?");
        if (!ok) {
            return
        }
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
        const res = await fetch(`${apiBaseUrl}/api/categories/${id}`, {method: "DELETE"});
        if (!res.ok){
            console.error("Failed to delete category:", await res.text());
        }
        setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    function startEdit(c: Category) {
        setEditingId(c.id);
        setEditName(c.name);
        setEditDescription(c.description ?? "");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName("");
        setEditDescription("");
    }

    async function saveEdit() {
        if (editingId === null) return;

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

        const res = await fetch(`${apiBaseUrl}/api/categories/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: editName.trim(),
                description: editDescription.trim() ? editDescription.trim() : null,
            }),
        });

        if (!res.ok) {
            console.error("Update failed:", await res.text());
            return;
        }

        const updated: Category = await res.json();

        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        cancelEdit();
    }


    return (
        <div style={{padding: 24, fontFamily: "system-ui, Arial"}}>
            <h1>Staff Builder</h1>

            <h2>Backend Health Check</h2>

            {error && <p style={{color: "crimson"}}>Error: {error}</p>}

            {!error && !health && <p>Loading…</p>}

            {health && (
                <div>
                    <p>
                        <b>Status:</b> {health.status}
                    </p>
                    <p>
                        <b>Message:</b> {health.message}
                    </p>
                </div>
            )}
            <h2>Categories</h2>

            {categories.length === 0 ? (
                <p>No categories yet.</p>
            ) : (
                <ul>
                    {categories.map((c) => (
                        <li key={c.id} style={{marginBottom: 8}}>
                            <b>{c.name}</b>
                            {c.description ? `- ${c.description}` : ""}
                            {editingId === c.id ? (
                                <>
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    <input
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Description"
                                    />
                                    <button onClick={saveEdit}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <b>{c.name}</b>
                                    {c.description ? ` — ${c.description}` : ""}

                                    <button style={{ marginLeft: 12 }} onClick={() => startEdit(c)}>
                                        Edit
                                    </button>

                                    <button style={{ marginLeft: 8 }} onClick={() => deleteCategory(c.id)}>
                                        Delete
                                    </button>
                                </>
                            )}
                        </li>


                    ))}
                </ul>
            )}
            <form onSubmit={createCategory} style={{marginBottom: 16}}>
                <div style={{marginBottom: 8}}>
                    <label>
                        Category name
                        <br/>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., Onboarding"
                        />
                    </label>
                </div>

                <div style={{marginBottom: 8}}>
                    <label>
                        Description (optional)
                        <br/>
                        <input
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Short description..."
                        />
                    </label>
                </div>

                <button type="submit">Create Category</button>
            </form>

        </div>

    );
}

export default App;