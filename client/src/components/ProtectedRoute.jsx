import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated, isInitializing, user } = useSelector((s) => s.auth);
  const location = useLocation();

  // Wait for first fetchMe to complete before deciding
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (admin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
