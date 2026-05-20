import { RiskBadge } from "./RiskBadge";

type StatusCardProps = {
  label: string;
  value: string | boolean | number;
  status?: "pass" | "needs_review" | "blocked" | "info" | "low" | "medium" | "high";
  description?: string;
};

export function StatusCard({ label, value, status = "info", description }: StatusCardProps) {
  return (
    <article className="status-card">
      <p className="label">{label}</p>
      <p className="value">{String(value)}</p>
      <RiskBadge value={status} />
      {description ? <p className="description">{description}</p> : null}
    </article>
  );
}
