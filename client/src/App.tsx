import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
    status: string;
    message: string;
};

function App() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string>("");

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

        loadHealth();
    }, []);

    return (
        <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
            <h1>Staff Builder</h1>

            <h2>Backend Health Check</h2>

            {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

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
        </div>
    );
}

export default App;