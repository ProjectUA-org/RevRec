import type { WaterfallStage } from '../data/mockUsageRevenue'
import { formatCurrency } from '../utils/format'
import './RevenueWaterfallFlow.css'

export function RevenueWaterfallFlow({ stages }: { stages: WaterfallStage[] }) {
  const max = Math.max(...stages.map((s) => s.amount), 1)

  return (
    <div className="revenue-flow">
      {stages.map((stage, i) => (
        <div className="revenue-flow__stage" key={stage.label}>
          <div className="revenue-flow__card">
            <div className="revenue-flow__bar-track">
              <div
                className="revenue-flow__bar"
                style={{ height: `${Math.max((stage.amount / max) * 100, 4)}%` }}
              />
            </div>
            <div className="revenue-flow__label">{stage.label}</div>
            <div className="revenue-flow__value">{formatCurrency(stage.amount)}</div>
            <div className="revenue-flow__caption">{stage.caption}</div>
          </div>
          {i < stages.length - 1 && <div className="revenue-flow__arrow">→</div>}
        </div>
      ))}
    </div>
  )
}
