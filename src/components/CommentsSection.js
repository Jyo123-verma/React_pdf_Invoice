import { Field } from "formik";

const CommentsSection = ({
  handleFormChange,
  handleFormBlur,
  commentsSectionRef,
}) => {
  return (
    <div
      ref={commentsSectionRef}
      className="comments-section section-container"
    >
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>Comments</h3>
        </div>

        <div className="comments-content">
          <div className="form-group">
            <Field
              as="textarea"
              name="comments"
              className="form-textarea"
              rows="4"
              placeholder="Add a comment and tag @Name to tag someone..."
              onChange={handleFormChange}
              onBlur={handleFormBlur}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
