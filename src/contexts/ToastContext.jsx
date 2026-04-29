import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function createToast(payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: payload.title,
    message: payload.message,
    variant: payload.variant || "success",
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismissToast(toastId) {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }

  function pushToast(payload) {
    const toast = createToast(payload);
    setToasts((current) => [...current, toast]);

    window.setTimeout(() => {
      dismissToast(toast.id);
    }, payload.duration || 3500);
  }

  const value = useMemo(
    () => ({
      showSuccess(title, message) {
        pushToast({ title, message, variant: "success" });
      },
      showError(title, message) {
        pushToast({ title, message, variant: "danger" });
      },
      showInfo(title, message) {
        pushToast({ title, message, variant: "info" });
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-panel toast-panel-${toast.variant}`}>
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div className="fw-semibold">{toast.title}</div>
                <div className="small">{toast.message}</div>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Dismiss"
                onClick={() => dismissToast(toast.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
