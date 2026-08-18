import type { WalletLot } from '../types/usageRevenue'
import { customerName } from '../data/mockUsageRevenue'
import { formatCredits, formatCurrency, formatDate } from '../utils/format'
import { Tag } from './Tag'
import { LOT_STATUS_LABEL, LOT_STATUS_TONE } from '../utils/tone'
import './Table.css'
import './WalletLotsTable.css'

const SOURCE_LABEL: Record<WalletLot['source'], string> = {
  purchase: 'Purchased',
  promotional: 'Promotional',
  rollover: 'Rollover',
}

function resolutionNote(lot: WalletLot): string | null {
  if (lot.breakageAmount) return `Breakage: ${formatCurrency(lot.breakageAmount)}`
  if (lot.remittanceAmount) {
    return `Remittance: ${formatCurrency(lot.remittanceAmount)} (${lot.remittanceStatus})`
  }
  return null
}

export function WalletLotsTable({ lots }: { lots: WalletLot[] }) {
  return (
    <div className="table-card">
      <table className="wallet-lots-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Wallet lot ID</th>
            <th>Issue date</th>
            <th className="numeric">Original credits</th>
            <th className="numeric">Remaining credits</th>
            <th>Expiration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const note = resolutionNote(lot)
            return (
              <tr key={lot.id}>
                <td>{customerName(lot.customerId)}</td>
                <td>
                  {lot.id}
                  <div className="wallet-lots-table__source">{SOURCE_LABEL[lot.source]}</div>
                </td>
                <td>{formatDate(lot.issueDate)}</td>
                <td className="numeric">{formatCredits(lot.originalCredits)}</td>
                <td className="numeric">{formatCredits(lot.remainingCredits)}</td>
                <td>{formatDate(lot.expiration)}</td>
                <td>
                  <Tag label={LOT_STATUS_LABEL[lot.status]} tone={LOT_STATUS_TONE[lot.status]} />
                  {note && <div className="wallet-lots-table__source">{note}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
