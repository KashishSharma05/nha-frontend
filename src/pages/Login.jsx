import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]  = useState(false);
    const [touched,  setTouched]  = useState({});
    const [loading,  setLoading]  = useState(false);
    const [apiError, setApiError] = useState("");

    const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

    const errors = useMemo(() => ({
        username: !username ? "Username is required" : "",
        password: !password ? "Password is required" : "",
    }), [username, password]);

    const isFormValid = !errors.username && !errors.password;

    const fieldClass = (field) => {
        if (!touched[field]) return "";
        return errors[field] ? "is-error" : "is-success";
    };

    const handleLogin = async () => {
        setTouched({ username: true, password: true });
        if (!isFormValid) return;

        setLoading(true);
        setApiError("");

        try {
            await login({ username, password });
            await refreshUser();
            navigate("/dashboard");
        } catch (err) {
            setApiError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT PANEL */}
            <div className="left-panel">
                <h1>Claim VerifiAI</h1>
                <p>AI Powered Healthcare Claim Validation Platform</p>

                <div className="feature-box">
                    <h3>OCR + AI Extraction</h3>
                    <p>Automatically extract claim documents and patient data</p>
                </div>
                <div className="feature-box">
                    <h3>STG Rule Validation</h3>
                    <p>Validate treatment against healthcare compliance rules</p>
                </div>
                <div className="feature-box">
                    <h3>Timeline Intelligence</h3>
                    <p>Build complete treatment journey automatically</p>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
                <div className="login-box">

                    <h2>Welcome Back</h2>
                    <p>Login to continue claim validation and reporting</p>

                    {/* Username */}
                    <div className="field-group">
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            autoComplete="username"
                            autoFocus
                            className={fieldClass("username")}
                            onChange={(e) => { setUsername(e.target.value.trim()); setApiError(""); }}
                            onBlur={() => touch("username")}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        {touched.username && errors.username && (
                            <p className="field-error">⚠ {errors.username}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="field-group">
                        <input
                            type={showPwd ? "text" : "password"}
                            placeholder="Enter Password"
                            value={password}
                            autoComplete="current-password"
                            className={fieldClass("password")}
                            onChange={(e) => { setPassword(e.target.value); setApiError(""); }}
                            onBlur={() => touch("password")}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <button
                            type="button"
                            className="pwd-toggle"
                            tabIndex={-1}
                            onClick={() => setShowPwd((v) => !v)}
                            aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                        {touched.password && errors.password && (
                            <p className="field-error">⚠ {errors.password}</p>
                        )}
                    </div>

                    <Link to="/forgot-password" className="forgot-link">
                        Forgot Password?
                    </Link>

                    {apiError && <p className="auth-error">{apiError}</p>}

                    <button onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="toggle-auth">
                        New user?{" "}
                        <Link to="/register">Create Account</Link>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Login;