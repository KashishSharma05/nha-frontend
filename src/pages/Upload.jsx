import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/upload.css";

function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        if (selectedFile.size > 10 * 1024 * 1024) {
            alert("File size should be less than 10MB");
            return;
        }

        setFile(selectedFile);
        setProgress(100);
    };

    const removeFile = () => {
        setFile(null);
        setProgress(0);
    };

    const handleProcess = () => {
        if (!file) {
            alert("Please upload a file first");
            return;
        }

        navigate("/claim-details");
    };

    return (
        <Layout>
            <div className="upload-page">

                {/* HEADER */}
                <div className="upload-header">
                    <h1>Upload Claim Documents</h1>
                    <p>
                        Upload prescriptions, reports,
                        bills, and discharge summaries
                    </p>
                </div>

                {/* MAIN BOX */}
                <div className="upload-box">

                    {/* DROP ZONE */}
                    <label className="drop-zone">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={handleFileChange}
                        />

                        <div className="upload-icon">
                            📄
                        </div>

                        <h2>Drag & Drop Files</h2>

                        <p>
                            PDF / JPG / PNG Supported
                        </p>

                        <span>
                            Max File Size: 10MB
                        </span>
                    </label>

                    {/* FILE PREVIEW */}
                    {file && (
                        <>
                            <div className="file-preview">
                                <div>
                                    <h3>{file.name}</h3>
                                    <p>
                                        {(
                                            file.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={removeFile}
                                >
                                    Remove
                                </button>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                ></div>
                            </div>
                        </>
                    )}

                    {/* OCR BUTTON */}
                    <button
                        className="process-btn"
                        onClick={handleProcess}
                    >
                        Start OCR Processing
                    </button>

                </div>

            </div>
        </Layout>
    );
}

export default Upload;