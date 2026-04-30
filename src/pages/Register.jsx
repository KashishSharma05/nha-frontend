import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { register } from "../services/authService";

// Compute password strength: 0-4
function getStrength(pwd) {
    let s = 0;
    if (pwd.length >= 8)             s++;
    if (/[A-Z]/.test(pwd))           s++;
    if (/[a-z]/.test(pwd))           s++;
    if (/[0-9]/.test(pwd))           s++;
    if (/[^a-zA-Z0-9]/.test(pwd))   s++;
    if (s <= 1) return { label: "Weak",   color: "#ef4444", width: "25%" };
    if (s === 2) return { label: "Fair",   color: "#f97316", width: "50%" };
    if (s === 3) return { label: "Good",   color: "#eab308", width: "75%" };
    return         { label: "Strong", color: "#22c55e", width: "100%" };
}

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]  = useState(false);
    const [touched,  setTouched]  = useState({});
    const [loading,  setLoading]  = useState(false);
    const [apiError, setApiError] = useState("");

    const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

    // Derived validation errors (computed, not stored)
    const errors = useMemo(() => ({
        username: !username
            ? "Username is required"
            : !/^[a-zA-Z0-9@.+\-_]+$/.test(username)
            ? "Only letters, numbers and @/./+/-/_ allowed"
            : username.length < 3
            ? "At least 3 characters required"
            : "",
        email: !email
            ? "Email is required"
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? "Enter a valid email address"
            : "",
        password: !password
            ? "Password is required"
            : password.length < 8
            ? "At least 8 characters required"
            : !/[A-Z]/.test(password)
            ? "Add at least one uppercase letter"
            : !/[a-z]/.test(password)
            ? "Add at least one lowercase letter"
            : !/[0-9]/.test(password)
            ? "Add at least one number"
            : "",
    }), [username, email, password]);

    const isFormValid = !errors.username && !errors.email && !errors.password;
    const strength = getStrength(password);

    const fieldClass = (field) => {
        if (!touched[field]) return "";
        return errors[field] ? "is-error" : "is-success";
    };

    const handleRegister = async () => {
        // Touch all fields to show all errors at once
        setTouched({ username: true, email: true, password: true });
        if (!isFormValid) return;

        setLoading(true);
        setApiError("");

        try {
            await register({ username, email, password });
            // Backend does not auto-login on register — send user to login page
            navigate("/");
        } catch (err) {
            setApiError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT PANEL */}
            <div className="left-panel">
                <h1>Create Account</h1>
                <p>Start validating healthcare claims with AI-powered automation</p>

                <div className="feature-box">
                    <h3>Fast Claim Review</h3>
                    <p>Upload and validate claims within minutes</p>
                </div>
                <div className="feature-box">
                    <h3>Fraud Detection</h3>
                    <p>Detect suspicious billing patterns automatically</p>
                </div>
                <div className="feature-box">
                    <h3>Compliance Check</h3>
                    <p>Auto STG guideline verification for treatments</p>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
                <div className="login-box">

                    <h2>Register</h2>
                    <p>Create your professional claim verification account</p>

                    {/* Username */}
                    <div className="field-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            autoComplete="username"
                            autoFocus
                            className={fieldClass("username")}
                            onChange={(e) => { setUsername(e.target.value.trim()); setApiError(""); }}
                            onBlur={() => touch("username")}
                            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                        />
                        {touched.username && errors.username && (
                            <p className="field-error">⚠ {errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="field-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            autoComplete="email"
                            className={fieldClass("email")}
                            onChange={(e) => { setEmail(e.target.value.trim()); setApiError(""); }}
                            onBlur={() => touch("email")}
                            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                        />
                        {touched.email && errors.email && (
                            <p className="field-error">⚠ {errors.email}</p>
                        )}
                    </div>

                    {/* Password + strength */}
                    <div className="field-group">
                        <input
                            type={showPwd ? "text" : "password"}
                            placeholder="Create Password (min 8 chars)"
                            value={password}
                            autoComplete="new-password"
                            className={fieldClass("password")}
                            onChange={(e) => { setPassword(e.target.value); setApiError(""); }}
                            onBlur={() => touch("password")}
                            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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

                        {/* Strength bar — shown as soon as user starts typing */}
                        {password.length > 0 && (
                            <div className="strength-wrapper">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{ width: strength.width, backgroundColor: strength.color }}
                                    />
                                </div>
                                <p className="strength-label" style={{ color: strength.color }}>
                                    {strength.label}
                                </p>
                            </div>
                        )}

                        {touched.password && errors.password && (
                            <p className="field-error">⚠ {errors.password}</p>
                        )}
                    </div>

                    {/* API-level error */}
                    {apiError && <p className="auth-error">{apiError}</p>}

                    <button onClick={handleRegister} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <p className="toggle-auth">
                        Already have an account?{" "}
                        <Link to="/">Login</Link>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Register;