import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import AppModal from "../../components/AppModal";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../contexts/ToastContext";
import { fetchPayments } from "../../services/adminPaymentService";
import { formatCurrency } from "../../utils/formatters";

const paymentStatuses = ["pending", "completed", "failed", "refunded"];

export default function AdminPaymentsPage() {
  const { showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchPayments({
          page,
          perPage: 10,
          ...(statusFilter ? { status: statusFilter } : {}),
        });

        setPayments(response.data.items || []);
        setPagination(response.data.pagination || null);
      } catch (requestError) {
        const message = requestError.response?.data?.message || "Unable to load payment records.";
        setError(message);
        showError("Payment load failed", message);
        setPayments([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadPayments();
  }, [page, statusFilter]);

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Payment Records"
        description="Admins can inspect payment records here without dashboard statistics."
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
              {paymentStatuses.map((status) => (
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
          <p className="text-secondary mb-0">Loading payments...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Method</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="fw-semibold">{payment.orderNumber}</td>
                    <td>{payment.email}</td>
                    <td className="text-capitalize">{String(payment.paymentMethod || "n/a").replaceAll("_", " ")}</td>
                    <td>
                      <span className="text-capitalize">{payment.status}</span>
                    </td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">
                    No payments matched the current filter.
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
        id="admin-payment-detail-modal"
        title="Payment Details"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        footer={
          <button type="button" className="btn btn-outline-secondary" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </button>
        }
        size="modal-md"
      >
        {selectedPayment ? (
          <div className="d-flex flex-column gap-3">
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Order Number</div>
              <div className="fw-semibold">{selectedPayment.orderNumber}</div>
            </div>
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Buyer</div>
              <div className="fw-semibold">{selectedPayment.email}</div>
            </div>
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Payment Method</div>
              <div className="fw-semibold text-capitalize">
                {String(selectedPayment.paymentMethod || "n/a").replaceAll("_", " ")}
              </div>
            </div>
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Status</div>
              <div className="fw-semibold text-capitalize">{selectedPayment.status}</div>
            </div>
            <div className="surface-panel p-3">
              <div className="text-secondary small mb-2">Transaction ID</div>
              <div className="fw-semibold">{selectedPayment.transactionId || "Not available"}</div>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-secondary">Amount</span>
              <span className="fw-semibold">{formatCurrency(selectedPayment.amount)}</span>
            </div>
          </div>
        ) : null}
      </AppModal>
    </section>
  );
}
