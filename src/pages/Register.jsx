import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [hospital, setHospital] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = () => {
        if (!name || !hospital || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        // Backend API later
        navigate("/dashboard");
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

                    <button onClick={handleRegister}>
                        Create Account
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