import type { AccountingException } from '../types/usageRevenue'
import { customerName } from '../data/mockUsageRevenue'
import { Tag } from './Tag'
import { EXCEPTION_STATUS_LABEL, EXCEPTION_STATUS_TONE, SEVERITY_LABEL, SEVERITY_TONE } from '../utils/tone'
import './ExceptionsPanel.css'

export function ExceptionsPanel({ exceptions }: { exceptions: AccountingException[] }) {
  return (
    <div className="exceptions-panel">
      {exceptions.map((exception) => (
        <div key={exception.id} className={`exceptions-panel__card exceptions-panel__card--${exception.severity}`}>
          <div className="exceptions-panel__heading">
            <div>
              <div className="exceptions-panel__type">{exception.type}</div>
              <div className="exceptions-panel__customer">{customerName(exception.customerId)}</div>
            </div>
            <div className="exceptions-panel__tags">
              <Tag label={SEVERITY_LABEL[exception.severity]} tone={SEVERITY_TONE[exception.severity]} />
              <Tag label={EXCEPTION_STATUS_LABEL[exception.status]} tone={EXCEPTION_STATUS_TONE[exception.status]} />
            </div>
          </div>
          <p className="exceptions-panel__detail">{exception.detail}</p>
          <div className="exceptions-panel__action">
            <span className="exceptions-panel__action-label">Suggested action</span>
            {exception.suggestedAction}
          </div>
        </div>
      ))}
    </div>
  )
}
