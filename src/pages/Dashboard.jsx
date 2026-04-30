import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const stats = [
        {
            title: "Total Claims",
            value: "128",
            sub: "+12 today",
        },
        {
            title: "Pending Review",
            value: "24",
            sub: "Needs action",
        },
        {
            title: "Risk Alerts",
            value: "09",
            sub: "High priority",
        },
        {
            title: "Approved",
            value: "95",
            sub: "Completed",
        },
    ];

    const recentClaims = [
        {
            name: "Rohit Sharma",
            amount: "₹45,000",
            status: "Approved",
        },
        {
            name: "Priya Singh",
            amount: "₹22,000",
            status: "Pending",
        },
        {
            name: "Aman Verma",
            amount: "₹67,000",
            status: "Rejected",
        },
    ];

    const riskAlerts = [
        "Duplicate Billing Found",
        "Treatment Mismatch",
        "Compliance Failed",
    ];

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

                {/* TOP STATS */}
                <div className="stats-grid">
                    {stats.map((item, index) => (
                        <div className="stat-card" key={index}>
                            <h4>{item.title}</h4>
                            <h2>{item.value}</h2>
                            <p>{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ANALYTICS */}
                <div className="analytics-grid">

                    <div className="analytics-card approved-card">
                        <div className="circle approved-circle">
                            76%
                        </div>
                        <h3>Approved Claims</h3>
                        <p>98 approved this month</p>
                    </div>

                    <div className="analytics-card rejected-card">
                        <div className="circle rejected-circle">
                            14%
                        </div>
                        <h3>Rejected Claims</h3>
                        <p>18 rejected this month</p>
                    </div>

                    <div className="analytics-card pending-card">
                        <div className="circle pending-circle">
                            10%
                        </div>
                        <h3>Pending Claims</h3>
                        <p>12 under review</p>
                    </div>

                </div>

                {/* MAIN CONTENT */}
                <div className="dashboard-content">

                    {/* RECENT CLAIMS */}
                    <div className="card-box">
                        <h2>Recent Claims</h2>

                        {recentClaims.map((claim, index) => (
                            <div className="claim-row" key={index}>
                                <span>{claim.name}</span>
                                <span>{claim.amount}</span>
                                <span>{claim.status}</span>
                            </div>
                        ))}
                    </div>

                    {/* RISK ALERTS */}
                    <div className="card-box">
                        <h2>Risk Alerts</h2>

                        {riskAlerts.map((alert, index) => (
                            <div className="alert-item" key={index}>
                                {alert}
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </Layout>
    );
}

export default Dashboard;