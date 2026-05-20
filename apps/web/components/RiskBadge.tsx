type RiskBadgeProps = {
  value: string | boolean | number | undefined;
};

function classNameFor(value: string) {
  const normalized = value.toLowerCase();
  if (["pass", "low", "false", "ok"].includes(normalized)) return "badge pass";
  if (["blocked", "high", "true"].includes(normalized)) return "badge blocked";
  if (["needs_review", "medium", "unknown"].includes(normalized)) return "badge needs_review";
  return "badge info";
}

export function RiskBadge({ value }: RiskBadgeProps) {
  const label = String(value ?? "unknown");
  return <span className={classNameFor(label)}>{label}</span>;
}
