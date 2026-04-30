import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await login({ email, password });
            await refreshUser();
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT PANEL */}
            <div className="left-panel">

                <h1>Claim VerifiAI</h1>
                <p>
                    AI Powered Healthcare Claim
                    Validation Platform
                </p>

                <div className="feature-box">
                    <h3>OCR + AI Extraction</h3>
                    <p>
                        Automatically extract claim
                        documents and patient data
                    </p>
                </div>

                <div className="feature-box">
                    <h3>STG Rule Validation</h3>
                    <p>
                        Validate treatment against
                        healthcare compliance rules
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Timeline Intelligence</h3>
                    <p>
                        Build complete treatment
                        journey automatically
                    </p>
                </div>

            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">

                <div className="login-box">

                    <h2>Welcome Back</h2>
                    <p>
                        Login to continue claim
                        validation and reporting
                    </p>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <Link
                        to="/forgot-password"
                        className="forgot-link"
                    >
                        Forgot Password?
                    </Link>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="toggle-auth">
                        New user?{" "}
                        <Link to="/register">
                            Create Account
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;