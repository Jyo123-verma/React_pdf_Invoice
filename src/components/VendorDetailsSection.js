import { Field, ErrorMessage } from "formik";

const VendorDetailsSection = ({
  errors,
  touched,
  handleFormChange,
  handleFormBlur,
  vendorSectionRef,
}) => {
  return (
    <div ref={vendorSectionRef} className="vendor-section section-container">
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
            </svg>
          </div>
          <h3>Vendor Details</h3>
        </div>

        <div className="vendor-info">
          <h4>Vendor Information</h4>
          <div className="form-group">
            <label>Vendor *</label>
            <div className="select-wrapper">
              <Field
                as="select"
                name="vendorName"
                className={`form-select ${
                  errors.vendorName && touched.vendorName
                    ? "error"
                    : touched.vendorName
                    ? "valid"
                    : ""
                }`}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              >
                <option value="">Select vendor</option>
                <option value="Acme Corporation">Acme Corporation</option>
                <option value="Tech Solutions Inc">Tech Solutions Inc</option>
                <option value="Global Services Ltd">Global Services Ltd</option>
              </Field>
            </div>
            <ErrorMessage
              name="vendorName"
              component="div"
              className="error-message"
            />
          </div>
          <div className="vendor-details-link">
            <a href="#" className="link-text">
              View Vendor Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsSection;
