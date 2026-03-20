import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRole: "employer" | "employee";
};

function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;