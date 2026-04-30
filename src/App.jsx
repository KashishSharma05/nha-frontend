import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login         from "./pages/Login";
import Register      from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard     from "./pages/Dashboard";
import Upload        from "./pages/Upload";
import ClaimDetails  from "./pages/ClaimDetails";
import Timeline      from "./pages/Timeline";
import Compliance    from "./pages/Compliance";
import Decision      from "./pages/Decision";
import Reports       from "./pages/Reports";
import Profile       from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

// Redirect already-authenticated users away from auth pages
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
}

function App() {
    return (
        <Routes>
            {/* ── PUBLIC (Auth) Routes ─────────────────────────── */}
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                }
            />

            {/* ── PROTECTED (App) Routes ───────────────────────── */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* ── Claim Flow ───────────────────────────────────── */}
            <Route
                path="/upload"
                element={
                    <ProtectedRoute>
                        <Upload />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/claim-details"
                element={
                    <ProtectedRoute>
                        <ClaimDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/timeline"
                element={
                    <ProtectedRoute>
                        <Timeline />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/compliance"
                element={
                    <ProtectedRoute>
                        <Compliance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/decision"
                element={
                    <ProtectedRoute>
                        <Decision />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* ── Catch-all ────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;