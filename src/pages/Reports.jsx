import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/reports.css";
import jsPDF from "jspdf";
import { getClaimReport, getClaimHistory } from "../services/reportsService";

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
                const [reportData, historyData] = await Promise.allSettled([
                    claimId ? getClaimReport(claimId) : Promise.resolve(null),
                    getClaimHistory(),
                ]);

                if (reportData.status === "fulfilled" && reportData.value) {
                    setReport(reportData.value);
                }

                if (historyData.status === "fulfilled" && historyData.value) {
                    const histList = Array.isArray(historyData.value)
                        ? historyData.value
                        : historyData.value.results ?? historyData.value.history ?? [];
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

    // Normalize report fields
    const claimIdDisplay    = report?.claim_id      ?? report?.claimId      ?? claimId ?? "—";
    const payableAmount     = report?.payable_amount ?? report?.payableAmount ?? "—";
    const complianceScore   = report?.compliance_score ?? report?.complianceScore ?? "—";
    const generatedOn       = report?.generated_on  ?? report?.generatedOn  ?? new Date().toLocaleDateString("en-IN");
    const statusDisplay     = report?.verdict       ?? report?.status       ?? "—";

    const [pdfError, setPdfError] = useState("");

    const generatePDF = () => {
        try {
            setPdfError("");
            const doc = new jsPDF();

            doc.setFontSize(22);
            doc.text("Claim Verification Report", 20, 20);

            doc.setFontSize(14);
            doc.text(`Claim ID: ${claimIdDisplay}`, 20, 45);
            doc.text(`Status: ${statusDisplay}`, 20, 60);
            doc.text(`Payable Amount: ${payableAmount}`, 20, 75);
            doc.text(`Compliance Score: ${complianceScore}${typeof complianceScore === "number" ? "%" : ""}`, 20, 90);
            doc.text(`Generated On: ${generatedOn}`, 20, 105);

            doc.setFontSize(18);
            doc.text("Audit / History Logs", 20, 130);

            let y = 150;

            logs.slice(0, 10).forEach((log) => {
                const title = log.title ?? log.action ?? log.event ?? log.message ?? "Event";
                const time  = log.time  ?? log.timestamp ?? log.created_at ?? "";
                doc.setFontSize(12);
                doc.text(`• ${title}${time ? ` (${time})` : ""}`, 25, y);
                y += 12;
            });

            doc.save(`claim-report-${claimIdDisplay}.pdf`);
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
                        <p>
                            Generated AI decision
                            and audit analysis
                        </p>
                    </div>

                    <div className="status-badge">
                        {loading ? "Loading..." : statusDisplay}
                    </div>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}
                {pdfError && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{pdfError}</p>}

                <div className="report-cards">

                    <div className="report-card">
                        <h4>Claim ID</h4>
                        <h2>{loading ? "…" : claimIdDisplay}</h2>
                    </div>

                    <div className="report-card">
                        <h4>Payable Amount</h4>
                        <h2>{loading ? "…" : payableAmount}</h2>
                    </div>

                    <div className="report-card">
                        <h4>Compliance Score</h4>
                        <h2>{loading ? "…" : `${complianceScore}${typeof complianceScore === "number" ? "%" : ""}`}</h2>
                    </div>

                    <div className="report-card">
                        <h4>Generated On</h4>
                        <h2>{loading ? "…" : generatedOn}</h2>
                    </div>

                </div>

                <div className="audit-box">
                    <h2>Audit Timeline</h2>

                    {loading ? (
                        <p style={{ color: "#94a3b8" }}>Loading audit logs...</p>
                    ) : logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div className="audit-item" key={index}>
                                <div>
                                    <h4>{log.title ?? log.action ?? log.event ?? log.message ?? "Event"}</h4>
                                </div>

                                <span>{log.time ?? log.timestamp ?? log.created_at ?? ""}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#94a3b8" }}>No audit logs available.</p>
                    )}
                </div>

                <button
                    className="download-btn"
                    onClick={generatePDF}
                    disabled={loading}
                >
                    {loading ? "Preparing Report..." : "Export PDF Report"}
                </button>

            </div>
        </Layout>
    );
}

export default Reports;