import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/claimDetails.css";
import { getClaimById, deleteClaim, generatePS1Output, getPS1Output } from "../services/claimsService";

const STG_NAMES = {
    "SG039A": "Cholecystectomy — Open (No CBD)",
    "SG039B": "Cholecystectomy — Open (With CBD)",
    "SG039C": "Cholecystectomy — Laparoscopic (No CBD)",
    "SG039D": "Cholecystectomy — Laparoscopic (With CBD)",
    "MG006A": "Enteric Fever (Typhoid)",
    "MG001A": "Acute Febrile Illness",
    "MG026A": "Pyrexia of Unknown Origin",
    "MG064A": "Severe Anemia",
    "SB039A": "Total Knee Replacement (Primary)",
    "SB039B": "Total Knee Replacement (Revision)",
};
const STG_SPECIALTY = {
    "SG039A": "General Surgery", "SG039B": "General Surgery",
    "SG039C": "General Surgery", "SG039D": "General Surgery",
    "MG006A": "General Medicine", "MG001A": "General Medicine",
    "MG026A": "General Medicine", "MG064A": "General Medicine",
    "SB039A": "Orthopedics",     "SB039B": "Orthopedics",
};
const WARD_LABELS = {
    general_ward: "General Ward",
    hdu: "HDU",
    icu: "ICU (no ventilator)",
    icu_ventilator: "ICU (with ventilator)",
};

function Row({ label, value }) {
    return (
        <div className="row">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function ClaimDetails() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [claim,   setClaim]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    
    const [ps1Data, setPs1Data] = useState(null);
    const [ps1Loading, setPs1Loading] = useState(false);
    const [ps1Error, setPs1Error] = useState("");

    useEffect(() => {
        if (!claimId) {
            setError("No claim ID provided. Redirecting…");
            setLoading(false);
            const t = setTimeout(() => navigate("/dashboard"), 2000);
            return () => clearTimeout(t);
        }
        getClaimById(claimId)
            .then(res => {
                // Axios response wraps data in `res.data` if using standard Axios,
                // but if claimsService unwraps it, we handle accordingly.
                setClaim(res.data || res);
                return getPS1Output(claimId);
            })
            .then(res => {
                setPs1Data(res.data || res);
            })
            .catch(err => {
                if (!claim) {
                    setError(err.message || "Failed to load claim.");
                }
            })
            .finally(() => setLoading(false));
    }, [claimId]);

    const handleGeneratePS1 = async () => {
        setPs1Loading(true);
        setPs1Error("");
        try {
            const res = await generatePS1Output(claimId);
            setPs1Data(res.data || res);
        } catch (err) {
            setPs1Error(err.response?.data?.error || err.message || "Failed to generate PS-1 output.");
        } finally {
            setPs1Loading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this claim?")) return;
        
        try {
            await deleteClaim(claimId);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to delete claim: " + (err.message || "Unknown error"));
        }
    };

    const nextPath = claimId ? `/timeline?id=${claimId}` : "/timeline";

    const code     = claim?.diagnosis_code || "";
    const wardType = claim?.ward_type || "general_ward";

    // Derive mandatory doc flags
    const docFlags = claim ? [
        { label: "Diagnostic Report (USG / CBC / X-ray / Hb)", ok: claim.has_diagnostic_report },
        { label: "Clinical Notes",                              ok: claim.has_clinical_notes },
        { label: "LFT Report",                                  ok: claim.has_lft_report },
        { label: "Indoor Case Papers",                          ok: claim.has_indoor_case_papers },
        { label: "Operative Note",                              ok: claim.has_operative_note },
        { label: "Pre-anesthesia Report",                       ok: claim.has_pre_anesthesia_report },
        { label: "Discharge Summary",                           ok: claim.has_discharge_summary },
        { label: "Treatment Records",                           ok: claim.has_treatment_records },
        { label: "Post-treatment / Intraop Report",             ok: claim.has_post_treatment_report },
        { label: "Histopathology Report",                       ok: claim.has_histopathology_report },
        { label: "Implant Invoice / Barcode",                   ok: claim.has_implant_invoice },
        { label: "Pre-op X-ray (Revision TKR)",                 ok: claim.has_preop_xray },
        { label: "Post-op Clinical Photograph",                 ok: claim.has_postop_photo },
    ].filter(d => d.ok !== undefined && d.ok !== null && d.ok !== false) : [];

    const fraudFlag = claim?.has_previous_cholecystectomy;

    return (
        <Layout>
            <div className="claim-page">
                <div className="claim-top">
                    <div>
                        <h1>Claim Analysis</h1>
                        <p>STG-based claim information extracted from submission</p>
                    </div>
                    <div className="confidence-box">
                        <span>Status</span>
                        <h2 style={{ textTransform: "capitalize" }}>
                            {loading ? "…" : (claim?.status || "—")}
                        </h2>
                    </div>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                {loading ? (
                    <p style={{ color: "#94a3b8", padding: "2rem" }}>Loading claim data…</p>
                ) : (
                    <div className="claim-grid">

                        {/* Claim Info */}
                        <div className="claim-card">
                            <h2>Claim Details</h2>
                            <Row label="Claim ID"    value={`#${claim?.id}`} />
                            <Row label="Title"       value={claim?.title} />
                            <Row label="Status"      value={claim?.status} />
                            <Row label="Submitted"   value={claim?.created_at ? new Date(claim.created_at).toLocaleString("en-IN") : "—"} />
                            {claim?.document && (
                                <div className="row">
                                    <span>Document</span>
                                    <a href={claim.document} target="_blank" rel="noreferrer" style={{ color: "#6366f1", fontSize: "13px", wordBreak: "break-all" }}>
                                        View uploaded file ↗
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Procedure / Diagnosis */}
                        <div className="claim-card">
                            <h2>Procedure (STG)</h2>
                            {code ? (
                                <>
                                    <div className="tag red" style={{ marginBottom: "12px", fontSize: "13px" }}>
                                        {code} — {STG_NAMES[code] || code}
                                    </div>
                                    <Row label="Specialty"      value={STG_SPECIALTY[code]} />
                                    <Row label="Patient Age"    value={claim?.patient_age ? `${claim.patient_age} years` : null} />
                                    <Row label="ALOS"           value={claim?.alos ? `${claim.alos} days` : null} />
                                    {claim?.hb_level    && <Row label="Hb Level"     value={`${claim.hb_level} g/dL`} />}
                                    {claim?.fever_duration_days && <Row label="Fever Duration" value={`${claim.fever_duration_days} days`} />}
                                    <Row label="Ward Type"      value={WARD_LABELS[wardType] || wardType} />
                                    <Row label="Claimed Amount" value={claim?.claimed_amount ? `₹${Number(claim.claimed_amount).toLocaleString("en-IN")}` : null} />
                                </>
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No STG procedure selected</p>
                            )}
                        </div>

                        {/* Documents Submitted */}
                        <div className="claim-card">
                            <h2>Documents Submitted</h2>
                            {docFlags.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {docFlags.map((d, i) => (
                                        <div key={i} className="tag green" style={{ fontSize: "13px" }}>
                                            ✅ {d.label}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#94a3b8" }}>No documents marked as submitted</p>
                            )}
                        </div>

                        {/* Fraud / Risk Flags */}
                        <div className="claim-card">
                            <h2>Risk Flags</h2>
                            {fraudFlag ? (
                                <div className="flag" style={{ color: "#ef4444", fontWeight: 600, padding: "10px", background: "#fef2f2", borderRadius: "8px" }}>
                                    🚩 Previous cholecystectomy on record — NHA TMS fraud flag triggered
                                </div>
                            ) : (
                                <p style={{ color: "#22c55e" }}>No risk flags detected ✓</p>
                            )}
                        </div>

                    </div>
                )}

                {/* PS-1 Output Section */}
                {!loading && claim?.document && (
                    <div className="claim-card" style={{ marginTop: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h2>PS-1 Compliance Output</h2>
                            <button 
                                onClick={handleGeneratePS1} 
                                disabled={ps1Loading}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#6366f1",
                                    color: "white",
                                    fontWeight: "600",
                                    cursor: ps1Loading ? "not-allowed" : "pointer",
                                    opacity: ps1Loading ? 0.7 : 1
                                }}
                            >
                                {ps1Loading ? "Generating..." : "Generate PS-1 Data"}
                            </button>
                        </div>
                        
                        {ps1Error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{ps1Error}</p>}
                        
                        {ps1Data ? (
                            <div style={{ background: "#1e293b", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
                                <pre style={{ color: "#e2e8f0", fontSize: "13px", margin: 0 }}>
                                    {JSON.stringify(ps1Data.ps1_output, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <p style={{ color: "#94a3b8" }}>
                                {ps1Loading ? "Analyzing document pages with Gemini..." : "PS-1 per-page output has not been generated for this claim yet."}
                            </p>
                        )}
                    </div>
                )}

                <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                    <button className="next-btn" onClick={() => navigate(nextPath)}>
                        Continue to Timeline →
                    </button>
                    <button 
                        onClick={handleDelete}
                        style={{
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "12px",
                            background: "#ef4444",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "0.3s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                        onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
                    >
                        🗑️ Delete Claim
                    </button>
                </div>
            </div>
        </Layout>

    );
}

export default ClaimDetails;