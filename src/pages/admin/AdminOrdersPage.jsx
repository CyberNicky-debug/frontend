import { useEffect, useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import AppModal from "../../components/AppModal";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../contexts/ToastContext";
import { fetchOrderById, fetchOrders, updateOrderStatus } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";

const orderStatuses = ["pending", "completed"];

export default function AdminOrdersPage() {
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("completed");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchOrders({
          page,
          perPage: 10,
          ...(statusFilter ? { status: statusFilter } : {}),
        });

        setOrders(response.data.items || []);
        setPagination(response.data.pagination || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load order records.");
        setOrders([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [page, statusFilter]);

  async function openOrderDetail(orderId) {
    try {
      const response = await fetchOrderById(orderId);
      setSelectedOrder(response.data);
      setPendingStatus("completed");
      setIsDetailModalOpen(true);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load order details.";
      setError(message);
      showError("Order detail failed", message);
    }
  }

  function openStatusModal(order) {
    setSelectedOrder(order);
    setPendingStatus("completed");
    setIsStatusModalOpen(true);
  }

  async function handleStatusUpdate(event) {
    event.preventDefault();

    if (!selectedOrder) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateOrderStatus(selectedOrder.id, pendingStatus);

      setOrders((current) =>
        current.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: pendingStatus } : order
        )
      );

      setSelectedOrder((current) =>
        current ? { ...current, status: pendingStatus } : current
      );
      setIsStatusModalOpen(false);
      showSuccess("Order status updated", `${selectedOrder.orderNumber} is now ${pendingStatus}.`);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to update order status.";
      setError(message);
      showError("Status update failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Manage Orders"
        description="Admin can complete pending orders."
      />

      <div className="surface-panel p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label">Status Filter</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-secondary mb-0">Loading orders...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-semibold">{order.orderNumber}</td>
                    <td>
                      <div>{order.email}</div>
                      <div className="small text-secondary">
                        {order.firstName} {order.lastName}
                      </div>
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => openOrderDetail(order.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          disabled={order.status === "completed"}
                          onClick={() => openStatusModal(order)}
                        >
                          <PencilLine size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    No orders matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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

      <AppModal
        id="admin-order-detail-modal"
        title="Order Details"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        footer={
          <button type="button" className="btn btn-outline-secondary" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </button>
        }
      >
        {selectedOrder ? (
          <div className="d-flex flex-column gap-4">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="surface-panel p-3 h-100">
                  <div className="text-secondary small mb-2">Order Number</div>
                  <div className="fw-semibold">{selectedOrder.orderNumber}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="surface-panel p-3 h-100">
                  <div className="text-secondary small mb-2">Buyer</div>
                  <div className="fw-semibold">{selectedOrder.email}</div>
                  <div className="small text-secondary">
                    {selectedOrder.firstName} {selectedOrder.lastName}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="surface-panel p-3 h-100">
                  <div className="text-secondary small mb-2">Status</div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            <div className="surface-panel p-3">
              <div className="text-secondary small mb-3">Order Items</div>
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

      <AppModal
        id="admin-order-status-modal"
        title="Update Order Status"
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="order-status-form" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Status"}
            </button>
          </>
        }
        size="modal-md"
      >
        <form id="order-status-form" onSubmit={handleStatusUpdate} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label">Order</label>
            <input className="form-control" value={selectedOrder?.orderNumber || ""} disabled />
          </div>
          <div>
            <label className="form-label">Status</label>
            <input className="form-control" value={pendingStatus} disabled />
          </div>
        </form>
      </AppModal>
    </section>
  );
}
