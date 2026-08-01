import type { MonthlyReconciliation } from '../types/reconciliation'
import { formatCurrency, formatMonth, formatPercent } from '../utils/format'
import { StatusBadge } from './StatusBadge'
import './WaterfallTable.css'

export function WaterfallTable({ rows }: { rows: MonthlyReconciliation[] }) {
  return (
    <div className="table-card">
      <table className="waterfall-table">
        <thead>
          <tr>
            <th>Month</th>
            <th className="numeric">Contracted MRR</th>
            <th className="numeric">Billing-platform new MRR</th>
            <th className="numeric">Recognized revenue</th>
            <th className="numeric">Variance %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <td>{formatMonth(row.month)}</td>
              <td className="numeric">{formatCurrency(row.contractedMRR)}</td>
              <td className="numeric">{formatCurrency(row.billingNewMRR)}</td>
              <td className="numeric">{formatCurrency(row.recognizedRevenue)}</td>
              <td className={`numeric variance variance--${row.status}`}>
                {formatPercent(row.variancePct)}
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
