import { Field, FieldArray, ErrorMessage } from "formik";

const InvoiceDetailsSection = ({
  errors,
  touched,
  handleFormChange,
  handleFormBlur,
  values,
  showPercentage,
  setShowPercentage,
  setFormTouched,
  calculateExpenseDisplay,
  invoiceSectionRef,
}) => {
  return (
    <div ref={invoiceSectionRef} className="invoice-section section-container">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <h3>Invoice Details</h3>
        </div>

        {/* General Information */}
        <div className="general-info">
          <h4>General Information</h4>
          <div className="form-group">
            <label>Purchase Order Number *</label>
            <Field
              type="text"
              name="purchaseOrderNumber"
              className={`form-input ${
                errors.purchaseOrderNumber && touched.purchaseOrderNumber
                  ? "error"
                  : touched.purchaseOrderNumber
                  ? "valid"
                  : ""
              }`}
              placeholder="Enter PO number"
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
            <ErrorMessage
              name="purchaseOrderNumber"
              component="div"
              className="error-message"
            />
          </div>
        </div>

        {/* Invoice Details */}
        <div className="invoice-details">
          <h4>Invoice Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number *</label>
              <Field
                type="text"
                name="invoiceNumber"
                className={`form-input ${
                  errors.invoiceNumber && touched.invoiceNumber
                    ? "error"
                    : touched.invoiceNumber
                    ? "valid"
                    : ""
                }`}
                placeholder="Enter invoice number"
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              />
              <ErrorMessage
                name="invoiceNumber"
                component="div"
                className="error-message"
              />
            </div>
            <div className="form-group">
              <label>Invoice Date *</label>
              <Field
                type="date"
                name="invoiceDate"
                className={`form-input ${
                  errors.invoiceDate && touched.invoiceDate
                    ? "error"
                    : touched.invoiceDate
                    ? "valid"
                    : ""
                }`}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              />
              <ErrorMessage
                name="invoiceDate"
                component="div"
                className="error-message"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Amount *</label>
              <Field
                type="number"
                name="totalAmount"
                className={`form-input ${
                  errors.totalAmount && touched.totalAmount
                    ? "error"
                    : touched.totalAmount
                    ? "valid"
                    : ""
                }`}
                placeholder="0.00"
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              />
              <ErrorMessage
                name="totalAmount"
                component="div"
                className="error-message"
              />
            </div>
            <div className="form-group">
              <label>Payment Terms *</label>
              <Field
                as="select"
                name="paymentTerms"
                className={`form-select ${
                  errors.paymentTerms && touched.paymentTerms
                    ? "error"
                    : touched.paymentTerms
                    ? "valid"
                    : ""
                }`}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              >
                <option value="">Select terms</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </Field>
              <ErrorMessage
                name="paymentTerms"
                component="div"
                className="error-message"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Invoice Due Date *</label>
              <Field
                type="date"
                name="dueDate"
                className={`form-input ${
                  errors.dueDate && touched.dueDate
                    ? "error"
                    : touched.dueDate
                    ? "valid"
                    : ""
                }`}
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              />
              <ErrorMessage
                name="dueDate"
                component="div"
                className="error-message"
              />
            </div>
            <div className="form-group">
              <label>GL Post Date</label>
              <Field
                type="date"
                name="glPostDate"
                className="form-input"
                onChange={handleFormChange}
                onBlur={handleFormBlur}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Invoice Description *</label>
            <Field
              as="textarea"
              name="description"
              className={`form-textarea ${
                errors.description && touched.description
                  ? "error"
                  : touched.description
                  ? "valid"
                  : ""
              }`}
              rows="3"
              placeholder="Enter invoice description"
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
            <ErrorMessage
              name="description"
              component="div"
              className="error-message"
            />
          </div>
        </div>

        {/* Expense Details */}
        <div className="expense-details">
          <div className="expense-header">
            <h4>Expense Details</h4>
            <div className="expense-total">
              <span className="total-amount">
                {calculateExpenseDisplay(values.expenses, values.totalAmount)}
              </span>
              <div className="toggle-container">
                <span
                  className={`toggle-label ${!showPercentage ? "active" : ""}`}
                >
                  $
                </span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="expense-toggle"
                    checked={showPercentage}
                    onChange={(e) => setShowPercentage(e.target.checked)}
                  />
                  <label htmlFor="expense-toggle"></label>
                </div>
                <span
                  className={`toggle-label ${showPercentage ? "active" : ""}`}
                >
                  %
                </span>
              </div>
            </div>
          </div>

          <FieldArray name="expenses">
            {({ push, remove }) => (
              <div className="expense-items">
                {values.expenses.map((expense, index) => (
                  <div key={index} className="expense-item">
                    <div className="expense-item-header">
                      <span>Expense {index + 1}</span>
                      {index > 0 && (
                        <button
                          type="button"
                          className="remove-expense-button"
                          onClick={() => {
                            remove(index);
                            setFormTouched(true);
                          }}
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
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Line Amount *</label>
                        <Field
                          type="number"
                          name={`expenses.${index}.lineAmount`}
                          className={`form-input ${
                            errors.expenses?.[index]?.lineAmount &&
                            touched.expenses?.[index]?.lineAmount
                              ? "error"
                              : touched.expenses?.[index]?.lineAmount
                              ? "valid"
                              : ""
                          }`}
                          placeholder="0.00"
                          onChange={handleFormChange}
                          onBlur={handleFormBlur}
                        />
                        <ErrorMessage
                          name={`expenses.${index}.lineAmount`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                      <div className="form-group">
                        <label>Department *</label>
                        <Field
                          as="select"
                          name={`expenses.${index}.department`}
                          className={`form-select ${
                            errors.expenses?.[index]?.department &&
                            touched.expenses?.[index]?.department
                              ? "error"
                              : touched.expenses?.[index]?.department
                              ? "valid"
                              : ""
                          }`}
                          onChange={handleFormChange}
                          onBlur={handleFormBlur}
                        >
                          <option value="">Select Department</option>
                          <option value="IT">IT</option>
                          <option value="Finance">Finance</option>
                          <option value="HR">HR</option>
                        </Field>
                        <ErrorMessage
                          name={`expenses.${index}.department`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Account *</label>
                        <Field
                          as="select"
                          name={`expenses.${index}.account`}
                          className={`form-select ${
                            errors.expenses?.[index]?.account &&
                            touched.expenses?.[index]?.account
                              ? "error"
                              : touched.expenses?.[index]?.account
                              ? "valid"
                              : ""
                          }`}
                          onChange={handleFormChange}
                          onBlur={handleFormBlur}
                        >
                          <option value="">Select Account</option>
                          <option value="Office Supplies">
                            Office Supplies
                          </option>
                          <option value="Software">Software</option>
                          <option value="Equipment">Equipment</option>
                        </Field>
                        <ErrorMessage
                          name={`expenses.${index}.account`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <Field
                          as="select"
                          name={`expenses.${index}.location`}
                          className={`form-select ${
                            errors.expenses?.[index]?.location &&
                            touched.expenses?.[index]?.location
                              ? "error"
                              : touched.expenses?.[index]?.location
                              ? "valid"
                              : ""
                          }`}
                          onChange={handleFormChange}
                          onBlur={handleFormBlur}
                        >
                          <option value="">Select Location</option>
                          <option value="New York">India</option>
                          <option value="New York">New York</option>
                          <option value="Los Angeles">Los Angeles</option>
                          <option value="Chicago">Chicago</option>
                        </Field>
                        <ErrorMessage
                          name={`expenses.${index}.location`}
                          component="div"
                          className="error-message"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <Field
                        as="textarea"
                        name={`expenses.${index}.description`}
                        className={`form-textarea ${
                          errors.expenses?.[index]?.description &&
                          touched.expenses?.[index]?.description
                            ? "error"
                            : touched.expenses?.[index]?.description
                            ? "valid"
                            : ""
                        }`}
                        rows="2"
                        placeholder="Enter expense description"
                        onChange={handleFormChange}
                        onBlur={handleFormBlur}
                      />
                      <ErrorMessage
                        name={`expenses.${index}.description`}
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>
                ))}

                {/* Add expense button */}
                <button
                  type="button"
                  onClick={() => {
                    push({
                      lineAmount: "",
                      department: "",
                      account: "",
                      location: "",
                      description: "",
                    });
                    setFormTouched(true);
                  }}
                  className="add-expense-button"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Expense Coding
                </button>
              </div>
            )}
          </FieldArray>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsSection;
