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
                    setStats([
                        { title: "Total Claims",   value: d.total_claims   ?? d.totalClaims   ?? "0", sub: "+today" },
                        { title: "Pending Review", value: d.pending_claims  ?? d.pendingClaims  ?? "0", sub: "Needs action" },
                        { title: "Risk Alerts",    value: d.risk_alerts     ?? d.riskAlerts     ?? "0", sub: "High priority" },
                        { title: "Approved",       value: d.approved_claims ?? d.approvedClaims ?? "0", sub: "Completed" },
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

    // Derived analytics percentages (use API values if available, else defaults)
    const approvedPct = analytics?.approved_pct  ?? analytics?.approvedPct  ?? 76;
    const rejectedPct = analytics?.rejected_pct  ?? analytics?.rejectedPct  ?? 14;
    const pendingPct  = analytics?.pending_pct   ?? analytics?.pendingPct   ?? 10;

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
                        <div className="circle approved-circle">
                            {approvedPct}%
                        </div>
                        <h3>Approved Claims</h3>
                        <p>{analytics?.approved_count ?? analytics?.approvedCount ?? "—"} approved this month</p>
                    </div>

                    <div className="analytics-card rejected-card">
                        <div className="circle rejected-circle">
                            {rejectedPct}%
                        </div>
                        <h3>Rejected Claims</h3>
                        <p>{analytics?.rejected_count ?? analytics?.rejectedCount ?? "—"} rejected this month</p>
                    </div>

                    <div className="analytics-card pending-card">
                        <div className="circle pending-circle">
                            {pendingPct}%
                        </div>
                        <h3>Pending Claims</h3>
                        <p>{analytics?.pending_count ?? analytics?.pendingCount ?? "—"} under review</p>
                    </div>

                </div>

                {/* MAIN CONTENT */}
                <div className="dashboard-content">

                    {/* RECENT CLAIMS */}
                    <div className="card-box">
                        <h2>Recent Claims</h2>

                        {loading ? (
                            <p style={{ color: "#94a3b8" }}>Loading claims...</p>
                        ) : recentClaims.length > 0 ? (
                            recentClaims.map((claim, index) => (
                                <div
                                    className="claim-row"
                                    key={claim.id ?? index}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/claim-details?id=${claim.id}`)}
                                >
                                    <span>{claim.patient_name ?? claim.patientName ?? claim.name ?? "—"}</span>
                                    <span>{claim.amount ?? claim.total_amount ?? "—"}</span>
                                    <span>{claim.status ?? "—"}</span>
                                </div>
                            ))
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