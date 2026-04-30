import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/compliance.css";

function Compliance() {
    const navigate = useNavigate();

    const matchedRules = [
        "Correct antibiotic prescribed",
        "Required blood tests completed",
        "Admission timeline valid",
        "Treatment duration acceptable",
    ];

    const failedRules = [
        "Duplicate lab billing detected",
        "Extra medicine outside protocol",
    ];

    return (
        <Layout>
            <div className="compliance-page">

                <div className="compliance-header">
                    <h1>STG Compliance Check</h1>
                    <p>Medical protocol validation report</p>
                </div>

                <div className="compliance-score-card">
                    <div className="score-circle">
                        82%
                    </div>

                    <div className="score-details">
                        <h2>Compliance Score</h2>
                        <p>
                            Claim mostly follows treatment guidelines
                        </p>

                        <span className="risk-badge">
                            Medium Risk
                        </span>
                    </div>
                </div>

                <div className="rules-grid">

                    {/* Matched Rules */}
                    <div className="rules-card">
                        <h2>Matched Rules</h2>

                        {matchedRules.map((rule, index) => (
                            <div
                                className="rule success"
                                key={index}
                            >
                                {rule}
                            </div>
                        ))}
                    </div>

                    {/* Failed Rules */}
                    <div className="rules-card">
                        <h2>Failed Rules</h2>

                        {failedRules.map((rule, index) => (
                            <div
                                className="rule failed"
                                key={index}
                            >
                                {rule}
                            </div>
                        ))}
                    </div>

                </div>

                <div className="recommendation-box">
                    <h2>AI Recommendation</h2>
                    <p>
                        Manual review suggested before final approval
                    </p>
                </div>

                <button
                    className="next-btn"
                    onClick={() => navigate("/decision")}
                >
                    Continue to Decision →
                </button>

            </div>
        </Layout>
    );
}

export default Compliance;