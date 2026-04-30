import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/claimDetails.css";

function ClaimDetails() {
    const navigate = useNavigate();

    const patientData = {
        name: "Ramesh Kumar",
        age: "45",
        gender: "Male",
        patientId: "P123456",
        hospital: "City Care Hospital",
        admission: "12 May 2024",
    };

    const diagnosis = [
        "Typhoid Fever",
        "High Fever",
        "Weakness",
    ];

    const treatment = [
        "IV Fluids",
        "Antibiotics",
        "Blood Test",
        "X-Ray",
    ];

    const costs = [
        {
            item: "Room Charges",
            amount: "₹15,000",
        },
        {
            item: "Medicines",
            amount: "₹8,500",
        },
        {
            item: "Lab Tests",
            amount: "₹12,000",
        },
        {
            item: "Doctor Fees",
            amount: "₹6,500",
        },
    ];

    const riskFlags = [
        "Duplicate Lab Test",
        "Extra Medicine Entry",
    ];

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
                        <h2>94%</h2>
                    </div>
                </div>

                <div className="claim-grid">

                    {/* Patient Info */}
                    <div className="claim-card">
                        <h2>Patient Details</h2>

                        {Object.entries(patientData).map(
                            ([key, value], index) => (
                                <div className="row" key={index}>
                                    <span>{key}</span>
                                    <strong>{value}</strong>
                                </div>
                            )
                        )}
                    </div>

                    {/* Diagnosis */}
                    <div className="claim-card">
                        <h2>Diagnosis</h2>

                        {diagnosis.map((item, index) => (
                            <div className="tag red" key={index}>
                                {item}
                            </div>
                        ))}
                    </div>

                    {/* Treatment */}
                    <div className="claim-card">
                        <h2>Treatment Plan</h2>

                        {treatment.map((item, index) => (
                            <div className="tag green" key={index}>
                                {item}
                            </div>
                        ))}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="claim-card">
                        <h2>Cost Breakdown</h2>

                        {costs.map((item, index) => (
                            <div className="row" key={index}>
                                <span>{item.item}</span>
                                <strong>{item.amount}</strong>
                            </div>
                        ))}

                        <div className="total-box">
                            Total Claim: ₹42,000
                        </div>
                    </div>

                    {/* Risk Flags */}
                    <div className="claim-card full-width">
                        <h2>Risk Flags</h2>

                        <div className="flags">
                            {riskFlags.map((item, index) => (
                                <div className="flag" key={index}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <button
                    className="next-btn"
                    onClick={() => navigate("/timeline")}
                >
                    Continue to Timeline →
                </button>

            </div>
        </Layout>
    );
}

export default ClaimDetails;