import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/timeline.css";
import { getClaimById } from "../services/claimsService";

const STG_NAMES = {
    "SG039A": "Cholecystectomy — Open (No CBD)",   "SG039B": "Cholecystectomy — Open (With CBD)",
    "SG039C": "Cholecystectomy — Laparoscopic (No CBD)", "SG039D": "Cholecystectomy — Laparoscopic (With CBD)",
    "MG006A": "Enteric Fever",  "MG001A": "Acute Febrile Illness",
    "MG026A": "Pyrexia of Unknown Origin", "MG064A": "Severe Anemia",
    "SB039A": "Total Knee Replacement (Primary)", "SB039B": "Total Knee Replacement (Revision)",
};

function buildTimeline(claim) {
    if (!claim) return [];
    const events = [];
    const code = claim.diagnosis_code || "";
    const created = claim.created_at ? new Date(claim.created_at) : new Date();
    const fmt = (d) => d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    events.push({
        status: "done",
        date: fmt(created),
        title: "Claim Submitted",
        desc: `${code ? `STG ${code} — ${STG_NAMES[code] || code}` : "Claim"} submitted for processing.`,
    });

    events.push({
        status: "done",
        date: fmt(new Date(created.getTime() + 30000)),
        title: "Clinical Data Recorded",
        desc: [
            claim.patient_age   ? `Patient age: ${claim.patient_age}y`       : null,
            claim.alos          ? `ALOS: ${claim.alos} days`                  : null,
            claim.hb_level      ? `Hb level: ${claim.hb_level} g/dL`          : null,
            claim.fever_duration_days ? `Fever duration: ${claim.fever_duration_days} days` : null,
        ].filter(Boolean).join(" · ") || "Clinical fields recorded.",
    });

    // Count submitted docs
    const docFields = [
        "has_diagnostic_report","has_clinical_notes","has_indoor_case_papers",
        "has_operative_note","has_pre_anesthesia_report","has_discharge_summary",
        "has_treatment_records","has_post_treatment_report","has_histopathology_report",
        "has_implant_invoice","has_preop_xray","has_postop_photo","has_lft_report",
    ];
    const submittedDocs = docFields.filter(f => claim[f]).length;
    events.push({
        status: submittedDocs > 0 ? "done" : "pending",
        date: fmt(new Date(created.getTime() + 60000)),
        title: "Mandatory Documents",
        desc: `${submittedDocs} mandatory document(s) marked as submitted.`,
    });

    if (claim.has_previous_cholecystectomy) {
        events.push({
            status: "rejected",
            date: fmt(new Date(created.getTime() + 90000)),
            title: "🚩 Fraud Flag Triggered",
            desc: "Previous cholecystectomy detected — NHA TMS rule III violated.",
        });
    }

    const statusMap = { verified: "done", rejected: "rejected", pending: "pending", processing: "pending" };
    events.push({
        status: statusMap[claim.status] || "pending",
        date: fmt(new Date(created.getTime() + 120000)),
        title: claim.status === "verified"   ? "Compliance Passed — APPROVED"
             : claim.status === "rejected"   ? "Compliance Check — REJECTED"
             : "Pending Compliance Check",
        desc: claim.status === "verified"   ? "All NHA STG rules satisfied. Claim approved for reimbursement."
            : claim.status === "rejected"   ? "One or more NHA TMS rules failed. Claim rejected."
            : "Awaiting compliance engine verification.",
    });

    return events;
}

function Timeline() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [claim,   setClaim]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    useEffect(() => {
        if (!claimId) {
            setError("No claim ID. Redirecting…");
            setLoading(false);
            const t = setTimeout(() => navigate("/dashboard"), 2000);
            return () => clearTimeout(t);
        }
        getClaimById(claimId)
            .then(setClaim)
            .catch(err => setError(err.message || "Failed to load claim."))
            .finally(() => setLoading(false));
    }, [claimId]);

    const events  = buildTimeline(claim);
    const nextPath = claimId ? `/compliance?id=${claimId}` : "/compliance";

    return (
        <Layout>
            <div className="timeline-page">
                <div className="timeline-header">
                    <h1>Treatment Timeline</h1>
                    <p>Claim processing journey based on submitted data</p>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                {loading ? (
                    <p style={{ color: "#94a3b8", padding: "2rem" }}>Loading timeline…</p>
                ) : (
                    <div className="timeline-wrapper">
                        {events.map((item, index) => (
                            <div className="timeline-item" key={index}>
                                <div className={`timeline-dot ${item.status}`} />
                                <div className="timeline-card">
                                    <span>{item.date}</span>
                                    <h3>{item.title}</h3>
                                    {item.desc && <p>{item.desc}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button className="timeline-btn" onClick={() => navigate(nextPath)}>
                    Continue to Compliance →
                </button>
            </div>
        </Layout>
    );
}

export default Timeline;