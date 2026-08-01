import type { StatusCounts } from '../types/reconciliation'
import './StatusBanner.css'

export function StatusBanner({
  title,
  subtitle,
  counts,
}: {
  title: string
  subtitle: string
  counts: StatusCounts
}) {
  const total = counts.matched + counts.mismatch + counts.gap
  const tone = counts.gap > 0 ? 'gap' : counts.mismatch > 0 ? 'mismatch' : 'matched'

  return (
    <div className={`status-banner status-banner--${tone}`}>
      <div className="status-banner__heading">
        <div className="status-banner__title">{title}</div>
        <div className="status-banner__subtitle">{subtitle}</div>
      </div>
      <div className="status-banner__counts">
        <div className="status-banner__count status-banner__count--matched">
          <span className="status-banner__count-value">{counts.matched}</span>
          <span className="status-banner__count-label">Matched</span>
        </div>
        <div className="status-banner__count status-banner__count--mismatch">
          <span className="status-banner__count-value">{counts.mismatch}</span>
          <span className="status-banner__count-label">Mismatch</span>
        </div>
        <div className="status-banner__count status-banner__count--gap">
          <span className="status-banner__count-value">{counts.gap}</span>
          <span className="status-banner__count-label">Gap</span>
        </div>
        <div className="status-banner__count">
          <span className="status-banner__count-value">{total}</span>
          <span className="status-banner__count-label">Total</span>
        </div>
      </div>
    </div>
  )
}
