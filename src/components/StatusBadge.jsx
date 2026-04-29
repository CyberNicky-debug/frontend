import { AlertCircle, CheckCircle2, Clock3, OctagonX } from "lucide-react";

const statusConfig = {
  processing: {
    icon: Clock3,
    className: "status-pill status-processing",
  },
  completed: {
    icon: CheckCircle2,
    className: "status-pill status-completed",
  },
  failed: {
    icon: AlertCircle,
    className: "status-pill status-failed",
  },
  cancelled: {
    icon: OctagonX,
    className: "status-pill status-cancelled",
  },
};

export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase?.() || "processing";
  const config = statusConfig[normalizedStatus] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon size={14} />
      <span className="text-capitalize">{normalizedStatus}</span>
    </span>
  );
}
