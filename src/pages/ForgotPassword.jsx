import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
    const [email,    setEmail]   = useState("");
    const [touched,  setTouched] = useState(false);
    const [loading,  setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [success,  setSuccess] = useState(false);

    const emailError = useMemo(() => {
        if (!email) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
        return "";
    }, [email]);

    const isValid = !emailError;

    const fieldClass = touched
        ? (emailError ? "is-error" : "is-success")
        : "";

    const handleReset = async () => {
        setTouched(true);
        if (!isValid) return;

        setLoading(true);
        setApiError("");

        try {
            await forgotPassword({ email });
            setSuccess(true);
        } catch (err) {
            setApiError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT PANEL */}
            <div className="left-panel">
                <h1>Password Recovery</h1>
                <p>Recover your account securely with email verification</p>

                <div className="feature-box">
                    <h3>🔒 Secure Reset</h3>
                    <p>Email-based secure password recovery</p>
                </div>
                <div className="feature-box">
                    <h3>⚡ Fast Recovery</h3>
                    <p>Reset your account in minutes</p>
                </div>
                <div className="feature-box">
                    <h3>🛡️ Protected Access</h3>
                    <p>Keep your healthcare claim data secure</p>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
                <div className="login-box">

                    <h2>Forgot Password</h2>
                    <p>Enter your registered email to receive reset instructions</p>

                    {success ? (
                        <div className="success-box">
                            <span className="success-icon">✅</span>
                            <h3>Reset Link Sent!</h3>
                            <p>
                                Check your inbox at <strong>{email}</strong>.
                                The link expires in 30 minutes.
                            </p>
                            <Link to="/" className="back-to-login-btn">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Email field */}
                            <div className="field-group">
                                <input
                                    type="email"
                                    placeholder="Enter Registered Email"
                                    value={email}
                                    autoComplete="email"
                                    autoFocus
                                    className={fieldClass}
                                    onChange={(e) => { setEmail(e.target.value.trim()); setApiError(""); }}
                                    onBlur={() => setTouched(true)}
                                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                                    disabled={loading}
                                />
                                {touched && emailError && (
                                    <p className="field-error">⚠ {emailError}</p>
                                )}
                            </div>

                            {apiError && <p className="auth-error">{apiError}</p>}

                            <button onClick={handleReset} disabled={loading}>
                                {loading ? "Sending Reset Link..." : "Send Reset Link"}
                            </button>

                            <p className="toggle-auth">
                                Back to <Link to="/">Login</Link>
                            </p>
                        </>
                    )}

                </div>
            </div>

        </div>
    );
}

export default ForgotPassword;