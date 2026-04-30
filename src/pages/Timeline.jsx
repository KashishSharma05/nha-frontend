import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/timeline.css";
import { getClaimTimeline } from "../services/claimsService";

function Timeline() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const claimId = searchParams.get("id");

    const [events, setEvents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");

    useEffect(() => {
        if (!claimId) {
            setError("No claim ID provided. Redirecting to dashboard...");
            setLoading(false);
            const timer = setTimeout(() => navigate("/dashboard"), 2000);
            return () => clearTimeout(timer);
        }

        getClaimTimeline(claimId)
            .then((data) => {
                // Backend may return array directly or wrapped in a key
                const list = Array.isArray(data)
                    ? data
                    : data.timeline ?? data.events ?? data.results ?? [];
                setEvents(list);
            })
            .catch((err) => setError(err.message || "Failed to load timeline."))
            .finally(() => setLoading(false));
    }, [claimId]);

    const nextPath = claimId ? `/compliance?id=${claimId}` : "/compliance";

    return (
        <Layout>
            <div className="timeline-page">

                <div className="timeline-header">
                    <h1>Treatment Timeline</h1>
                    <p>
                        Complete patient treatment journey
                    </p>
                </div>

                {error && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>}

                {loading ? (
                    <p style={{ color: "#94a3b8", padding: "2rem" }}>Loading timeline...</p>
                ) : events.length > 0 ? (
                    <div className="timeline-wrapper">
                        {events.map((item, index) => (
                            <div className="timeline-item" key={item.id ?? index}>
                                <div className={`timeline-dot ${item.status ?? "pending"}`}></div>

                                <div className="timeline-card">
                                    <span>{item.date ?? item.event_date ?? "—"}</span>
                                    <h3>{item.title ?? item.event_type ?? item.name ?? "Event"}</h3>
                                    <p>{item.desc ?? item.description ?? item.detail ?? ""}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#94a3b8", padding: "2rem" }}>
                        No timeline events found.{" "}
                        {!claimId && "Upload a claim first to generate a timeline."}
                    </p>
                )}

                <button
                    className="timeline-btn"
                    onClick={() => navigate(nextPath)}
                >
                    Continue to Compliance →
                </button>

            </div>
        </Layout>
    );
}

export default Timeline;