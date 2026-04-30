import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/compliance.css";
import { getComplianceReport } from "../services/reportsService";

function Compliance() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [report, setReport]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");

    useEffect(() => {
        if (!claimId) {
            setError("No claim ID provided. Redirecting to dashboard...");
            setLoading(false);
            const timer = setTimeout(() => navigate("/dashboard"), 2000);
            return () => clearTimeout(timer);
        }

        getComplianceReport(claimId)
            .then(setReport)
            .catch((err) => setError(err.message || "Failed to load compliance report."))
            .finally(() => setLoading(false));
    }, [claimId]);

    const matchedRules = report?.matched_rules ?? report?.matchedRules ?? [];
    const failedRules  = report?.failed_rules  ?? report?.failedRules  ?? [];
    const score        = report?.compliance_score ?? report?.complianceScore ?? report?.score ?? "—";
    const riskLabel    = report?.risk_level ?? report?.riskLevel ?? report?.risk ?? "—";
    const recommendation = report?.recommendation ?? report?.ai_recommendation ?? "Waiting for analysis...";

    const nextPath = claimId ? `/decision?id=${claimId}` : "/decision";

    return (
        <Layout>
            <div className="compliance-page">

                <div className="compliance-header">
                    <h1>STG Compliance Check</h1>
                    <p>Medical protocol validation report</p>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                <div className="compliance-score-card">
                    <div className="score-circle">
                        {loading ? "…" : `${score}${typeof score === "number" ? "%" : ""}`}
                    </div>

                    <div className="score-details">
                        <h2>Compliance Score</h2>
                        <p>
                            Claim mostly follows treatment guidelines
                        </p>

                        <span className="risk-badge">
                            {loading ? "Loading..." : riskLabel}
                        </span>
                    </div>
                </div>

                {!loading && (
                    <div className="rules-grid">

                        {/* Matched Rules */}
                        <div className="rules-card">
                            <h2>Matched Rules</h2>

                            {matchedRules.length > 0 ? (
                                matchedRules.map((rule, index) => (
                                    <div className="rule success" key={index}>
                                        {typeof rule === "string" ? rule : rule.name ?? rule.rule ?? JSON.stringify(rule)}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No matched rules</p>
                            )}
                        </div>

                        {/* Failed Rules */}
                        <div className="rules-card">
                            <h2>Failed Rules</h2>

                            {failedRules.length > 0 ? (
                                failedRules.map((rule, index) => (
                                    <div className="rule failed" key={index}>
                                        {typeof rule === "string" ? rule : rule.name ?? rule.rule ?? JSON.stringify(rule)}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#22c55e" }}>All rules passed ✓</p>
                            )}
                        </div>

                    </div>
                )}

                <div className="recommendation-box">
                    <h2>AI Recommendation</h2>
                    <p>
                        {loading ? "Analyzing..." : recommendation}
                    </p>
                </div>

                <button
                    className="next-btn"
                    onClick={() => navigate(nextPath)}
                >
                    Continue to Decision →
                </button>

            </div>
        </Layout>
    );
}

export default Compliance;