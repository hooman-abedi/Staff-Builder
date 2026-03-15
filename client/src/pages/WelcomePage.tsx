import { Link } from "react-router-dom";

function WelcomePage() {
    return (
        <div style={{ padding: 24 }}>
            <h1>Staff Builder</h1>
            <p>
                A custom training portal for businesses and franchises to create folders,
                share videos, documents, and training resources with their employees.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Link to="/login">
                    <button>Login</button>
                </Link>

                <Link to="/register">
                    <button>Register Employer</button>
                </Link>
            </div>
        </div>
    );
}

export default WelcomePage;