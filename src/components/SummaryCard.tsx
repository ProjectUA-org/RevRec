import './SummaryCard.css'

export function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="summary-card">
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
      {hint && <div className="summary-card__hint">{hint}</div>}
    </div>
  )
}
