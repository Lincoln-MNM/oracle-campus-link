import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Route guard — wraps any route that requires authentication + role check.
 * Redirects to the appropriate login page if unauthorized.
 */
const ProtectedRoute = ({ children, allowedRoles, redirectTo }: Props) => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  if (!user) {
    const fallback = redirectTo || (allowedRoles.includes("student") ? "/login/student" : "/login/admin");
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (!hasPermission(allowedRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold font-display">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to view this page. Required role: <strong>{allowedRoles.join(" or ")}</strong>
          </p>
          <a href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Go to Home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
