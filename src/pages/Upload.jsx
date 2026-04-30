import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/upload.css";
import { createClaim, uploadClaimDocument, deleteClaim } from "../services/claimsService";

const OCR_STAGES = [
    { label: "Uploading document...",      pct: 15 },
    { label: "Running OCR extraction...", pct: 40 },
    { label: "Parsing patient data...",   pct: 60 },
    { label: "Detecting risk flags...",   pct: 80 },
    { label: "Finalising claim record...", pct: 95 },
];

const STG_PROCEDURES = [
    { code: "SG039C", label: "Cholecystectomy (Gallbladder Removal)", price: 22000 },
    { code: "MG006A", label: "Enteric Fever (Typhoid)",               price: 4000  },
    { code: "MG064A", label: "Severe Anemia",                         price: 4000  },
    { code: "SB039A", label: "Total Knee Replacement — Primary",      price: 80000 },
    { code: "SB039B", label: "Total Knee Replacement — Revision",     price: 130000},
];

// Documents required per procedure
const DOCS_BY_PROCEDURE = {
    SG039C: [
        { key: "has_diagnostic_report",    label: "Ultrasound report confirming cholelithiasis" },
        { key: "has_clinical_notes",       label: "Clinical notes with indication for surgery" },
        { key: "has_indoor_case_papers",   label: "Indoor case papers" },
        { key: "has_operative_note",       label: "Operative note (Laparoscopic / Open)" },
        { key: "has_histopathology_report",label: "Histopathology report of gallbladder specimen" },
        { key: "has_discharge_summary",    label: "Discharge summary" },
    ],
    MG006A: [
        { key: "has_diagnostic_report",    label: "Widal test OR Blood culture report (Salmonella)" },
        { key: "has_cbc_report",           label: "CBC (Complete Blood Count) report" },
        { key: "has_clinical_notes",       label: "Clinical notes with fever history (≥7 days)" },
        { key: "has_indoor_case_papers",   label: "Indoor case papers" },
        { key: "has_treatment_records",    label: "Antibiotic therapy records (Ceftriaxone / Azithromycin)" },
        { key: "has_discharge_summary",    label: "Discharge summary" },
    ],
    MG064A: [
        { key: "has_diagnostic_report",    label: "CBC / Hb level report at admission" },
        { key: "has_clinical_notes",       label: "Clinical notes with evaluation findings" },
        { key: "has_indoor_case_papers",   label: "Indoor case papers" },
        { key: "has_treatment_records",    label: "Blood transfusion AND/OR ferrous sulphate injection records" },
        { key: "has_post_treatment_report",label: "Post-treatment Hb report (confirming improvement)" },
        { key: "has_discharge_summary",    label: "Discharge summary" },
    ],
    SB039A: [
        { key: "has_diagnostic_report",    label: "X-ray / CT of knee (labelled with patient ID, date, side)" },
        { key: "has_clinical_notes",       label: "Clinical notes with surgical indication" },
        { key: "has_indoor_case_papers",   label: "Indoor case papers" },
        { key: "has_operative_note",       label: "Detailed operative note" },
        { key: "has_post_treatment_report",label: "Post-op X-ray showing implant (labelled)" },
        { key: "has_implant_invoice",      label: "Implant invoice / barcode" },
        { key: "has_discharge_summary",    label: "Discharge summary" },
    ],
    SB039B: [
        { key: "has_diagnostic_report",    label: "X-ray / CT of knee (labelled with patient ID, date, side)" },
        { key: "has_preop_xray",           label: "Pre-op X-ray showing existing implant (Revision only)" },
        { key: "has_clinical_notes",       label: "Clinical notes with surgical indication" },
        { key: "has_indoor_case_papers",   label: "Indoor case papers" },
        { key: "has_operative_note",       label: "Detailed operative note" },
        { key: "has_post_treatment_report",label: "Post-op X-ray showing implant (labelled)" },
        { key: "has_implant_invoice",      label: "Implant invoice / barcode" },
        { key: "has_discharge_summary",    label: "Discharge summary" },
    ],
};

function Upload() {
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const [file,        setFile]        = useState(null);
    const [isDragging,  setIsDragging]  = useState(false);
    const [processing,  setProcessing]  = useState(false);
    const [progress,    setProgress]    = useState(0);
    const [stageLabel,  setStageLabel]  = useState("");
    const [error,       setError]       = useState("");

    // STG Medical form
    const [diagCode,    setDiagCode]    = useState("");
    const [patientAge,  setPatientAge]  = useState("");
    const [alos,        setAlos]        = useState("");
    const [hbLevel,     setHbLevel]     = useState("");
    const [claimedAmt,  setClaimedAmt]  = useState("");
    const [docFlags,    setDocFlags]    = useState({});

    const selectedProc  = STG_PROCEDURES.find(p => p.code === diagCode);
    const requiredDocs  = DOCS_BY_PROCEDURE[diagCode] || [];

    // Reset doc flags when procedure changes
    useEffect(() => {
        setDocFlags({});
        const proc = STG_PROCEDURES.find(p => p.code === diagCode);
        if (proc) setClaimedAmt(String(proc.price));
    }, [diagCode]);

    const toggleDoc = (key) =>
        setDocFlags(f => ({ ...f, [key]: !f[key] }));

    // File validation
    const validateAndSetFile = (f) => {
        if (!f) return;
        const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(f.type)) { setError("Only PDF, JPG, or PNG files are supported"); return; }
        if (f.size > 10 * 1024 * 1024)  { setError("File size must be under 10 MB"); return; }
        setFile(f); setError("");
    };

    const handleFileChange = (e) => validateAndSetFile(e.target.files?.[0]);

    const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    }, []);
    const handleDragOver  = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDrop      = useCallback((e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        validateAndSetFile(e.dataTransfer.files?.[0]);
    }, []);

    const removeFile = () => {
        setFile(null); setProgress(0); setStageLabel(""); setError("");
        if (inputRef.current) inputRef.current.value = "";
    };

    const progressTimeoutRef = useRef(null);
    const runProgressStages = async (durationMs = 3000) => {
        const delay = durationMs / OCR_STAGES.length;
        for (const stage of OCR_STAGES) {
            setStageLabel(stage.label); setProgress(stage.pct);
            await new Promise(r => { progressTimeoutRef.current = setTimeout(r, delay); });
        }
    };
    useEffect(() => () => { if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current); }, []);

    const handleProcess = async () => {
        if (!file)     { setError("Please upload a document first"); return; }
        if (!diagCode) { setError("Please select a procedure type"); return; }

        setProcessing(true); setError(""); setProgress(0);
        let claimId = null;

        try {
            const claimPayload = {
                title:          selectedProc?.label || diagCode,
                description:    `STG Code: ${diagCode} | Patient Age: ${patientAge || "N/A"} | ALOS: ${alos || "N/A"} days`,
                status:         "pending",
                source:         "upload",
                diagnosis_code: diagCode,
                patient_age:    patientAge ? parseInt(patientAge) : null,
                alos:           alos       ? parseInt(alos)       : null,
                hb_level:       hbLevel    ? parseFloat(hbLevel)  : null,
                claimed_amount: claimedAmt ? parseInt(claimedAmt) : null,
                ...docFlags,
            };

            const [claimResult] = await Promise.all([
                createClaim(claimPayload),
                runProgressStages(2500),
            ]);

            claimId = claimResult?.id ?? claimResult?.claim_id;
            if (!claimId) throw new Error("Failed to create claim record");

            setStageLabel("Attaching document..."); setProgress(97);
            await uploadClaimDocument(claimId, file);

            setStageLabel("Done! Redirecting..."); setProgress(100);
            await new Promise(r => setTimeout(r, 500));
            navigate(`/claim-details?id=${claimId}`);

        } catch (err) {
            if (claimId) { try { await deleteClaim(claimId); } catch {} }
            setError(err.message || "Processing failed. Please try again.");
            setProcessing(false); setProgress(0); setStageLabel("");
        }
    };

    return (
        <Layout>
            <div className="upload-page">

                <div className="upload-header">
                    <h1>Upload Claim Documents</h1>
                    <p>Upload the claim document and fill in the STG compliance data for AI verification</p>
                </div>

                <div className="upload-box">

                    {/* ── STEP 1: Procedure Selection ── */}
                    <div className="stg-section">
                        <h3 className="stg-section-title">① Select Procedure (STG Code)</h3>
                        <div className="stg-grid">
                            {STG_PROCEDURES.map(p => (
                                <button
                                    key={p.code}
                                    className={`stg-card ${diagCode === p.code ? "selected" : ""}`}
                                    onClick={() => setDiagCode(p.code)}
                                    disabled={processing}
                                >
                                    <span className="stg-code">{p.code}</span>
                                    <span className="stg-name">{p.label}</span>
                                    <span className="stg-price">₹{p.price.toLocaleString("en-IN")}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── STEP 2: Clinical Data ── */}
                    {diagCode && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">② Clinical Data</h3>
                            <div className="clinical-grid">
                                <div className="clinical-field">
                                    <label>Patient Age (years)</label>
                                    <input type="number" min="1" max="120"
                                        value={patientAge}
                                        onChange={e => setPatientAge(e.target.value)}
                                        placeholder="e.g. 62"
                                        disabled={processing}
                                    />
                                </div>
                                <div className="clinical-field">
                                    <label>Actual Length of Stay — ALOS (days)</label>
                                    <input type="number" min="1" max="60"
                                        value={alos}
                                        onChange={e => setAlos(e.target.value)}
                                        placeholder="e.g. 5"
                                        disabled={processing}
                                    />
                                </div>
                                {diagCode === "MG064A" && (
                                    <div className="clinical-field">
                                        <label>Hemoglobin Level at Admission (g/dL)</label>
                                        <input type="number" min="0" max="20" step="0.1"
                                            value={hbLevel}
                                            onChange={e => setHbLevel(e.target.value)}
                                            placeholder="e.g. 5.2"
                                            disabled={processing}
                                        />
                                        {hbLevel && parseFloat(hbLevel) >= 7 && (
                                            <span className="field-warning">⚠ Hb ≥ 7 g/dL — Severe Anemia requires Hb &lt; 7</span>
                                        )}
                                    </div>
                                )}
                                <div className="clinical-field">
                                    <label>Amount Claimed by Hospital (₹)</label>
                                    <input type="number" min="0"
                                        value={claimedAmt}
                                        onChange={e => setClaimedAmt(e.target.value)}
                                        placeholder={`Package price: ₹${selectedProc?.price?.toLocaleString("en-IN")}`}
                                        disabled={processing}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Mandatory Documents ── */}
                    {diagCode && requiredDocs.length > 0 && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">③ Mandatory Documents Submitted?</h3>
                            <p className="stg-hint">Check all documents that have been submitted by the hospital</p>
                            <div className="doc-checklist">
                                {requiredDocs.map(doc => (
                                    <label key={doc.key} className={`doc-item ${docFlags[doc.key] ? "checked" : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={!!docFlags[doc.key]}
                                            onChange={() => toggleDoc(doc.key)}
                                            disabled={processing}
                                        />
                                        <span className="doc-check-icon">{docFlags[doc.key] ? "✅" : "⬜"}</span>
                                        <span>{doc.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Document Upload ── */}
                    {diagCode && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">④ Upload Primary Document</h3>
                            <div
                                className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => !processing && inputRef.current?.click()}
                            >
                                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    hidden onChange={handleFileChange} disabled={processing} />
                                {isDragging ? (
                                    <><div className="upload-icon drop-anim">📂</div><h2>Release to upload</h2></>
                                ) : (
                                    <><div className="upload-icon">📄</div>
                                    <h2>Drag &amp; Drop Files</h2>
                                    <p>or <span className="browse-link">browse your computer</span></p>
                                    <span>PDF · JPG · PNG &nbsp;|&nbsp; Max 10 MB</span></>
                                )}
                            </div>

                            {file && !processing && (
                                <div className="file-preview">
                                    <div className="file-icon">{file.type === "application/pdf" ? "📋" : "🖼️"}</div>
                                    <div className="file-info">
                                        <h3>{file.name}</h3>
                                        <p>{(file.size / (1024 * 1024)).toFixed(2)} MB &nbsp;·&nbsp; {file.type.split("/")[1].toUpperCase()}</p>
                                    </div>
                                    <button className="remove-btn" onClick={removeFile}>✕</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── OCR PROGRESS ── */}
                    {processing && (
                        <div className="ocr-progress">
                            <div className="ocr-header">
                                <span className="ocr-label">{stageLabel}</span>
                                <span className="ocr-pct">{progress}%</span>
                            </div>
                            <div className="progress-container">
                                <div className="progress-bar" style={{ width: `${progress}%`, transition: "width 0.5s ease" }} />
                            </div>
                            <div className="ocr-steps">
                                {OCR_STAGES.map((s, i) => (
                                    <div key={i} className={`ocr-step ${progress >= s.pct ? "done" : progress >= (OCR_STAGES[i - 1]?.pct ?? 0) ? "active" : ""}`}>
                                        <div className="ocr-dot" /><span>{s.label.replace("...", "")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="upload-error">{error}</p>}

                    <button
                        className={`process-btn ${processing ? "processing" : ""}`}
                        onClick={handleProcess}
                        disabled={processing || !file || !diagCode}
                    >
                        {processing ? (
                            <><span className="btn-spinner" />Processing...</>
                        ) : "⚡ Submit & Run STG Compliance Check"}
                    </button>

                </div>
            </div>
        </Layout>
    );
}

export default Upload;