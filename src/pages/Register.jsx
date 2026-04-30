import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [name, setName] = useState("");
    const [hospital, setHospital] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        if (!name || !hospital || !email || !password) {
            setError("Please fill all fields");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Password strength: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter");
            return;
        }
        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await register({ username: name, email, password });
            await refreshUser();
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* LEFT PANEL */}
            <div className="left-panel">

                <h1>Create Account</h1>
                <p>
                    Start validating healthcare
                    claims with AI-powered automation
                </p>

                <div className="feature-box">
                    <h3>Fast Claim Review</h3>
                    <p>
                        Upload and validate claims
                        within minutes
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Fraud Detection</h3>
                    <p>
                        Detect suspicious billing
                        patterns automatically
                    </p>
                </div>

                <div className="feature-box">
                    <h3>Compliance Check</h3>
                    <p>
                        Auto STG guideline verification
                        for treatments
                    </p>
                </div>

            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">

                <div className="login-box">

                    <h2>Register</h2>
                    <p>
                        Create your professional
                        claim verification account
                    </p>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Hospital / Organization"
                        value={hospital}
                        onChange={(e) =>
                            setHospital(e.target.value)
                        }
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button onClick={handleRegister} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <p className="toggle-auth">
                        Already have an account?{" "}
                        <Link to="/">
                            Login
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;