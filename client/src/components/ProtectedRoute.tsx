import { Navigate } from "react-router-dom";

type Role = "employer" | "employee" | "super_admin" | "support_admin";

type ProtectedRouteProps = {
    allowedRoles: Role[];
    children: React.ReactNode;
};

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;

    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;