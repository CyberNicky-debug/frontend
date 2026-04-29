import { useState } from "react";
import { LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/checkout";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      showSuccess("Signed in", "You can continue with checkout and order tracking now.");
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="surface-card page-section">
          <div className="text-center mb-4">
            <div className="brand-mark mx-auto mb-3">
              <LogIn size={18} />
            </div>
            <h1 className="h3 mb-2">Sign in</h1>
            <p className="text-secondary mb-0">Buyers must sign in before checkout.</p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-secondary small mt-4 mb-0">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
