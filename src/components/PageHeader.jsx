export default function PageHeader({ title, description, action }) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
