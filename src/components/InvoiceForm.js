import { useState, useRef, useEffect, useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import PDFUploadArea from "./PDFUploadArea";
import VendorDetailsSection from "./VendorDetailsSection";
import InvoiceDetailsSection from "./InvoiceDetailsSection";
import CommentsSection from "./CommentsSection";
import {
  saveFormData,
  getFormData,
  saveSubmittedForm,
  autoSaveFormData,
  getAutoSavedFormData,
  clearAutoSaveFormData,
  getDummyData,
  savePDFFile,
  getUserStats,
  getMostRecentSubmission,
} from "../utils/dataUtils";
import "./InvoiceForm.css";

// Form validation schema
const InvoiceSchema = Yup.object().shape({
  vendorName: Yup.string()
    .required("Vendor name is required")
    .min(2, "Vendor name must be at least 2 characters"),
  purchaseOrderNumber: Yup.string()
    .required("Purchase order number is required")
    .matches(
      /^[A-Za-z0-9-]+$/,
      "Only alphanumeric characters and hyphens are allowed"
    )
    .min(3, "Purchase order number must be at least 3 characters"),
  invoiceNumber: Yup.string()
    .required("Invoice number is required")
    .matches(
      /^[A-Za-z0-9-]+$/,
      "Only alphanumeric characters and hyphens are allowed"
    )
    .min(3, "Invoice number must be at least 3 characters"),
  invoiceDate: Yup.date()
    .required("Invoice date is required")
    .max(new Date(), "Invoice date cannot be in the future"),
  totalAmount: Yup.number()
    .required("Total amount is required")
    .positive("Amount must be positive")
    .typeError("Amount must be a number"),
  paymentTerms: Yup.string().required("Payment terms are required"),
  dueDate: Yup.date()
    .required("Due date is required")
    .min(
      Yup.ref("invoiceDate"),
      "Due date cannot be earlier than invoice date"
    ),
  glPostDate: Yup.date().nullable(),
  description: Yup.string()
    .required("Invoice description is required")
    .min(10, "Description must be at least 10 characters"),
  expenses: Yup.array().of(
    Yup.object().shape({
      lineAmount: Yup.number()
        .required("Line amount is required")
        .positive("Line amount must be positive")
        .typeError("Amount must be a number"),
      department: Yup.string().required("Department is required"),
      account: Yup.string().required("Account is required"),
      location: Yup.string().required("Location is required"),
      description: Yup.string()
        .required("Expense description is required")
        .min(5, "Description must be at least 5 characters"),
    })
  ),
  comments: Yup.string(),
});

const InvoiceForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("vendor");
  const [pdfFile, setPdfFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);
  const [userStats, setUserStats] = useState(null);

  // Refs for scrolling to sections
  const vendorSectionRef = useRef(null);
  const invoiceSectionRef = useRef(null);
  const commentsSectionRef = useRef(null);
  const formContainerRef = useRef(null);

  // Get username for storage operations
  const username = user?.username;

  // Get empty form data structure
  const getEmptyFormData = () => ({
    vendorName: "",
    purchaseOrderNumber: "",
    invoiceNumber: "",
    invoiceDate: "",
    totalAmount: "",
    paymentTerms: "",
    dueDate: "",
    glPostDate: "",
    description: "",
    expenses: [
      {
        lineAmount: "",
        department: "",
        account: "",
        location: "",
        description: "",
      },
    ],
    comments: "",
  });

  // Load initial form data based on priority: autosave > draft > recent submission > empty
  const getInitialFormData = useCallback(() => {
    if (!username) return getEmptyFormData();

    const autoSavedData = getAutoSavedFormData(username);
    const savedData = getFormData(username);

    if (autoSavedData) {
      setHasUnsavedChanges(true);
      return autoSavedData;
    }

    if (savedData) {
      return savedData;
    }

    const mostRecentSubmission = getMostRecentSubmission(username);

    if (mostRecentSubmission) {
      if (mostRecentSubmission.pdfFile) {
        const dummyFile = new File([""], mostRecentSubmission.pdfFile.name, {
          type: mostRecentSubmission.pdfFile.type,
        });
        setPdfFile(dummyFile);
      }

      return mostRecentSubmission.data;
    }

    return getEmptyFormData();
  }, [username]);

  const [formValues, setFormValues] = useState(getEmptyFormData);

  // Load user-specific data on component mount and user change
  useEffect(() => {
    if (username) {
      const initialData = getInitialFormData();
      setFormValues(initialData);

      // Load user statistics
      const stats = getUserStats(username);
      setUserStats(stats);

      // Show welcome message if loading from previous submission
      const autoSavedData = getAutoSavedFormData(username);
      const savedData = getFormData(username);

      if (!autoSavedData && !savedData) {
        const mostRecentSubmission = getMostRecentSubmission(username);
        if (mostRecentSubmission) {
          setSuccessMessage(
            `Welcome back! Form loaded with your most recent submission from ${new Date(
              mostRecentSubmission.submittedAt
            ).toLocaleDateString()}.`
          );
          setShowSuccess(true);

          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);
        }
      }
    } else {
      setFormValues(getEmptyFormData());
      setUserStats(null);
      setPdfFile(null);
    }
  }, [username, getInitialFormData]);

  // Set minimum height for the form container
  useEffect(() => {
    const setMinHeight = () => {
      if (formContainerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight =
          document.querySelector(".app-header")?.offsetHeight || 0;
        formContainerRef.current.style.minHeight = `${
          windowHeight - headerHeight - 40
        }px`;
      }
    };

    setMinHeight();
    window.addEventListener("resize", setMinHeight);

    return () => {
      window.removeEventListener("resize", setMinHeight);
    };
  }, []);

  // Auto-save functionality
  const handleAutoSave = useCallback(
    (values) => {
      if (formTouched && username) {
        autoSaveFormData(values, username);
        setAutoSaveIndicator(true);
        setHasUnsavedChanges(true);

        setTimeout(() => {
          setAutoSaveIndicator(false);
        }, 2000);
      }
    },
    [formTouched, username]
  );

  // Auto-save effect for form values
  useEffect(() => {
    if (currentFormValues && username) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave(currentFormValues);
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [currentFormValues, handleAutoSave, username]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    if (!username) {
      setSubmitting(false);
      return;
    }

    // Save the submitted form with user-specific storage
    const submissionId = saveSubmittedForm(values, username, pdfFile);

    // Clear auto-save data since we've successfully submitted
    clearAutoSaveFormData(username);

    // Reset form state flags but keep the data
    setHasUnsavedChanges(false);
    setFormTouched(false);

    // Update user statistics
    const stats = getUserStats(username);
    setUserStats(stats);

    // Show success message
    setSuccessMessage(
      `Invoice submitted successfully! Submission ID: ${submissionId}`
    );
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setSubmitting(false);
    }, 5000);
  };

  // Save form as draft
  const handleSaveAsDraft = (values) => {
    if (!username) return;

    saveFormData(values, username);
    if (pdfFile) {
      savePDFFile(pdfFile, username);
    }
    clearAutoSaveFormData(username);
    setHasUnsavedChanges(false);
    setFormTouched(false);
    setFormValues(values);

    setSuccessMessage("Draft saved successfully!");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Populate form with dummy data
  const handlePopulateDummyData = (setValues) => {
    const dummyData = getDummyData();
    setValues(dummyData);
    setFormTouched(true);
    setHasUnsavedChanges(true);

    // Create a dummy PDF file
    const createDummyPDF = () => {
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Sample Invoice PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const file = new File([blob], "sample-invoice.pdf", {
        type: "application/pdf",
      });
      return file;
    };

    setPdfFile(createDummyPDF());
    setSuccessMessage("Form populated with dummy data!");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Handle tab navigation
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);

    // Scroll to the corresponding section
    let targetRef = null;
    switch (tabId) {
      case "vendor":
        targetRef = vendorSectionRef;
        break;
      case "invoice":
        targetRef = invoiceSectionRef;
        break;
      case "comments":
        targetRef = commentsSectionRef;
        break;
      default:
        break;
    }

    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Calculate expense totals and percentages
  const calculateExpenseDisplay = (expenses, totalAmount) => {
    const expenseTotal = expenses.reduce(
      (sum, expense) => sum + (Number.parseFloat(expense.lineAmount) || 0),
      0
    );
    const invoiceTotal = Number.parseFloat(totalAmount || 0);

    if (showPercentage) {
      const percentage =
        invoiceTotal > 0 ? ((expenseTotal / invoiceTotal) * 100).toFixed(1) : 0;
      return `${percentage}% / 100%`;
    } else {
      return `$ ${expenseTotal.toFixed(2)} / $ ${invoiceTotal.toFixed(2)}`;
    }
  };

  const tabs = [
    { id: "vendor", label: "Vendor Details", active: activeTab === "vendor" },
    {
      id: "invoice",
      label: "Invoice Details",
      active: activeTab === "invoice",
    },
    { id: "comments", label: "Comments", active: activeTab === "comments" },
  ];

  return (
    <div className="invoice-app">
      <Header user={user} />

      <div className="main-content">
        <div className="form-container" ref={formContainerRef}>
          <div className="form-header">
            <button className="back-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Create New Invoice
            </button>

            <div className="tab-navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${tab.active ? "active" : ""}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <Formik
            initialValues={formValues}
            validationSchema={InvoiceSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              setValues,
              isSubmitting,
              errors,
              touched,
              handleChange,
              handleBlur,
            }) => {
              // Track form changes
              const handleFormChange = (e) => {
                setFormTouched(true);
                setCurrentFormValues(values);
                handleChange(e);
              };

              const handleFormBlur = (e) => {
                setCurrentFormValues(values);
                handleBlur(e);
              };

              if (currentFormValues !== values) {
                setCurrentFormValues(values);
              }

              return (
                <Form className="invoice-form">
                  {showSuccess && (
                    <div className="success-message">{successMessage}</div>
                  )}
                  {autoSaveIndicator && (
                    <div className="autosave-indicator">Auto-saving...</div>
                  )}
                  {hasUnsavedChanges && (
                    <div className="unsaved-changes-indicator">
                      You have unsaved changes
                    </div>
                  )}

                  {/* User Statistics */}
                  {userStats && userStats.totalSubmissions > 0 && (
                    <div className="user-stats">
                      <div className="stats-content">
                        <span className="stats-item">
                          <strong>{userStats.totalSubmissions}</strong>{" "}
                          submissions
                        </span>
                        <span className="stats-item">
                          <strong>${userStats.totalAmount.toFixed(2)}</strong>{" "}
                          total value
                        </span>
                        {userStats.lastSubmission && (
                          <span className="stats-item">
                            Last:{" "}
                            {new Date(
                              userStats.lastSubmission
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form validation summary */}
                  {/* {Object.keys(errors).length > 0 && formTouched && (
                    <div className="validation-summary">
                      <h4>Please fix the following errors:</h4>
                      <ul>
                        {Object.entries(errors).map(([key, value]) => {
                          // Handle nested errors in expenses array
                          if (key === "expenses" && Array.isArray(value)) {
                            return value.map((expenseErrors, index) => {
                              if (typeof expenseErrors === "object") {
                                return Object.entries(expenseErrors).map(
                                  ([expKey, expValue]) => (
                                    <li key={`exp-${index}-${expKey}`}>
                                      Expense {index + 1} - {expValue}
                                    </li>
                                  )
                                );
                              }
                              return null;
                            });
                          }

                          return <li key={key}>{value}</li>;
                        })}
                      </ul>
                    </div>
                  )} */}

                  <div className="form-content">
                    {/* PDF Upload Area */}
                    <div className="upload-section">
                      <PDFUploadArea
                        pdfFile={pdfFile}
                        setPdfFile={setPdfFile}
                        setValues={setValues}
                        setFormTouched={setFormTouched}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                        setSuccessMessage={setSuccessMessage}
                        setShowSuccess={setShowSuccess}
                      />
                    </div>

                    <div className="form-sections">
                      {/* Vendor Details Section */}
                      <VendorDetailsSection
                        errors={errors}
                        touched={touched}
                        values={values}
                        handleFormChange={handleFormChange}
                        handleFormBlur={handleFormBlur}
                        vendorSectionRef={vendorSectionRef}
                      />

                      {/* Invoice Details Section */}
                      <InvoiceDetailsSection
                        errors={errors}
                        touched={touched}
                        handleFormChange={handleFormChange}
                        handleFormBlur={handleFormBlur}
                        values={values}
                        showPercentage={showPercentage}
                        setShowPercentage={setShowPercentage}
                        setFormTouched={setFormTouched}
                        calculateExpenseDisplay={calculateExpenseDisplay}
                        invoiceSectionRef={invoiceSectionRef}
                      />

                      {/* Comments Section */}
                      <CommentsSection
                        handleFormChange={handleFormChange}
                        handleFormBlur={handleFormBlur}
                        commentsSectionRef={commentsSectionRef}
                      />
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="form-footer">
                    <div className="footer-actions">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="dummy-button"
                          onClick={() => handlePopulateDummyData(setValues)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          Populate Dummy Data
                        </button>
                        <button
                          type="button"
                          className="draft-button"
                          onClick={() => handleSaveAsDraft(values)}
                          disabled={isSubmitting}
                        >
                          Save as Draft
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            (Object.keys(errors).length > 0 && formTouched)
                          }
                          className="submit-button"
                        >
                          {isSubmitting ? "Submitting..." : "Submit & View"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
