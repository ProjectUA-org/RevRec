import { useMemo, useState } from 'react'
import type { Contract } from '../types/reconciliation'
import { formatCurrency, formatMonth } from '../utils/format'
import { layer1Status } from '../data/mockReconciliation'
import { StatusBadge } from './StatusBadge'
import './Table.css'
import './ContractsTable.css'

export function ContractsTable({ contracts, months }: { contracts: Contract[]; months: string[] }) {
  const [monthFilter, setMonthFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (monthFilter === 'all' ? contracts : contracts.filter((c) => c.month === monthFilter)),
    [contracts, monthFilter],
  )

  return (
    <div className="table-card">
      <div className="contracts-table__toolbar">
        <label htmlFor="month-filter">Month</label>
        <select
          id="month-filter"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="all">All months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Package</th>
            <th className="numeric">Contract MRR</th>
            <th className="numeric">Billing-platform MRR</th>
            <th>Layer 1 status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.company}</td>
              <td>{contract.package}</td>
              <td className="numeric">{formatCurrency(contract.contractMRR)}</td>
              <td className="numeric">
                {contract.billingPlatformMRR === null ? '—' : formatCurrency(contract.billingPlatformMRR)}
              </td>
              <td>
                <StatusBadge status={layer1Status(contract)} />
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="contracts-table__empty">
                No contracts for this month.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
