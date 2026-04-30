import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/timeline.css";

function Timeline() {
    const navigate = useNavigate();

    const events = [
        {
            date: "12 May 2024",
            title: "Admission",
            desc: "Patient admitted with high fever and weakness",
            status: "completed",
        },
        {
            date: "13 May 2024",
            title: "Diagnosis",
            desc: "Typhoid fever confirmed after tests",
            status: "completed",
        },
        {
            date: "14 May 2024",
            title: "Treatment Started",
            desc: "IV fluids and antibiotics started",
            status: "active",
        },
        {
            date: "18 May 2024",
            title: "Recovery",
            desc: "Patient condition stabilized",
            status: "pending",
        },
        {
            date: "19 May 2024",
            title: "Discharge",
            desc: "Successfully discharged",
            status: "pending",
        },
    ];

    return (
        <Layout>
            <div className="timeline-page">

                <div className="timeline-header">
                    <h1>Treatment Timeline</h1>
                    <p>
                        Complete patient treatment journey
                    </p>
                </div>

                <div className="timeline-wrapper">
                    {events.map((item, index) => (
                        <div
                            className="timeline-item"
                            key={index}
                        >
                            <div
                                className={`timeline-dot ${item.status}`}
                            ></div>

                            <div className="timeline-card">
                                <span>{item.date}</span>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="timeline-btn"
                    onClick={() => navigate("/compliance")}
                >
                    Continue to Compliance →
                </button>

            </div>
        </Layout>
    );
}

export default Timeline;