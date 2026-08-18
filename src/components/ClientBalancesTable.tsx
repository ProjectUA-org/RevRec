import { Fragment, useState } from 'react'
import type { ClientBalance } from '../data/mockUsageRevenue'
import type { Customer, JournalEntry, WalletLot } from '../types/usageRevenue'
import { formatCurrency } from '../utils/format'
import { Tag } from './Tag'
import { WalletLotsTable } from './WalletLotsTable'
import { JournalEntriesTable } from './JournalEntriesTable'
import './Table.css'
import './ClientBalancesTable.css'

export function ClientBalancesTable({
  customers,
  balances,
  walletLots,
  journalEntries,
}: {
  customers: Customer[]
  balances: ClientBalance[]
  walletLots: WalletLot[]
  journalEntries: JournalEntry[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="table-card">
      <table className="client-balances-table">
        <colgroup>
          <col style={{ width: '250px' }} />
          <col style={{ width: '170px' }} />
          <col style={{ width: '210px' }} />
          <col style={{ width: '210px' }} />
          <col style={{ width: '210px' }} />
          <col style={{ width: '48px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contract type</th>
            <th className="numeric">Wallet balance</th>
            <th className="numeric">AR outstanding</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const balance = balances.find((b) => b.customerId === customer.id)
            const isExpanded = expandedId === customer.id
            const lots = walletLots.filter((lot) => lot.customerId === customer.id)
            const entries = journalEntries.filter((e) => e.customerId === customer.id).slice(-5).reverse()

            return (
              <Fragment key={customer.id}>
                <tr
                  className="client-balances-table__row"
                  onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                >
                  <td>
                    {customer.name}
                    <div className="client-balances-table__contract-id">{customer.contractId}</div>
                  </td>
                  <td>
                    <Tag
                      label={customer.contractType === 'payg' ? 'Pay-as-you-go' : 'Prepaid'}
                      tone={customer.contractType === 'payg' ? 'info' : 'matched'}
                    />
                  </td>
                  <td className="numeric">
                    {balance && balance.walletBalance !== null ? formatCurrency(balance.walletBalance) : '—'}
                  </td>
                  <td className="numeric">{balance ? formatCurrency(balance.accountsReceivable) : '—'}</td>
                  <td>
                    <Tag
                      label={balance?.needsAttention ? 'Attention needed' : 'Good standing'}
                      tone={balance?.needsAttention ? 'gap' : 'matched'}
                      variant="dot"
                    />
                  </td>
                  <td className="client-balances-table__chevron">{isExpanded ? '▾' : '▸'}</td>
                </tr>
                {isExpanded && (
                  <tr className="client-balances-table__detail-row">
                    <td colSpan={6}>
                      <div className="client-balances-table__detail">
                        {balance?.needsAttention && (
                          <p className="client-balances-table__attention">Needs attention: {balance.attentionReason}</p>
                        )}
                        <h4>Wallet lots</h4>
                        {lots.length > 0 ? (
                          <WalletLotsTable lots={lots} />
                        ) : (
                          <p className="client-balances-table__muted">No prepaid wallet — billed pay-as-you-go.</p>
                        )}
                        <h4>Recent journal entries</h4>
                        <JournalEntriesTable entries={entries} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
