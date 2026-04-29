import { useMemo, useState } from "react";
import { CircleAlert, CreditCard, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppModal from "../../components/AppModal";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { createOrder } from "../../services/orderService";
import { initiatePayment, verifyPayment } from "../../services/paymentService";
import { formatCurrency } from "../../utils/formatters";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const { showError, showSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState({
    isOpen: false,
    order: null,
    payment: null,
    status: "processing",
    message: "",
  });

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
      const orderResponse = await createOrder(orderPayload);
      const order = orderResponse.data;

      const paymentResponse = await initiatePayment({
        orderId: order.id,
        paymentMethod: "paynow",
        metadata: {
          channel: "sandbox",
          buyerEmail: user?.email,
        },
      });

      clearCart();
      showSuccess("Order created", "Your order is processing and the Paynow sandbox has been opened.");
      setPaymentStep({
        isOpen: true,
        order,
        payment: paymentResponse.data,
        status: "processing",
        message: "Order created and Paynow sandbox initiated. Complete or fail the sandbox payment below.",
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Checkout could not be completed.";
      setError(message);
      showError("Checkout failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSandboxResult(status) {
    if (!paymentStep.order) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await verifyPayment({
        orderId: paymentStep.order.id,
        transactionId: `PAYNOW-${Date.now()}`,
        status,
      });

      const normalizedOrderStatus = status === "completed" ? "completed" : "failed";

      setPaymentStep((current) => ({
        ...current,
        status: normalizedOrderStatus,
        order: {
          ...current.order,
          status: normalizedOrderStatus,
        },
        message:
          status === "completed"
            ? "Payment completed successfully in the sandbox. The order is now marked as completed."
            : "Payment failed in the sandbox. The order is now marked as failed and can be reviewed in My Orders.",
      }));
      showSuccess(
        status === "completed" ? "Payment completed" : "Payment failed",
        status === "completed"
          ? "The order moved to completed."
          : "The order moved to failed and remains visible in My Orders."
      );
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to update the sandbox payment.";
      setError(message);
      showError("Payment update failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Checkout"
        description="Confirm your items, create the order, and complete the Paynow sandbox payment flow."
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
                <div className="section-caption mb-3">Secure Checkout</div>
                <h2 className="h3 mb-2">One clean step between cart review and payment confirmation.</h2>
                <p className="text-secondary mb-0">
                  Orders are created in processing state, then updated by the Paynow sandbox result.
                </p>
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
                      Creating the order sets it to <strong>processing</strong>. The Paynow sandbox result will then move it to <strong>completed</strong> or <strong>failed</strong>.
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
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 className="h5 mb-1">Payment Summary</h2>
                    <p className="text-secondary mb-0">Sandbox payment method: Paynow</p>
                  </div>
                </div>

                <div className="cart-summary-row">
                  <span className="text-secondary">Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="text-secondary">Gateway</span>
                  <span>Paynow Sandbox</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>

                {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

                <div className="cart-summary-note">
                  Order inventory is reserved during processing and updated automatically after the sandbox payment result.
                </div>

                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-primary" disabled={isSubmitting} onClick={handleCreateOrder}>
                    {isSubmitting ? "Processing..." : "Create Order and Continue"}
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

      <AppModal
        id="paynow-sandbox-modal"
        title="Paynow Sandbox"
        isOpen={paymentStep.isOpen}
        onClose={() => setPaymentStep((current) => ({ ...current, isOpen: false }))}
        footer={
          paymentStep.status === "processing" ? (
            <>
              <button
                type="button"
                className="btn btn-outline-danger"
                disabled={isSubmitting}
                onClick={() => handleSandboxResult("failed")}
              >
                Mark Failed
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => handleSandboxResult("completed")}
              >
                Mark Completed
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPaymentStep((current) => ({ ...current, isOpen: false }));
                navigate("/orders");
              }}
            >
              View My Orders
            </button>
          )
        }
      >
        <div className="d-flex flex-column gap-3">
          {paymentStep.order ? (
            <div className="surface-panel p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Order</span>
                <StatusBadge status={paymentStep.order.status || paymentStep.status} />
              </div>
              <div className="fw-semibold">{paymentStep.order.orderNumber}</div>
              <div className="text-secondary small mt-2">
                Total: {formatCurrency(paymentStep.order.totalAmount)}
              </div>
            </div>
          ) : null}

          {paymentStep.payment ? (
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Payment Method</div>
              <div className="fw-semibold text-capitalize">{paymentStep.payment.paymentMethod}</div>
            </div>
          ) : null}

          <p className="mb-0 text-secondary">{paymentStep.message}</p>
        </div>
      </AppModal>
    </section>
  );
}
