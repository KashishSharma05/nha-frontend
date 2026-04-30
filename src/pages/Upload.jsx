import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/upload.css";
import { createClaim, uploadClaimDocument, deleteClaim } from "../services/claimsService";

const OCR_STAGES = [
    { label: "Uploading document...",      pct: 15 },
    { label: "Running OCR extraction...", pct: 40 },
    { label: "Validating STG rules...",   pct: 60 },
    { label: "Computing compliance...",   pct: 80 },
    { label: "Finalising claim...",       pct: 95 },
];

// ── STG Procedure Registry (from NHA PDFs) ──────────────────────────────
const STG_CATEGORIES = [
    {
        category: "General Surgery",
        procedures: [
            { code: "SG039C", label: "Cholecystectomy — Laparoscopic (No CBD)", price: 22800, alos: "3 days" },
            { code: "SG039D", label: "Cholecystectomy — Laparoscopic (With CBD)", price: 22800, alos: "3 days" },
            { code: "SG039A", label: "Cholecystectomy — Open (No CBD)", price: 22800, alos: "6 days" },
            { code: "SG039B", label: "Cholecystectomy — Open (With CBD)", price: 22800, alos: "6 days" },
        ]
    },
    {
        category: "General Medicine",
        procedures: [
            { code: "MG006A", label: "Enteric Fever (Typhoid)", price: "1,800–4,500", alos: "3–5 days", tiered: true },
            { code: "MG001A", label: "Acute Febrile Illness", price: "1,800–4,500", alos: "3–5 days", tiered: true },
            { code: "MG026A", label: "Pyrexia of Unknown Origin (PUO)", price: "1,800–4,500", alos: "3–5 days", tiered: true },
            { code: "MG064A", label: "Severe Anemia", price: "1,800–4,500", alos: "3 days", tiered: true },
        ]
    },
    {
        category: "Orthopedics",
        procedures: [
            { code: "SB039A", label: "Total Knee Replacement — Primary", price: 80000, alos: "5–7 days" },
            { code: "SB039B", label: "Total Knee Replacement — Revision", price: 130000, alos: "5–7 days" },
        ]
    },
];

const WARD_TYPES = [
    { value: "general_ward",   label: "General Ward — ₹1,800" },
    { value: "hdu",            label: "HDU — ₹2,700" },
    { value: "icu",            label: "ICU (no ventilator) — ₹3,600" },
    { value: "icu_ventilator", label: "ICU (with ventilator) — ₹4,500" },
];
const WARD_PRICES = { general_ward: 1800, hdu: 2700, icu: 3600, icu_ventilator: 4500 };

// Documents by procedure group
const DOCS_BY_GROUP = {
    CHOLECYSTECTOMY: [
        { key: "has_diagnostic_report",     label: "USG upper abdomen confirming cholelithiasis" },
        { key: "has_lft_report",            label: "LFT (Liver Function Test) report" },
        { key: "has_clinical_notes",        label: "Clinical notes with indication for surgery" },
        { key: "has_operative_note",        label: "Operative / procedure note" },
        { key: "has_pre_anesthesia_report", label: "Pre-anesthesia check-up report" },
        { key: "has_post_treatment_report", label: "Intraoperative photograph + gross specimen photo" },
        { key: "has_histopathology_report", label: "Histopathology report (can submit within 7 days)" },
        { key: "has_indoor_case_papers",    label: "Indoor case papers" },
        { key: "has_discharge_summary",     label: "Discharge summary" },
    ],
    ENTERIC: [
        { key: "has_diagnostic_report",     label: "CBC, ESR, Peripheral smear, LFT reports" },
        { key: "has_clinical_notes",        label: "Clinical notes with detailed fever history" },
        { key: "has_indoor_case_papers",    label: "Indoor case papers with treatment details" },
        { key: "has_treatment_records",     label: "Post-treatment CBC, ESR, Peripheral smear, LFT reports" },
        { key: "has_post_treatment_report", label: "Post-treatment reports submitted" },
        { key: "has_discharge_summary",     label: "Detailed discharge summary with follow-up date" },
    ],
    ANEMIA: [
        { key: "has_diagnostic_report",     label: "CBC / Hb level report at admission" },
        { key: "has_clinical_notes",        label: "Clinical notes with evaluation findings" },
        { key: "has_indoor_case_papers",    label: "Indoor case papers with treatment details" },
        { key: "has_treatment_records",     label: "Blood transfusion AND/OR ferrous sulphate injection records" },
        { key: "has_post_treatment_report", label: "Post-treatment Hb report (confirming improvement)" },
        { key: "has_discharge_summary",     label: "Detailed discharge summary" },
    ],
    TKR_PRIMARY: [
        { key: "has_diagnostic_report",     label: "X-ray / CT of knee (labelled: patient ID, date, side)" },
        { key: "has_clinical_notes",        label: "Clinical notes with surgical indication" },
        { key: "has_indoor_case_papers",    label: "Indoor case papers" },
        { key: "has_operative_note",        label: "Detailed operative / procedure note" },
        { key: "has_postop_photo",          label: "Post-op clinical photograph" },
        { key: "has_post_treatment_report", label: "Post-op X-ray showing implant (labelled)" },
        { key: "has_implant_invoice",       label: "Implant invoice / barcode" },
        { key: "has_discharge_summary",     label: "Discharge summary" },
    ],
    TKR_REVISION: [
        { key: "has_diagnostic_report",     label: "X-ray / CT of knee (labelled: patient ID, date, side)" },
        { key: "has_preop_xray",            label: "Pre-op X-ray showing existing implant (Revision only)" },
        { key: "has_clinical_notes",        label: "Clinical notes with surgical indication" },
        { key: "has_indoor_case_papers",    label: "Indoor case papers" },
        { key: "has_operative_note",        label: "Detailed operative / procedure note" },
        { key: "has_postop_photo",          label: "Post-op clinical photograph" },
        { key: "has_post_treatment_report", label: "Post-op X-ray showing implant (labelled)" },
        { key: "has_implant_invoice",       label: "Implant invoice / barcode" },
        { key: "has_discharge_summary",     label: "Discharge summary" },
    ],
};

function getDocGroup(code) {
    if (code.startsWith("SG039")) return "CHOLECYSTECTOMY";
    if (["MG006A","MG001A","MG026A"].includes(code)) return "ENTERIC";
    if (code === "MG064A") return "ANEMIA";
    if (code === "SB039A") return "TKR_PRIMARY";
    if (code === "SB039B") return "TKR_REVISION";
    return null;
}

function isTiered(code) {
    return ["MG006A","MG001A","MG026A","MG064A"].includes(code);
}

function Upload() {
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const [file,        setFile]        = useState(null);
    const [isDragging,  setIsDragging]  = useState(false);
    const [processing,  setProcessing]  = useState(false);
    const [progress,    setProgress]    = useState(0);
    const [stageLabel,  setStageLabel]  = useState("");
    const [error,       setError]       = useState("");

    // Medical form state
    const [diagCode,    setDiagCode]    = useState("");
    const [patientAge,  setPatientAge]  = useState("");
    const [alos,        setAlos]        = useState("");
    const [hbLevel,     setHbLevel]     = useState("");
    const [claimedAmt,  setClaimedAmt]  = useState("");
    const [wardType,    setWardType]    = useState("general_ward");
    const [feverDays,   setFeverDays]   = useState("");
    const [prevChol,    setPrevChol]    = useState(false);
    const [docFlags,    setDocFlags]    = useState({});

    const docGroup    = getDocGroup(diagCode);
    const requiredDocs = DOCS_BY_GROUP[docGroup] || [];
    const tiered       = isTiered(diagCode);

    // Reset when procedure changes
    useEffect(() => {
        setDocFlags({});
        setPrevChol(false);
        setFeverDays("");
        if (tiered) {
            setClaimedAmt(String(WARD_PRICES[wardType]));
        } else {
            const proc = STG_CATEGORIES.flatMap(c => c.procedures).find(p => p.code === diagCode);
            if (proc && typeof proc.price === "number") setClaimedAmt(String(proc.price));
        }
    }, [diagCode]);

    useEffect(() => {
        if (tiered) setClaimedAmt(String(WARD_PRICES[wardType]));
    }, [wardType, tiered]);

    const toggleDoc = (key) => setDocFlags(f => ({ ...f, [key]: !f[key] }));

    // File validation
    const validateAndSetFile = (f) => {
        if (!f) return;
        const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(f.type)) { setError("Only PDF, JPG, or PNG files are supported"); return; }
        if (f.size > 10 * 1024 * 1024)  { setError("File size must be under 10 MB"); return; }
        setFile(f); setError("");
    };

    const handleFileChange = (e) => validateAndSetFile(e.target.files?.[0]);
    const handleDragEnter  = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave  = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    }, []);
    const handleDragOver   = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDrop       = useCallback((e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        validateAndSetFile(e.dataTransfer.files?.[0]);
    }, []);
    const removeFile = () => { setFile(null); setProgress(0); setStageLabel(""); setError(""); if (inputRef.current) inputRef.current.value = ""; };

    const progressTimeoutRef = useRef(null);
    const runProgressStages = async (ms = 3000) => {
        const d = ms / OCR_STAGES.length;
        for (const s of OCR_STAGES) { setStageLabel(s.label); setProgress(s.pct); await new Promise(r => { progressTimeoutRef.current = setTimeout(r, d); }); }
    };
    useEffect(() => () => { if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current); }, []);

    // Count checked docs
    const checkedCount = Object.values(docFlags).filter(Boolean).length;
    const totalDocs    = requiredDocs.length;

    const handleProcess = async () => {
        if (!file)     { setError("Please upload a document first"); return; }
        if (!diagCode) { setError("Please select a procedure type"); return; }

        setProcessing(true); setError(""); setProgress(0);
        let claimId = null;

        try {
            const proc = STG_CATEGORIES.flatMap(c => c.procedures).find(p => p.code === diagCode);
            const claimPayload = {
                title:          proc?.label || diagCode,
                description:    `STG ${diagCode} | Age: ${patientAge || "N/A"} | ALOS: ${alos || "N/A"}d | Ward: ${wardType}`,
                status:         "pending",
                source:         "upload",
                diagnosis_code: diagCode,
                ward_type:      wardType,
                patient_age:    patientAge ? parseInt(patientAge) : null,
                alos:           alos       ? parseInt(alos)       : null,
                hb_level:       hbLevel    ? parseFloat(hbLevel)  : null,
                claimed_amount: claimedAmt ? parseInt(claimedAmt) : null,
                fever_duration_days: feverDays ? parseInt(feverDays) : null,
                has_previous_cholecystectomy: prevChol,
                ...docFlags,
            };

            const [claimResult] = await Promise.all([createClaim(claimPayload), runProgressStages(2500)]);
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
                    <h1>Submit Claim for Verification</h1>
                    <p>Select the procedure, fill in clinical data, verify mandatory documents, and upload the claim file</p>
                </div>

                <div className="upload-box">

                    {/* ── STEP 1: Procedure Selection ── */}
                    <div className="stg-section">
                        <h3 className="stg-section-title">① Select Procedure (STG Code)</h3>
                        {STG_CATEGORIES.map(cat => (
                            <div key={cat.category} className="stg-category">
                                <h4 className="stg-category-label">{cat.category}</h4>
                                <div className="stg-grid">
                                    {cat.procedures.map(p => (
                                        <button key={p.code}
                                            className={`stg-card ${diagCode === p.code ? "selected" : ""}`}
                                            onClick={() => setDiagCode(p.code)}
                                            disabled={processing}>
                                            <span className="stg-code">{p.code}</span>
                                            <span className="stg-name">{p.label}</span>
                                            <span className="stg-meta">ALOS: {p.alos} · {typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : `₹${p.price}`}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── STEP 2: Clinical Data ── */}
                    {diagCode && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">② Clinical Data</h3>
                            <div className="clinical-grid">
                                <div className="clinical-field">
                                    <label>Patient Age (years)</label>
                                    <input type="number" min="0" max="120" value={patientAge}
                                        onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 62" disabled={processing} />
                                    {diagCode === "SB039A" && patientAge && parseInt(patientAge) <= 55 && (
                                        <span className="field-warning">⚠ Primary TKR requires age &gt; 55 for OA</span>
                                    )}
                                </div>
                                <div className="clinical-field">
                                    <label>Actual Length of Stay (days)</label>
                                    <input type="number" min="1" max="60" value={alos}
                                        onChange={e => setAlos(e.target.value)} placeholder="e.g. 5" disabled={processing} />
                                </div>

                                {diagCode === "MG064A" && (
                                    <div className="clinical-field">
                                        <label>Hemoglobin Level (g/dL)</label>
                                        <input type="number" min="0" max="20" step="0.1" value={hbLevel}
                                            onChange={e => setHbLevel(e.target.value)} placeholder="e.g. 5.2" disabled={processing} />
                                        {hbLevel && parseFloat(hbLevel) >= 7 && (
                                            <span className="field-warning">⚠ Severe Anemia requires Hb &lt; 7 g/dL</span>
                                        )}
                                    </div>
                                )}

                                {["MG006A","MG001A","MG026A"].includes(diagCode) && (
                                    <div className="clinical-field">
                                        <label>Fever Duration (days)</label>
                                        <input type="number" min="0" max="60" value={feverDays}
                                            onChange={e => setFeverDays(e.target.value)} placeholder="e.g. 5" disabled={processing} />
                                        {feverDays && parseInt(feverDays) < 2 && (
                                            <span className="field-warning">⚠ Enteric Fever requires fever ≥ 2 days</span>
                                        )}
                                    </div>
                                )}

                                {tiered && (
                                    <div className="clinical-field">
                                        <label>Ward Type</label>
                                        <select value={wardType} onChange={e => setWardType(e.target.value)} disabled={processing} className="clinical-select">
                                            {WARD_TYPES.map(w => (
                                                <option key={w.value} value={w.value}>{w.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="clinical-field">
                                    <label>Amount Claimed (₹)</label>
                                    <input type="number" min="0" value={claimedAmt}
                                        onChange={e => setClaimedAmt(e.target.value)} disabled={processing} />
                                </div>

                                {diagCode.startsWith("SG039") && (
                                    <div className="clinical-field fraud-field">
                                        <label className="fraud-checkbox">
                                            <input type="checkbox" checked={prevChol} onChange={() => setPrevChol(!prevChol)} disabled={processing} />
                                            <span>Patient has had cholecystectomy in the past</span>
                                        </label>
                                        {prevChol && <span className="field-danger">🚩 FRAUD FLAG — Cholecystectomy cannot be done twice</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Mandatory Documents ── */}
                    {diagCode && requiredDocs.length > 0 && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">
                                ③ Mandatory Documents
                                <span className="doc-counter">{checkedCount}/{totalDocs} submitted</span>
                            </h3>
                            <p className="stg-hint">Check all documents that have been submitted by the hospital</p>
                            <div className="doc-checklist">
                                {requiredDocs.map(doc => (
                                    <label key={doc.key} className={`doc-item ${docFlags[doc.key] ? "checked" : ""}`}>
                                        <input type="checkbox" checked={!!docFlags[doc.key]}
                                            onChange={() => toggleDoc(doc.key)} disabled={processing} />
                                        <span className="doc-check-icon">{docFlags[doc.key] ? "✅" : "⬜"}</span>
                                        <span>{doc.label}</span>
                                    </label>
                                ))}
                            </div>
                            {checkedCount < totalDocs && (
                                <p className="doc-warning">⚠ {totalDocs - checkedCount} mandatory document(s) not yet submitted — claim may be flagged</p>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: File Upload ── */}
                    {diagCode && (
                        <div className="stg-section">
                            <h3 className="stg-section-title">④ Upload Primary Document</h3>
                            <div className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver} onDrop={handleDrop}
                                onClick={() => !processing && inputRef.current?.click()}>
                                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFileChange} disabled={processing} />
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
                                        <p>{(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type.split("/")[1].toUpperCase()}</p>
                                    </div>
                                    <button className="remove-btn" onClick={removeFile}>✕</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Progress ── */}
                    {processing && (
                        <div className="ocr-progress">
                            <div className="ocr-header">
                                <span className="ocr-label">{stageLabel}</span>
                                <span className="ocr-pct">{progress}%</span>
                            </div>
                            <div className="progress-container">
                                <div className="progress-bar" style={{ width: `${progress}%`, transition: "width 0.5s ease" }} />
                            </div>
                        </div>
                    )}

                    {error && <p className="upload-error">{error}</p>}

                    <button className={`process-btn ${processing ? "processing" : ""}`}
                        onClick={handleProcess} disabled={processing || !file || !diagCode}>
                        {processing ? (<><span className="btn-spinner" />Processing...</>) : "⚡ Submit & Run STG Compliance Check"}
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default Upload;