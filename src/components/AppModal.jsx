export default function AppModal({
  id,
  title,
  children,
  isOpen,
  onClose,
  footer,
  size = "modal-lg",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal fade show modal-display" id={id} tabIndex="-1" aria-modal="true" role="dialog">
        <div className={`modal-dialog modal-dialog-centered ${size}`}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </div>
      </div>
      <div className="modal-backdrop-custom" onClick={onClose} />
    </>
  );
}
