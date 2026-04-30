import Layout from "../components/Layout";
import "../styles/reports.css";
import jsPDF from "jspdf";

function Reports() {
    const logs = [
        {
            title: "OCR extraction completed",
            time: "09:20 AM",
        },
        {
            title: "Patient data verified",
            time: "09:22 AM",
        },
        {
            title: "Timeline generated",
            time: "09:24 AM",
        },
        {
            title: "STG compliance checked",
            time: "09:26 AM",
        },
        {
            title: "Decision engine executed",
            time: "09:28 AM",
        },
    ];

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Claim Verification Report", 20, 20);

        doc.setFontSize(14);
        doc.text("Claim ID: CLM-2026-1028", 20, 45);
        doc.text("Status: Conditional Approval", 20, 60);
        doc.text("Payable Amount: ₹32,000", 20, 75);
        doc.text("Compliance Score: 82%", 20, 90);

        doc.setFontSize(18);
        doc.text("Audit Logs", 20, 120);

        let y = 140;

        logs.forEach((log) => {
            doc.text(
                `• ${log.title} (${log.time})`,
                25,
                y
            );
            y += 15;
        });

        doc.save("claim-report.pdf");
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
                        Conditional Approval
                    </div>
                </div>

                <div className="report-cards">

                    <div className="report-card">
                        <h4>Claim ID</h4>
                        <h2>CLM-2026-1028</h2>
                    </div>

                    <div className="report-card">
                        <h4>Payable Amount</h4>
                        <h2>₹32,000</h2>
                    </div>

                    <div className="report-card">
                        <h4>Compliance Score</h4>
                        <h2>82%</h2>
                    </div>

                    <div className="report-card">
                        <h4>Generated On</h4>
                        <h2>29 Apr 2026</h2>
                    </div>

                </div>

                <div className="audit-box">
                    <h2>Audit Timeline</h2>

                    {logs.map((log, index) => (
                        <div
                            className="audit-item"
                            key={index}
                        >
                            <div>
                                <h4>{log.title}</h4>
                            </div>

                            <span>{log.time}</span>
                        </div>
                    ))}
                </div>

                <button
                    className="download-btn"
                    onClick={generatePDF}
                >
                    Export PDF Report
                </button>

            </div>
        </Layout>
    );
}

export default Reports;