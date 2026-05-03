import { CheckCircle2, Clock3 } from "lucide-react";

const statusConfig = {
  pending: {
    icon: Clock3,
    className: "status-pill status-pending",
  },
  completed: {
    icon: CheckCircle2,
    className: "status-pill status-completed",
  },
};

export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase?.() || "pending";
  const config = statusConfig[normalizedStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon size={14} />
      <span className="text-capitalize">{normalizedStatus}</span>
    </span>
  );
}
