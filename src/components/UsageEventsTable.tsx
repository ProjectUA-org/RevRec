import { useMemo, useState } from 'react'
import type { JournalEntry, UsageEvent } from '../types/usageRevenue'
import { CUSTOMERS, customerName, walletLot } from '../data/mockUsageRevenue'
import { formatCredits, formatCurrency, formatDateTime, formatTokens } from '../utils/format'
import { explainJournalEntry } from '../utils/explainJournalEntry'
import { Tag } from './Tag'
import { JE_STATUS_LABEL, JE_STATUS_TONE, LOT_STATUS_LABEL, LOT_STATUS_TONE } from '../utils/tone'
import { SidePanel } from './SidePanel'
import './Table.css'
import './UsageEventsTable.css'

export function UsageEventsTable({
  events,
  journalEntries,
}: {
  events: UsageEvent[]
  journalEntries: JournalEntry[]
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<UsageEvent | null>(null)

  const sorted = useMemo(
    () => [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [events],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((event) => {
      const haystack = [
        customerName(event.customerId),
        event.model,
        event.walletLotId ?? 'pay-as-you-go',
        event.id,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [sorted, query])

  const selectedJournalEntry = selected
    ? journalEntries.find((je) => je.sourceUsageEventId === selected.id)
    : undefined
  const selectedCustomer = selected ? CUSTOMERS.find((c) => c.id === selected.customerId) : undefined
  const selectedLot = selected ? walletLot(selected.walletLotId) : undefined

  return (
    <div className="table-card">
      <div className="usage-events-table__toolbar">
        <input
          type="search"
          placeholder="Search by customer, model, or wallet lot…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search usage events"
        />
        <span className="usage-events-table__count">
          {filtered.length} of {events.length} events
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Customer</th>
            <th>AI model</th>
            <th className="numeric">Tokens</th>
            <th>Wallet lot</th>
            <th className="numeric">Revenue recognized</th>
            <th>Journal entry status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((event) => (
            <tr key={event.id} className="usage-events-table__row" onClick={() => setSelected(event)}>
              <td>{formatDateTime(event.timestamp)}</td>
              <td>{customerName(event.customerId)}</td>
              <td>{event.model}</td>
              <td className="numeric">{formatTokens(event.tokens)}</td>
              <td>{event.walletLotId ?? 'Pay-as-you-go'}</td>
              <td className="numeric">{formatCurrency(event.revenueRecognized)}</td>
              <td>
                <Tag label={JE_STATUS_LABEL[event.journalEntryStatus]} tone={JE_STATUS_TONE[event.journalEntryStatus]} />
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="usage-events-table__empty">
                No usage events match “{query}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <SidePanel
          title={`Usage event ${selected.id}`}
          subtitle={`${customerName(selected.customerId)} · ${formatDateTime(selected.timestamp)}`}
          onClose={() => setSelected(null)}
        >
          <div className="side-panel__section">
            <h4>Usage detail</h4>
            <div className="side-panel__row">
              <span className="side-panel__row-label">AI model</span>
              <span className="side-panel__row-value">{selected.model}</span>
            </div>
            <div className="side-panel__row">
              <span className="side-panel__row-label">Tokens</span>
              <span className="side-panel__row-value">{formatCredits(selected.tokens)}</span>
            </div>
            <div className="side-panel__row">
              <span className="side-panel__row-label">Revenue recognized</span>
              <span className="side-panel__row-value">{formatCurrency(selected.revenueRecognized)}</span>
            </div>
          </div>

          <div className="side-panel__section">
            <h4>Contract</h4>
            <div className="side-panel__row">
              <span className="side-panel__row-label">Contract ID</span>
              <span className="side-panel__row-value">{selectedCustomer?.contractId}</span>
            </div>
            <div className="side-panel__row">
              <span className="side-panel__row-label">Contract type</span>
              <span className="side-panel__row-value">
                {selectedCustomer?.contractType === 'payg' ? 'Pay-as-you-go' : 'Prepaid credits'}
              </span>
            </div>
          </div>

          <div className="side-panel__section">
            <h4>Wallet lot</h4>
            {selectedLot ? (
              <>
                <div className="side-panel__row">
                  <span className="side-panel__row-label">Lot ID</span>
                  <span className="side-panel__row-value">{selectedLot.id}</span>
                </div>
                <div className="side-panel__row">
                  <span className="side-panel__row-label">Remaining balance</span>
                  <span className="side-panel__row-value">{formatCredits(selectedLot.remainingCredits)}</span>
                </div>
                <div className="side-panel__row">
                  <span className="side-panel__row-label">Status</span>
                  <span className="side-panel__row-value">
                    <Tag label={LOT_STATUS_LABEL[selectedLot.status]} tone={LOT_STATUS_TONE[selectedLot.status]} />
                  </span>
                </div>
              </>
            ) : (
              <p className="side-panel__explanation">
                Billed directly under a pay-as-you-go contract — no prepaid wallet is drawn down.
              </p>
            )}
          </div>

          {selectedJournalEntry && (
            <div className="side-panel__section">
              <h4>Generated journal entry</h4>
              <div className="side-panel__row">
                <span className="side-panel__row-label">Entry</span>
                <span className="side-panel__row-value">{selectedJournalEntry.id}</span>
              </div>
              <div className="side-panel__row">
                <span className="side-panel__row-label">Debit</span>
                <span className="side-panel__row-value">
                  {selectedJournalEntry.debitAccount} {formatCurrency(selectedJournalEntry.debitAmount)}
                </span>
              </div>
              <div className="side-panel__row">
                <span className="side-panel__row-label">Credit</span>
                <span className="side-panel__row-value">
                  {selectedJournalEntry.creditAccount} {formatCurrency(selectedJournalEntry.creditAmount)}
                </span>
              </div>
              <div className="side-panel__row">
                <span className="side-panel__row-label">Status</span>
                <span className="side-panel__row-value">
                  <Tag
                    label={JE_STATUS_LABEL[selectedJournalEntry.status]}
                    tone={JE_STATUS_TONE[selectedJournalEntry.status]}
                  />
                </span>
              </div>
            </div>
          )}

          <div className="side-panel__section">
            <h4>Accounting treatment</h4>
            <p className="side-panel__explanation">
              {selectedJournalEntry ? explainJournalEntry(selectedJournalEntry) : 'No journal entry generated yet.'}
            </p>
          </div>
        </SidePanel>
      )}
    </div>
  )
}
