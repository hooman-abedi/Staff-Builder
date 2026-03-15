import {Link, useNavigate} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    function logOut() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/");
    }

    return (
        <nav
            style={{
                display: "flex",
                gap: 12,
                padding: 12,
                borderBottom: "1px solid black",
                alignItems: "center",
            }}
            >
            <Link to={"/"}>Home</Link>
            {!token && (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register (Employer)</Link>
                </>
            )}
            {token && role === "employer" && <Link to="/employer">Employer Dashboard</Link>}
            {token && role === "employee" && <Link to="/employee">Employee Dashboard</Link>}

            <div style={{ marginLeft: "auto" }}>
                {token ? (
                    <button onClick={logOut}>Logout</button>
                ) : (
                    <span style={{ opacity: 0.7 }}>Not logged in</span>
                )}
            </div>
        </nav>
    )
}
export default Navbar;