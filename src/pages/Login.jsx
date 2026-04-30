import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        navigate("/dashboard");
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

                    <button onClick={handleLogin}>
                        Login
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