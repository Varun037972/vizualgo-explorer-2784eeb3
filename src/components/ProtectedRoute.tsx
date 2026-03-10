import { Navigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import PageLoader from "./PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireAuth = true }: ProtectedRouteProps) => {
  const { role, loading, userId } = useUserRole();

  if (loading) return <PageLoader />;

  if (requireAuth && !userId) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate home based on role
    return <Navigate to={role === "faculty" ? "/faculty" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
