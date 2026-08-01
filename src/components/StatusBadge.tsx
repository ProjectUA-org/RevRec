import type { ReconciliationStatus } from '../types/reconciliation'
import './StatusBadge.css'

const LABELS: Record<ReconciliationStatus, string> = {
  matched: 'Matched',
  mismatch: 'Mismatch',
  gap: 'Gap',
}

export function StatusBadge({ status }: { status: ReconciliationStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status]}</span>
}
