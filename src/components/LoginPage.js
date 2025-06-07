import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const { login } = useAuth();

  const handleSubmit = (values, { setSubmitting, setFieldError }) => {
    const success = login(values.username, values.password);
    if (!success) {
      setFieldError("password", "Invalid credentials");
    }
    setSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Invoice Manager</h1>
          <p>Sign in to your account</p>
        </div>

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field
                  type="text"
                  name="username"
                  className={`form-input ${
                    errors.username && touched.username ? "error" : ""
                  }`}
                  placeholder="Enter your username"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  className={`form-input ${
                    errors.password && touched.password ? "error" : ""
                  }`}
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-button"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="login-demo">
          <p>
            Demo credentials: Any username/password with 3+ and 6+ characters
            respectively
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
