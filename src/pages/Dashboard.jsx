import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/dashboard.css";
import { getDashboardAnalytics } from "../services/reportsService";
import { listClaims } from "../services/claimsService";

// Stats placeholder for initial loading state
const LOADING_STATS = [
    { title: "Total Claims",   value: null, sub: "Loading..." },
    { title: "Pending Review", value: null, sub: "Loading..." },
    { title: "Risk Alerts",    value: null, sub: "Loading..." },
    { title: "Approved",       value: null, sub: "Loading..." },
];

function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats]               = useState(LOADING_STATS);
    const [recentClaims, setRecentClaims] = useState([]);
    const [riskAlerts, setRiskAlerts]     = useState([]);
    const [analytics, setAnalytics]       = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                // Run both requests in parallel
                const [analyticsData, claimsData] = await Promise.allSettled([
                    getDashboardAnalytics(),
                    listClaims(),
                ]);

                // Handle analytics / summary stats
                if (analyticsData.status === "fulfilled" && analyticsData.value) {
                    const d = analyticsData.value;
                    setAnalytics(d);

                    // Backend returns: { total_claims, verified_claims, pending_claims, rejected_claims }
                    // OR summary endpoint: { total, pending, verified, rejected }
                    const total    = d.total_claims   ?? d.total        ?? d.totalClaims   ?? 0;
                    const pending  = d.pending_claims  ?? d.pending      ?? d.pendingClaims  ?? 0;
                    const verified = d.verified_claims ?? d.verified     ?? d.approvedClaims ?? 0;
                    const rejected = d.rejected_claims ?? d.rejected     ?? d.rejectedClaims ?? 0;

                    setStats([
                        { title: "Total Claims",   value: total,    sub: "+today" },
                        { title: "Pending Review", value: pending,  sub: "Needs action" },
                        { title: "Risk Alerts",    value: rejected, sub: "High priority" },
                        { title: "Approved",       value: verified, sub: "Completed" },
                    ]);
                    setRiskAlerts(d.risk_alert_list ?? d.riskAlertList ?? []);
                }

                // Handle recent claims list
                if (claimsData.status === "fulfilled" && claimsData.value) {
                    const list = Array.isArray(claimsData.value)
                        ? claimsData.value
                        : claimsData.value.results ?? claimsData.value.claims ?? [];
                    // Show the 5 most recent
                    setRecentClaims(list.slice(0, 5));
                }
            } catch (err) {
                setError("Failed to load dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

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

    // Derived analytics percentages (use API values if available, else defaults)
    // Derive percentages from raw counts
    const total = analytics?.total_claims ?? analytics?.total ?? 1; // avoid /0
    const verifiedN = analytics?.verified_claims ?? analytics?.verified ?? 0;
    const rejectedN = analytics?.rejected_claims ?? analytics?.rejected ?? 0;
    const pendingN  = analytics?.pending_claims  ?? analytics?.pending  ?? 0;
    const approvedPct = total > 0 ? Math.round((verifiedN / total) * 100) : 0;
    const rejectedPct = total > 0 ? Math.round((rejectedN / total) * 100) : 0;
    const pendingPct  = total > 0 ? Math.round((pendingN  / total) * 100) : 0;

    return (
        <Layout>
            <div className="dashboard-page">

                {/* HEADER */}
                <div className="dashboard-header">
                    <div>
                        <h1>Claim Dashboard</h1>
                        <p>AI-powered healthcare claim intelligence</p>
                    </div>

                    <button
                        className="upload-btn"
                        onClick={() => navigate("/upload")}
                    >
                        Upload Claim
                    </button>
                </div>

                {error && (
                    <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
                )}

                {/* TOP STATS */}
                <div className="stats-grid">
                    {stats.map((item, index) => (
                        <div className={`stat-card ${loading ? "loading" : ""}`} key={index}>
                            <h4>{item.title}</h4>
                            <h2>{loading || item.value === null ? (
                                <span className="skeleton-text" style={{ display: "inline-block", width: "40px", height: "24px", background: "#e5e7eb", borderRadius: "4px" }} />
                            ) : item.value}</h2>
                            <p>{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ANALYTICS */}
                <div className="analytics-grid">

                    <div className="analytics-card approved-card">
                        <div className="circle approved-circle" style={{ background: `conic-gradient(#22c55e ${approvedPct}%, #e5e7eb 0%)` }}>
                            {approvedPct}%
                        </div>
                        <h3>Approved Claims</h3>
                        <p>{verifiedN} approved this month</p>
                    </div>

                    <div className="analytics-card rejected-card">
                        <div className="circle rejected-circle" style={{ background: `conic-gradient(#ef4444 ${rejectedPct}%, #e5e7eb 0%)` }}>
                            {rejectedPct}%
                        </div>
                        <h3>Rejected Claims</h3>
                        <p>{rejectedN} rejected this month</p>
                    </div>

                    <div className="analytics-card pending-card">
                        <div className="circle pending-circle" style={{ background: `conic-gradient(#f59e0b ${pendingPct}%, #e5e7eb 0%)` }}>
                            {pendingPct}%
                        </div>
                        <h3>Pending Claims</h3>
                        <p>{pendingN} under review</p>
                    </div>

                </div>

                {/* MAIN CONTENT */}
                <div className="dashboard-content">

                    {/* RECENT CLAIMS */}
                    <div className="card-box" style={{ flex: 2 }}>
                        <h2>Recent Claims</h2>

                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>Loading claims...</p>
                        ) : recentClaims.length > 0 ? (
                            <div className="claims-table-container">
                                <div className="claim-row header" style={{ fontWeight: "bold", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "10px" }}>
                                    <span style={{ flex: 1 }}>ID</span>
                                    <span style={{ flex: 3 }}>Procedure</span>
                                    <span style={{ flex: 2 }}>Status</span>
                                    <span style={{ flex: 2, textAlign: "right" }}>Date</span>
                                </div>
                                {recentClaims.map((claim, index) => {
                                    const procName = STG_NAMES[claim.diagnosis_code] || claim.title || "Unknown Procedure";
                                    const statusColor = claim.status === "verified" ? "#10b981" : claim.status === "rejected" ? "#ef4444" : "#f59e0b";
                                    return (
                                        <div
                                            className="claim-row"
                                            key={claim.id ?? index}
                                            style={{ cursor: "pointer", padding: "12px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center" }}
                                            onClick={() => navigate(`/claim-details?id=${claim.id}`)}
                                        >
                                            <span style={{ flex: 1, color: "#64748b", fontWeight: "600" }}>#{claim.id}</span>
                                            <span style={{ flex: 3, fontWeight: "500", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "10px" }}>
                                                {procName}
                                            </span>
                                            <span style={{ flex: 2 }}>
                                                <span style={{
                                                    background: `${statusColor}15`,
                                                    color: statusColor,
                                                    padding: "4px 10px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    textTransform: "uppercase"
                                                }}>
                                                    {claim.status === "verified" ? "APPROVED" : claim.status ?? "PENDING"}
                                                </span>
                                            </span>
                                            <span style={{ flex: 2, textAlign: "right", color: "#64748b", fontSize: "14px" }}>
                                                {claim.created_at ? new Date(claim.created_at).toLocaleDateString("en-IN") : "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: "#94a3b8" }}>No claims found.</p>
                        )}
                    </div>

                    {/* RISK ALERTS */}
                    <div className="card-box">
                        <h2>Risk Alerts</h2>

                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>Loading alerts...</p>
                        ) : riskAlerts.length > 0 ? (
                            riskAlerts.map((alert, index) => (
                                <div className="alert-item" key={index}>
                                    {typeof alert === "string" ? alert : alert.message ?? alert.title ?? JSON.stringify(alert)}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: "#22c55e" }}>No active risk alerts 🎉</p>
                        )}
                    </div>

                </div>

            </div>
        </Layout>
    );
}

export default Dashboard;