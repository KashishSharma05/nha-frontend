import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
    const [email, setEmail]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const [success, setSuccess]   = useState(false);

    const handleReset = async () => {
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await forgotPassword({ email });
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT SIDE */}
            <div className="left-panel">

                <h1>Password Recovery</h1>
                <p>
                    Recover your account securely with
                    email verification
                </p>

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

            {/* RIGHT SIDE */}
            <div className="right-panel">

                <div className="login-box">

                    <h2>Forgot Password</h2>
                    <p>
                        Enter your registered email to receive
                        reset instructions
                    </p>

                    {success ? (
                        <div className="success-box">
                            <div className="success-icon">✅</div>
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
                            <input
                                type="email"
                                placeholder="Enter Registered Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                                disabled={loading}
                            />

                            {error && (
                                <p className="auth-error">{error}</p>
                            )}

                            <button onClick={handleReset} disabled={loading}>
                                {loading ? "Sending Reset Link..." : "Send Reset Link"}
                            </button>

                            <p className="toggle-auth">
                                Back to{" "}
                                <Link to="/">Login</Link>
                            </p>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;