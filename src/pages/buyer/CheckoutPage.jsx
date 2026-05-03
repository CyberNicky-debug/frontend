import { useMemo, useState } from "react";
import { CircleAlert, PackageCheck, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { createOrder } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const { showError, showSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const orderPayload = useMemo(
    () =>
      cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    [cartItems]
  );

  async function handleCreateOrder() {
    setIsSubmitting(true);
    setError("");

    try {
      await createOrder(orderPayload);

      clearCart();
      showSuccess("Order created", "Your order is pending.");
      navigate("/orders");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Checkout could not be completed.";
      setError(message);
      showError("Checkout failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Checkout"
        description="Confirm your items and create a pending order."
      />

      {!cartItems.length ? (
        <div className="checkout-shell p-4 p-lg-5">
          <div className="checkout-hero text-center">
            <h2 className="h4 mb-2">No items ready for checkout</h2>
            <p className="text-secondary mb-4">Add products to your cart before creating an order.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout-shell p-4 p-lg-5">
          <div className="checkout-hero mb-4">
            <div className="row g-4 align-items-center">
              <div className="col-lg-7">
                <div className="section-caption mb-3">Checkout</div>
                <h2 className="h3 mb-2">Create your order.</h2>
                <p className="text-secondary mb-0">New orders start as pending.</p>
              </div>
              <div className="col-lg-5">
                <div className="checkout-metrics">
                  <div className="catalog-metric">
                    <span className="text-secondary small">Items</span>
                    <strong>{cartItems.length}</strong>
                  </div>
                  <div className="catalog-metric">
                    <span className="text-secondary small">Total</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <div className="checkout-panel h-100">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="brand-mark">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="h5 mb-1">Buyer Account</h2>
                    <p className="text-secondary mb-0">
                      Logged in as {user?.firstName} {user?.lastName} ({user?.email})
                    </p>
                  </div>
                </div>

                <div className="checkout-note d-flex gap-3">
                  <CircleAlert size={18} className="mt-1 flex-shrink-0" />
                  <div>
                    <div className="fw-semibold mb-1">Checkout flow</div>
                    <p className="text-secondary mb-0">
                      Creating the order sets it to <strong>pending</strong>. Only an admin can mark it <strong>completed</strong>.
                    </p>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 mt-4">
                  {cartItems.map((item) => (
                    <div className="checkout-item-row" key={item.id}>
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small text-secondary">{item.categoryName}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-secondary">Qty {item.quantity}</div>
                        <div className="fw-semibold">{formatCurrency(item.quantity * item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="checkout-summary-card">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="brand-mark">
                    <PackageCheck size={18} />
                  </div>
                  <div>
                    <h2 className="h5 mb-1">Order Summary</h2>
                    <p className="text-secondary mb-0">Status: pending</p>
                  </div>
                </div>

                <div className="cart-summary-row">
                  <span className="text-secondary">Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="text-secondary">Status</span>
                  <span>Pending</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>

                {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

                <div className="cart-summary-note">
                  The admin will mark the order complete after review.
                </div>

                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleCreateOrder}>
                    {isSubmitting ? "Creating..." : "Create Order"}
                  </button>
                  <Link to="/cart" className="btn btn-outline-secondary">
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
