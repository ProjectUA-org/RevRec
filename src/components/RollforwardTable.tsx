import type { RollforwardRow } from '../data/mockUsageRevenue'
import { formatCurrency, formatSignedCurrency } from '../utils/format'
import './Table.css'
import './RollforwardTable.css'

export function RollforwardTable({ rows }: { rows: RollforwardRow[] }) {
  return (
    <div className="table-card">
      <table className="rollforward-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={row.isTotal ? 'rollforward-table__total' : undefined}>
              <td>{row.label}</td>
              <td className="numeric">
                {row.isTotal || row.label.startsWith('Beginning')
                  ? formatCurrency(row.amount)
                  : formatSignedCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
