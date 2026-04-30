import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/upload.css";
import { createClaim, uploadClaimDocument, deleteClaim } from "../services/claimsService";

// OCR stages shown sequentially while the backend processes the file
const OCR_STAGES = [
    { label: "Uploading document...",       pct: 15 },
    { label: "Running OCR extraction...",   pct: 40 },
    { label: "Parsing patient data...",     pct: 60 },
    { label: "Detecting risk flags...",     pct: 80 },
    { label: "Finalising claim record...",  pct: 95 },
];

function Upload() {
    const navigate  = useNavigate();
    const inputRef  = useRef(null);

    const [file, setFile]             = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress]     = useState(0);
    const [stageLabel, setStageLabel] = useState("");
    const [error, setError]           = useState("");

    // File validation
    const validateAndSetFile = (f) => {
        if (!f) return;

        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(f.type)) {
            setError("Only PDF, JPG, or PNG files are supported");
            return;
        }

        if (f.size > 10 * 1024 * 1024) {
            setError("File size must be under 10 MB");
            return;
        }

        setFile(f);
        setError("");
    };

    // Input change
    const handleFileChange = (e) => validateAndSetFile(e.target.files?.[0]);

    // Drag & Drop
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only exit drag state when leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        validateAndSetFile(dropped);
    }, []);

    const removeFile = () => {
        setFile(null);
        setProgress(0);
        setStageLabel("");
        setError("");
        if (inputRef.current) inputRef.current.value = "";
    };

    // Simulate progressive OCR stages
    const progressTimeoutRef = useRef(null);

    const runProgressStages = async (durationMs = 3000) => {
        const delay = durationMs / OCR_STAGES.length;
        for (const stage of OCR_STAGES) {
            setStageLabel(stage.label);
            setProgress(stage.pct);
            await new Promise((r) => { progressTimeoutRef.current = setTimeout(r, delay); });
        }
    };

    useEffect(() => {
        return () => {
            if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
        };
    }, []);

    // Main process handler
    const handleProcess = async () => {
        if (!file) {
            setError("Please upload a document first");
            return;
        }

        setProcessing(true);
        setError("");
        setProgress(0);

        let claimId = null;

        try {
            // Run the fake OCR progress animation in parallel with the real API call
            const [claimResult] = await Promise.all([
                // Step 1: Create claim record
                createClaim({ status: "pending", source: "upload" }),
                // Step 2: Animate OCR stages (runs concurrently)
                runProgressStages(2500),
            ]);

            claimId = claimResult?.id ?? claimResult?.claim_id;

            if (!claimId) {
                throw new Error("Failed to create claim record");
            }

            // Step 3: Upload document to the new claim
            setStageLabel("Attaching document...");
            setProgress(97);
            await uploadClaimDocument(claimId, file);

            setStageLabel("Done! Redirecting...");
            setProgress(100);

            await new Promise((r) => setTimeout(r, 500));

            navigate(`/claim-details?id=${claimId}`);
        } catch (err) {
            // If claim was created but upload failed, clean up the orphaned claim
            if (claimId) {
                try {
                    await deleteClaim(claimId);
                } catch (cleanupErr) {
                    // Silent fail on cleanup - log for debugging
                    console.error("Failed to cleanup orphaned claim:", cleanupErr);
                }
            }
            setError(err.message || "Processing failed. Please try again.");
            setProcessing(false);
            setProgress(0);
            setStageLabel("");
        }
    };

    return (
        <Layout>
            <div className="upload-page">

                {/* HEADER */}
                <div className="upload-header">
                    <h1>Upload Claim Documents</h1>
                    <p>
                        Upload prescriptions, reports, bills, and discharge summaries
                    </p>
                </div>

                {/* MAIN BOX */}
                <div className="upload-box">

                    {/* DROP ZONE */}
                    <div
                        className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => !processing && inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={handleFileChange}
                            disabled={processing}
                        />

                        {isDragging ? (
                            <>
                                <div className="upload-icon drop-anim">📂</div>
                                <h2>Release to upload</h2>
                                <p>Drop your file here</p>
                            </>
                        ) : (
                            <>
                                <div className="upload-icon">📄</div>
                                <h2>Drag &amp; Drop Files</h2>
                                <p>or <span className="browse-link">browse your computer</span></p>
                                <span>PDF · JPG · PNG &nbsp;|&nbsp; Max 10 MB</span>
                            </>
                        )}
                    </div>

                    {/* FILE PREVIEW */}
                    {file && !processing && (
                        <div className="file-preview">
                            <div className="file-icon">
                                {file.type === "application/pdf" ? "📋" : "🖼️"}
                            </div>
                            <div className="file-info">
                                <h3>{file.name}</h3>
                                <p>{(file.size / (1024 * 1024)).toFixed(2)} MB &nbsp;·&nbsp; {file.type.split("/")[1].toUpperCase()}</p>
                            </div>
                            <button className="remove-btn" onClick={removeFile}>✕</button>
                        </div>
                    )}

                    {/* OCR PROGRESS */}
                    {processing && (
                        <div className="ocr-progress">
                            <div className="ocr-header">
                                <span className="ocr-label">{stageLabel}</span>
                                <span className="ocr-pct">{progress}%</span>
                            </div>
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress}%`, transition: "width 0.5s ease" }}
                                />
                            </div>
                            <div className="ocr-steps">
                                {OCR_STAGES.map((s, i) => (
                                    <div
                                        key={i}
                                        className={`ocr-step ${progress >= s.pct ? "done" : progress >= (OCR_STAGES[i - 1]?.pct ?? 0) ? "active" : ""}`}
                                    >
                                        <div className="ocr-dot" />
                                        <span>{s.label.replace("...", "")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="upload-error">{error}</p>
                    )}

                    {/* ACTION BUTTON */}
                    <button
                        className={`process-btn ${processing ? "processing" : ""}`}
                        onClick={handleProcess}
                        disabled={processing || !file}
                    >
                        {processing ? (
                            <>
                                <span className="btn-spinner" />
                                Processing...
                            </>
                        ) : (
                            "⚡ Start OCR Processing"
                        )}
                    </button>

                </div>

            </div>
        </Layout>
    );
}

export default Upload;