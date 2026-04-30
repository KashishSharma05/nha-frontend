import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    alert("Password reset link sent successfully");
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
          <h3>Secure Reset</h3>
          <p>
            Email-based secure password recovery
          </p>
        </div>

        <div className="feature-box">
          <h3>Fast Recovery</h3>
          <p>
            Reset your account in minutes
          </p>
        </div>

        <div className="feature-box">
          <h3>Protected Access</h3>
          <p>
            Keep your healthcare claim data secure
          </p>
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

          <input
            type="email"
            placeholder="Enter Registered Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <button onClick={handleReset}>
            Send Reset Link
          </button>

          <p className="toggle-auth">
            Back to{" "}
            <Link to="/">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;