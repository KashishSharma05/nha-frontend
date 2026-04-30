import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/reports.css";
import jsPDF from "jspdf";
import { getClaimReport } from "../services/reportsService";
import { getClaimTimeline } from "../services/claimsService";

function Reports() {
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [report, setReport]   = useState(null);
    const [logs, setLogs]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                if (!claimId) {
                    setError("No claim ID provided.");
                    setLoading(false);
                    return;
                }

                const [reportData, historyData] = await Promise.allSettled([
                    getClaimReport(claimId),
                    getClaimTimeline(claimId), // Use timeline for audit logs!
                ]);

                if (reportData.status === "fulfilled" && reportData.value) {
                    setReport(reportData.value);
                }

                if (historyData.status === "fulfilled" && historyData.value) {
                    const histList = Array.isArray(historyData.value)
                        ? historyData.value
                        : historyData.value.timeline ?? historyData.value.events ?? [];
                    setLogs(histList);
                }
            } catch (err) {
                setError(err.message || "Failed to load report data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [claimId]);

    const payableAmount   = report?.payable_amount ?? 0;
    const totalClaimed    = report?.total_claimed ?? 0;
    const complianceScore = report?.compliance_score ?? 0;
    const generatedOn     = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const statusDisplay   = report?.verdict || "PENDING";
    const procedure       = report?.procedure_name || "Unknown Procedure";

    const [pdfError, setPdfError] = useState("");

    const generatePDF = () => {
        try {
            setPdfError("");
            const doc = new jsPDF();

            doc.setFontSize(22);
            doc.text("Claim VerifiAI - Audit Report", 20, 20);

            doc.setFontSize(12);
            doc.text(`Claim ID: #${claimId}`, 20, 35);
            doc.text(`Procedure: ${procedure}`, 20, 45);
            doc.text(`Final Verdict: ${statusDisplay}`, 20, 55);
            doc.text(`Compliance Score: ${complianceScore}%`, 20, 65);
            doc.text(`Total Claimed: Rs. ${Number(totalClaimed).toLocaleString("en-IN")}`, 20, 75);
            doc.text(`Approved Payable: Rs. ${Number(payableAmount).toLocaleString("en-IN")}`, 20, 85);
            doc.text(`Generated On: ${generatedOn}`, 20, 95);

            doc.setFontSize(16);
            doc.text("STG Compliance Violations:", 20, 115);
            
            let y = 125;
            const failures = report?.failed_rules || [];
            if (failures.length > 0) {
                doc.setFontSize(10);
                failures.forEach(rule => {
                    const lines = doc.splitTextToSize(`[${rule.part}] ${rule.description} (Fix: ${rule.fix})`, 170);
                    doc.text(lines, 20, y);
                    y += lines.length * 5 + 3;
                    if (y > 280) { doc.addPage(); y = 20; }
                });
            } else {
                doc.setFontSize(10);
                doc.text("None. Fully compliant with NHA guidelines.", 20, y);
                y += 10;
            }

            doc.setFontSize(16);
            y += 10;
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text("Audit Timeline:", 20, y);
            y += 10;
            
            doc.setFontSize(10);
            logs.forEach((log) => {
                const title = log.title ?? log.event_type ?? "Event";
                const time  = log.date ?? log.created_at ?? "";
                const lines = doc.splitTextToSize(`• ${title} - ${time}`, 170);
                doc.text(lines, 20, y);
                y += lines.length * 5 + 2;
                if (y > 280) { doc.addPage(); y = 20; }
            });

            doc.save(`nha-audit-report-${claimId}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            setPdfError("Failed to generate PDF. Please try again.");
        }
    };

    return (
        <Layout>
            <div className="reports-page">
                <div className="reports-header">
                    <div>
                        <h1>Claim Final Report</h1>
                        <p>Generated AI decision and complete audit analysis</p>
                    </div>

                    <div className={`status-badge ${statusDisplay.toLowerCase()}`} style={{
                        background: statusDisplay === "APPROVED" ? "#10b981" : statusDisplay === "REJECTED" ? "#ef4444" : "#f59e0b",
                        color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold"
                    }}>
                        {loading ? "Loading..." : statusDisplay}
                    </div>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}
                {pdfError && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{pdfError}</p>}

                <div className="report-cards">
                    <div className="report-card">
                        <h4>Claim ID</h4>
                        <h2>{loading ? "…" : `#${claimId}`}</h2>
                    </div>

                    <div className="report-card">
                        <h4>Payable Amount</h4>
                        <h2>{loading ? "…" : `₹${Number(payableAmount).toLocaleString("en-IN")}`}</h2>
                        <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Claimed: ₹{Number(totalClaimed).toLocaleString("en-IN")}</p>
                    </div>

                    <div className="report-card">
                        <h4>Compliance Score</h4>
                        <h2>{loading ? "…" : `${complianceScore}%`}</h2>
                    </div>

                    <div className="report-card">
                        <h4>Generated On</h4>
                        <h2 style={{ fontSize: "16px", lineHeight: "1.2", marginTop: "8px" }}>{loading ? "…" : generatedOn}</h2>
                    </div>
                </div>

                <div className="audit-box">
                    <h2>Audit Timeline</h2>

                    {loading ? (
                        <p style={{ color: "#94a3b8" }}>Loading audit logs...</p>
                    ) : logs.length > 0 ? (
                        // Map timeline items to the report view
                        logs.map((log, index) => {
                            // Extract title and date
                            const title = log.title ?? log.event_type ?? log.name ?? "Event";
                            const time  = log.date ?? log.created_at ?? log.event_date ?? "";
                            
                            // Map status back to a color if possible
                            let color = "#6366f1"; // default purple
                            if (title.includes("Claim Submitted")) color = "#3b82f6";
                            if (title.includes("Passed") || title.includes("APPROVED")) color = "#10b981";
                            if (title.includes("Fraud") || title.includes("REJECTED")) color = "#ef4444";
                            
                            return (
                                <div className="audit-item" key={index} style={{ borderLeft: `4px solid ${color}` }}>
                                    <div>
                                        <h4 style={{ color }}>{title}</h4>
                                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                                            {log.desc ?? log.description ?? "Event recorded in system."}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>{time}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ color: "#94a3b8" }}>No audit logs available.</p>
                    )}
                </div>

                <button
                    className="download-btn"
                    onClick={generatePDF}
                    disabled={loading}
                    style={{ background: "#4f46e5", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
                >
                    {loading ? "Preparing Report..." : "Export PDF Report"}
                </button>
            </div>
        </Layout>
    );
}

export default Reports;