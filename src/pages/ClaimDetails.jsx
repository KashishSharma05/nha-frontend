import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/claimDetails.css";
import { getClaimById } from "../services/claimsService";

function ClaimDetails() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [claim, setClaim]         = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");

    useEffect(() => {
        if (!claimId) {
            setError("No claim ID provided. Redirecting to dashboard...");
            setLoading(false);
            const timer = setTimeout(() => navigate("/dashboard"), 2000);
            return () => clearTimeout(timer);
        }

        getClaimById(claimId)
            .then(setClaim)
            .catch((err) => setError(err.message || "Failed to load claim details."))
            .finally(() => setLoading(false));
    }, [claimId]);

    // Normalise fields — backend returns: { id, title, description, status, document, source, created_at }
    // Rich fields (patient_name, diagnosis, etc.) don't exist yet in the backend model
    const patientData = claim
        ? {
              "Claim Title":  claim.title        ?? claim.patient_name   ?? "—",
              "Description":  claim.description   ?? "—",
              Status:         claim.status                                ?? "—",
              "Claim ID":     claim.id            ?? claim.patient_id     ?? "—",
              "Created":      claim.created_at ? new Date(claim.created_at).toLocaleString() : "—",
              "Document":     claim.document      ?? "No document",
          }
        : {};

    const diagnosis  = claim?.diagnosis   ?? claim?.diagnoses ?? [];
    const treatment  = claim?.treatment   ?? claim?.treatments ?? [];
    const costs      = claim?.costs       ?? claim?.cost_breakdown ?? [];
    const riskFlags  = claim?.risk_flags  ?? claim?.riskFlags ?? [];
    const confidence = claim?.ocr_confidence ?? claim?.ocrConfidence ?? "—";
    const total      = claim?.total_amount ?? claim?.totalAmount ?? "—";

    const nextPath = claimId ? `/timeline?id=${claimId}` : "/timeline";

    return (
        <Layout>
            <div className="claim-page">

                <div className="claim-top">
                    <div>
                        <h1>Claim Analysis</h1>
                        <p>AI Extracted Medical Claim Information</p>
                    </div>

                    <div className="confidence-box">
                        <span>OCR Confidence</span>
                        <h2>{loading ? "…" : `${confidence}${typeof confidence === "number" ? "%" : ""}`}</h2>
                    </div>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                {loading ? (
                    <p style={{ color: "#94a3b8", padding: "2rem" }}>Loading claim data...</p>
                ) : (
                    <div className="claim-grid">

                        {/* Patient Info */}
                        <div className="claim-card">
                            <h2>Patient Details</h2>

                            {Object.entries(patientData).map(([key, value], index) => (
                                <div className="row" key={index}>
                                    <span>{key}</span>
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </div>

                        {/* Diagnosis */}
                        <div className="claim-card">
                            <h2>Diagnosis</h2>

                            {diagnosis.length > 0 ? (
                                diagnosis.map((item, index) => (
                                    <div className="tag red" key={index}>
                                        {typeof item === "string" ? item : item.name ?? item.label ?? JSON.stringify(item)}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No diagnosis data</p>
                            )}
                        </div>

                        {/* Treatment */}
                        <div className="claim-card">
                            <h2>Treatment Plan</h2>

                            {treatment.length > 0 ? (
                                treatment.map((item, index) => (
                                    <div className="tag green" key={index}>
                                        {typeof item === "string" ? item : item.name ?? item.label ?? JSON.stringify(item)}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No treatment data</p>
                            )}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="claim-card">
                            <h2>Cost Breakdown</h2>

                            {costs.length > 0 ? (
                                costs.map((item, index) => (
                                    <div className="row" key={index}>
                                        <span>{item.item ?? item.name ?? item.label ?? "Item"}</span>
                                        <strong>{item.amount ?? item.cost ?? "—"}</strong>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No cost data</p>
                            )}

                            <div className="total-box">
                                Total Claim: {total}
                            </div>
                        </div>

                        {/* Risk Flags */}
                        <div className="claim-card full-width">
                            <h2>Risk Flags</h2>

                            <div className="flags">
                                {riskFlags.length > 0 ? (
                                    riskFlags.map((item, index) => (
                                        <div className="flag" key={index}>
                                            {typeof item === "string" ? item : item.message ?? item.flag ?? JSON.stringify(item)}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: "#22c55e" }}>No risk flags detected ✓</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                <button
                    className="next-btn"
                    onClick={() => navigate(nextPath)}
                >
                    Continue to Timeline →
                </button>

            </div>
        </Layout>
    );
}

export default ClaimDetails;