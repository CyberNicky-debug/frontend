import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(formData);
      showSuccess("Account created", "Your buyer account is ready and checkout is unlocked.");
      navigate("/checkout", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-9 col-lg-6">
        <div className="surface-card page-section">
          <div className="text-center mb-4">
            <div className="brand-mark mx-auto mb-3">
              <UserPlus size={18} />
            </div>
            <h1 className="h3 mb-2">Create account</h1>
            <p className="text-secondary mb-0">Registration feeds directly into the protected checkout flow.</p>
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">First name</label>
              <input
                className="form-control"
                value={formData.firstName}
                onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Last name</label>
              <input
                className="form-control"
                value={formData.lastName}
                onChange={(event) => setFormData((current) => ({ ...current, lastName: event.target.value }))}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            {error ? (
              <div className="col-12">
                <div className="alert alert-danger mb-0">{error}</div>
              </div>
            ) : null}

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <p className="text-secondary small mt-4 mb-0">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
