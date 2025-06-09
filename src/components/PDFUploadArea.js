import { useState } from "react";
import "./PDFUploadArea.css";
import { extractTextFromPDF, parseInvoiceData } from "../utils/dataUtils";

const PDFUploadArea = ({
  pdfFile,
  setPdfFile,
  setValues,
  setFormTouched,
  setHasUnsavedChanges,
  setSuccessMessage,
  setShowSuccess,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const normalizeVendorName = (rawName) => {
    const vendors = {
      "ACME CORPORATION": "Acme Corporation",
      "TECH SOLUTIONS INC": "Tech Solutions Inc",
      "GLOBAL SERVICES LTD": "Global Services Ltd",
    };
    return vendors[rawName.toUpperCase()] || "";
  };

  const handleFileChange = async (file) => {
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setError("");

        try {
          const text = await extractTextFromPDF(file);
          const parsedData = parseInvoiceData(text);

          //  Auto-fill the form fields using parsed data
          setValues((prev) => ({
            ...prev,
            vendorName: normalizeVendorName(parsedData.vendorName) || "",
            invoiceNumber: parsedData.invoiceNumber || "",
            invoiceDate: parsedData.date || "",
            totalAmount: parsedData.totalAmount || "",
          }));

          setFormTouched(true);
          setHasUnsavedChanges?.(true);
          setSuccessMessage("PDF data extracted and form populated!");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
          console.error("Error extracting PDF:", err);
          setError("Failed to extract data from PDF.");
        }
      } else {
        setError("Please select a valid PDF file.");
        setPdfFile(null);
      }
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    handleFileChange(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="pdf-upload-area">
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""} ${
          pdfFile ? "has-file" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-content">
          <div className="upload-icon">
            <div className="icon-circle">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>
          </div>

          <div className="upload-text">
            <h3>Upload Your Invoice</h3>
            <p>To auto-populate fields, just save some time</p>
          </div>

          <div className="upload-actions">
            <input
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="file-input"
              id="pdf-file-input"
            />
            <label htmlFor="pdf-file-input" className="upload-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Upload File
            </label>
          </div>

          <div className="upload-hint">
            <p>Click to upload or Drag and drop</p>
          </div>
        </div>

        {pdfFile && (
          <div className="file-info">
            <div className="file-details">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span className="file-name">{pdfFile.name}</span>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="remove-file"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default PDFUploadArea;
