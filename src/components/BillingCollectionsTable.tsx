import type { BillingEvent } from '../types/usageRevenue'
import { customerName } from '../data/mockUsageRevenue'
import { formatCurrency, formatDate } from '../utils/format'
import { Tag } from './Tag'
import type { TagTone } from './Tag'
import './Table.css'
import './BillingCollectionsTable.css'

const KIND_LABEL: Record<BillingEvent['kind'], string> = {
  'invoice-credit-sale': 'Credit purchase (invoiced)',
  'cash-credit-sale': 'Credit purchase (paid up front)',
  'invoice-usage': 'Usage invoice',
  collection: 'Collection',
  refund: 'Refund',
}

const STATUS_LABEL: Record<BillingEvent['status'], string> = {
  outstanding: 'Outstanding',
  collected: 'Collected',
  refunded: 'Refunded',
}

const STATUS_TONE: Record<BillingEvent['status'], TagTone> = {
  outstanding: 'mismatch',
  collected: 'matched',
  refunded: 'neutral',
}

export function BillingCollectionsTable({ events }: { events: BillingEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="table-card">
      <table className="billing-collections-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Description</th>
            <th className="numeric">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((event) => (
            <tr key={event.id}>
              <td>{formatDate(event.date)}</td>
              <td>{customerName(event.customerId)}</td>
              <td>{KIND_LABEL[event.kind]}</td>
              <td>{event.description}</td>
              <td className="numeric">{formatCurrency(event.amount)}</td>
              <td>
                <Tag label={STATUS_LABEL[event.status]} tone={STATUS_TONE[event.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
