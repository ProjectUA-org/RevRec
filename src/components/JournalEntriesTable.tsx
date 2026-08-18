import { Fragment, useState } from 'react'
import type { JournalEntry } from '../types/usageRevenue'
import { customerName, usageEvent, walletLot } from '../data/mockUsageRevenue'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format'
import { explainJournalEntry } from '../utils/explainJournalEntry'
import { Tag } from './Tag'
import { JE_STATUS_LABEL, JE_STATUS_TONE } from '../utils/tone'
import { Modal } from './Modal'
import './Table.css'
import './JournalEntriesTable.css'

export function JournalEntriesTable({ entries }: { entries: JournalEntry[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [explainEntry, setExplainEntry] = useState<JournalEntry | null>(null)

  return (
    <div className="table-card">
      <table className="journal-entries-table">
        <colgroup>
          <col style={{ width: '130px' }} />
          <col style={{ width: '130px' }} />
          <col style={{ width: '165px' }} />
          <col style={{ width: '175px' }} />
          <col style={{ width: '175px' }} />
          <col style={{ width: '125px' }} />
          <col style={{ width: '156px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Description</th>
            <th className="numeric">Debit</th>
            <th className="numeric">Credit</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id
            const sourceEvent = entry.sourceUsageEventId ? usageEvent(entry.sourceUsageEventId) : undefined
            const lot = walletLot(entry.walletLotId ?? null)

            return (
              <Fragment key={entry.id}>
                <tr
                  className="journal-entries-table__row"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <td>{formatDate(entry.date)}</td>
                  <td>{customerName(entry.customerId)}</td>
                  <td>{entry.description}</td>
                  <td className="numeric">
                    <div className="journal-entries-table__account">{entry.debitAccount}</div>
                    {formatCurrency(entry.debitAmount)}
                  </td>
                  <td className="numeric">
                    <div className="journal-entries-table__account">{entry.creditAccount}</div>
                    {formatCurrency(entry.creditAmount)}
                  </td>
                  <td>
                    <Tag label={JE_STATUS_LABEL[entry.status]} tone={JE_STATUS_TONE[entry.status]} variant="dot" />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="journal-entries-table__explain"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExplainEntry(entry)
                      }}
                    >
                      Explain with AI
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="journal-entries-table__detail-row">
                    <td colSpan={7}>
                      <div className="journal-entries-table__detail">
                        <div className="journal-entries-table__detail-grid">
                          <div>
                            <h4>Source usage event</h4>
                            {sourceEvent ? (
                              <p>
                                {sourceEvent.id} — {sourceEvent.product}, {formatDateTime(sourceEvent.timestamp)}
                              </p>
                            ) : (
                              <p className="journal-entries-table__muted">
                                No usage event — {entry.kind === 'credit-sale' ? 'prepaid credit purchase' : entry.kind}.
                              </p>
                            )}
                          </div>
                          <div>
                            <h4>Contract</h4>
                            <p>{entry.contractId ?? '—'}</p>
                          </div>
                          <div>
                            <h4>Wallet lot</h4>
                            <p>{lot ? `${lot.id} (${formatCurrency(lot.remainingCredits)} remaining)` : '—'}</p>
                          </div>
                        </div>

                        <div className="journal-entries-table__explanation">
                          <h4>Revenue recognition explanation</h4>
                          <p>{explainJournalEntry(entry)}</p>
                        </div>

                        <div>
                          <h4>Audit trail</h4>
                          <ol className="journal-entries-table__audit-trail">
                            {entry.auditTrail.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>

      {explainEntry && (
        <Modal title={`Explain with AI — ${explainEntry.id}`} onClose={() => setExplainEntry(null)}>
          <p>{explainJournalEntry(explainEntry)}</p>
        </Modal>
      )}
    </div>
  )
}
