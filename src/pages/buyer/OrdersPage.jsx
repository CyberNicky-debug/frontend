import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import AppModal from "../../components/AppModal";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { fetchOrderById, fetchMyOrders } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchMyOrders({ page, perPage: 8 });
        setOrders(response.data.items || []);
        setPagination(response.data.pagination || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load your orders.");
        setOrders([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [page]);

  async function openOrderDetails(orderId) {
    try {
      const response = await fetchOrderById(orderId);
      setSelectedOrder(response.data);
      setIsOrderModalOpen(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load order details.");
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="My Orders"
        description="Track your pending and completed orders."
      />

      <div className="orders-shell p-4 p-lg-5">
        <div className="orders-hero mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div className="section-caption mb-3">Order Tracking</div>
              <h2 className="h3 mb-2">Your orders.</h2>
              <p className="text-secondary mb-0">New orders are pending until the admin completes them.</p>
            </div>
            <div className="col-lg-4">
              <div className="catalog-metric">
                <span className="text-secondary small">Visible Orders</span>
                <strong>{orders.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-secondary mb-0">Loading your orders...</p>
          </div>
        ) : null}

        {!isLoading && !orders.length ? (
          <div className="surface-panel p-5 text-center">
            <h2 className="h5 mb-2">No orders yet</h2>
            <p className="text-secondary mb-0">Complete a checkout to see your order history here.</p>
          </div>
        ) : null}

        {!isLoading && orders.length ? (
          <>
            <div className="d-flex flex-column gap-3">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-main">
                    <div>
                      <div className="small text-secondary mb-2">Order Number</div>
                      <h3 className="h5 mb-1">{order.orderNumber}</h3>
                      <p className="text-secondary small mb-0">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="order-card-meta">
                      <div>
                        <span className="text-secondary small d-block mb-1">Total</span>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-secondary small d-block mb-1">Status</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                      onClick={() => openOrderDetails(order.id)}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination ? (
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4">
                <p className="text-secondary small mb-0">
                  Page {pagination.page} of {pagination.last_page || 1}
                </p>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={!pagination.has_more}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <AppModal
        id="order-detail-modal"
        title="Order Details"
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        footer={
          <button type="button" className="btn btn-outline-secondary" onClick={() => setIsOrderModalOpen(false)}>
            Close
          </button>
        }
      >
        {selectedOrder ? (
          <div className="d-flex flex-column gap-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="surface-panel p-3 h-100">
                  <div className="text-secondary small mb-2">Order Number</div>
                  <div className="fw-semibold">{selectedOrder.orderNumber}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="surface-panel p-3 h-100">
                  <div className="text-secondary small mb-2">Status</div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            <div className="surface-panel p-3">
              <div className="text-secondary small mb-3">Items</div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-secondary">Total Amount</span>
              <span className="fw-semibold">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        ) : null}
      </AppModal>
    </section>
  );
}
