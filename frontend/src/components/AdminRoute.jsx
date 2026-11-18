import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading, openAuthModal } = useAuth();

  if (loading) {
    return <div className="section-container py-24 text-center text-bottle-800/60">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Admin access requires login</h1>
        <button onClick={openAuthModal} className="btn-primary mt-6">Log in</button>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
