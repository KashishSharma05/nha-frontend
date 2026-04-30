// ProtectedRoute — Guards post-auth pages

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f5f7fb",
                flexDirection: "column",
                gap: "16px",
            }}>
                <div style={{
                    width: "44px",
                    height: "44px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    Verifying session...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
