import { useState } from "react";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import PageHeader from "../../components/PageHeader";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { formatCurrency } from "../../utils/formatters";

export default function CartPage() {
  const { cartItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showInfo, showSuccess } = useToast();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Cart"
        description="Review selected items, adjust quantities, and continue to secure checkout."
      />

      {!cartItems.length ? (
        <div className="cart-shell p-4 p-lg-5">
          <div className="cart-hero mb-4">
            <div className="brand-mark mb-3">
              <ShoppingBag size={18} />
            </div>
            <h2 className="h4 mb-2">Your cart is empty</h2>
            <p className="text-secondary mb-4">Add products from the catalog before heading to checkout.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-shell p-4 p-lg-5">
          <div className="cart-hero mb-4">
            <div className="row g-4 align-items-center">
              <div className="col-lg-7">
                <div className="section-caption mb-3">Checkout Review</div>
                <h2 className="h3 mb-2">Everything ready for a clean, secure checkout.</h2>
                <p className="text-secondary mb-0">
                  Review your items, adjust quantities, and continue when the order looks right.
                </p>
              </div>
              <div className="col-lg-5">
                <div className="cart-hero-metrics">
                  <div className="cart-metric">
                    <span className="text-secondary small">Items</span>
                    <strong>{cartItems.length}</strong>
                  </div>
                  <div className="cart-metric">
                    <span className="text-secondary small">Subtotal</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div className="cart-metric cart-metric-accent">
                    <ShieldCheck size={16} />
                    <span>Protected checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item) => (
                  <div className="cart-item-card" key={item.id}>
                    <div className="cart-item-media">Item</div>
                    <div className="cart-item-main">
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div>
                          <div className="small text-secondary mb-2">{item.categoryName}</div>
                          <h3 className="h5 mb-2">{item.name}</h3>
                          <p className="text-secondary small mb-0">
                            {item.description || "Selected for your current order."}
                          </p>
                        </div>
                        <div className="text-lg-end">
                          <div className="text-secondary small mb-1">Unit Price</div>
                          <div className="fw-semibold">{formatCurrency(item.price)}</div>
                        </div>
                      </div>

                      <div className="cart-item-footer">
                        <div className="cart-qty-group">
                          <span className="text-secondary small">Quantity</span>
                          <div className="cart-stepper">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              className="form-control text-center"
                              value={item.quantity}
                              onChange={(event) => updateQuantity(item.id, event.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="cart-item-total">
                          <span className="text-secondary small">Line Total</span>
                          <strong>{formatCurrency(item.quantity * item.price)}</strong>
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            removeFromCart(item.id);
                            showInfo("Item removed", `${item.name} was removed from the cart.`);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="cart-summary-card">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="brand-mark">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="h5 mb-1">Order Summary</h2>
                    <p className="text-secondary small mb-0">Secure handoff to checkout and payment.</p>
                  </div>
                </div>

                <div className="cart-summary-row">
                  <span className="text-secondary">Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="text-secondary">Reserved subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>

                <div className="cart-summary-note">
                  Orders move into <strong>processing</strong> when created, then update after the Paynow sandbox result.
                </div>

                <div className="d-grid gap-2">
                  <Link to="/checkout" className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2">
                    Continue to Checkout
                    <ArrowRight size={16} />
                  </Link>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsClearModalOpen(true)}>
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        id="clear-cart-modal"
        title="Clear cart"
        message="This will remove all selected items from your cart."
        confirmLabel="Clear Cart"
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          clearCart();
          showSuccess("Cart cleared", "All items were removed from your cart.");
          setIsClearModalOpen(false);
        }}
      />
    </section>
  );
}
