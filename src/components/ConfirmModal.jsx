import AppModal from "./AppModal";

export default function ConfirmModal({
  id,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isOpen,
  onClose,
  onConfirm,
  variant = "danger",
}) {
  return (
    <AppModal
      id={id}
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      size="modal-md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn btn-${variant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="mb-0 text-secondary">{message}</p>
    </AppModal>
  );
}
