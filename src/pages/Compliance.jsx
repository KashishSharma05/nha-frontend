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

    const isCompliant = report?.verdict === "APPROVED";
    const score       = report?.compliance_score ?? (isCompliant ? 100 : 0);
    const riskLabel   = report?.risk_level ?? (isCompliant ? "Low Risk" : "High Risk");
    const recommendation = report?.recommendation ?? "Waiting for analysis...";

    const tmsFailures = report?.tms_failures || [];
    const docFailures = report?.doc_failures || [];
    const matchedRules = report?.matched_rules || [];

    const nextPath = claimId ? `/decision?id=${claimId}` : "/decision";

    return (
        <Layout>
            <div className="compliance-page">
                <div className="compliance-header">
                    <h1>STG Compliance Check</h1>
                    <p>Medical protocol validation report against NHA STG Guidelines</p>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                <div className="compliance-score-card">
                    <div className="score-circle">
                        {loading ? "…" : `${score}%`}
                    </div>

                    <div className="score-details">
                        <h2>Compliance Score</h2>
                        <p>Weighted scoring: TMS checks (critical), Mandatory docs (high), Clinical (medium)</p>

                        <span className={`risk-badge ${riskLabel.toLowerCase().replace(" ", "-")}`}>
                            {loading ? "Loading..." : riskLabel}
                        </span>
                    </div>
                </div>

                {!loading && (
                    <div className="rules-grid">

                        {/* Critical TMS Failures */}
                        {tmsFailures.length > 0 && (
                            <div className="rules-card" style={{ gridColumn: "1 / -1", borderLeft: "4px solid #ef4444" }}>
                                <h2 style={{ color: "#ef4444" }}>🚨 Critical NHA TMS Failures ({tmsFailures.length})</h2>
                                {tmsFailures.map((rule, i) => (
                                    <div className="rule failed critical" key={i}>
                                        <p style={{ fontWeight: "bold", marginBottom: "4px" }}>[{rule.id}] {rule.description}</p>
                                        <p style={{ color: "#991b1b", fontSize: "13px" }}><strong>Fix:</strong> {rule.fix}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Document Failures */}
                        {docFailures.length > 0 && (
                            <div className="rules-card">
                                <h2 style={{ color: "#f59e0b" }}>⚠️ Missing Mandatory Documents ({docFailures.length})</h2>
                                {docFailures.map((rule, i) => (
                                    <div className="rule failed" style={{ borderColor: "#fde68a", background: "#fffbeb" }} key={i}>
                                        <p style={{ fontWeight: "bold", marginBottom: "4px" }}>[{rule.id}] {rule.description}</p>
                                        <p style={{ color: "#b45309", fontSize: "13px" }}><strong>Fix:</strong> {rule.fix}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Matched Rules */}
                        <div className="rules-card" style={docFailures.length === 0 ? { gridColumn: "1 / -1" } : {}}>
                            <h2 style={{ color: "#22c55e" }}>✅ Passed Rules ({matchedRules.length})</h2>
                            {matchedRules.length > 0 ? (
                                matchedRules.map((rule, i) => (
                                    <div className="rule success" key={i}>
                                        <p>[{rule.id}] {rule.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No rules passed.</p>
                            )}
                        </div>

                    </div>
                )}

                <div className="recommendation-box">
                    <h2>AI Recommendation</h2>
                    <p>{loading ? "Analyzing..." : recommendation}</p>
                </div>

                <button className="next-btn" onClick={() => navigate(nextPath)}>
                    Continue to Decision →
                </button>
            </div>
        </Layout>
    );
}

export default Compliance;