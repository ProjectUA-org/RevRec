import { useMemo } from 'react'
import {
  ACCOUNTING_EXCEPTIONS,
  USAGE_EVENTS,
  WALLET_LOTS,
  buildJournalEntries,
  computeKpis,
  computeRollforward,
  computeWaterfall,
} from '../data/mockUsageRevenue'
import { SummaryCard } from '../components/SummaryCard'
import { RevenueWaterfallFlow } from '../components/RevenueWaterfallFlow'
import { RollforwardTable } from '../components/RollforwardTable'
import { WalletLotsTable } from '../components/WalletLotsTable'
import { UsageEventsTable } from '../components/UsageEventsTable'
import { JournalEntriesTable } from '../components/JournalEntriesTable'
import { ExceptionsPanel } from '../components/ExceptionsPanel'
import { formatCurrency } from '../utils/format'
import './UsageRevenueHub.css'

export function UsageRevenueHub() {
  const kpis = useMemo(() => computeKpis(), [])
  const waterfall = useMemo(() => computeWaterfall(), [])
  const rollforward = useMemo(() => computeRollforward(), [])
  const journalEntries = useMemo(() => buildJournalEntries(), [])

  return (
    <section className="usage-revenue-hub">
      <h1>Usage Revenue Hub</h1>
      <p className="usage-revenue-hub__subtitle">
        How prepaid usage credits flow into recognized revenue under ASC 606 — as of August 18, 2026.
      </p>

      <div className="usage-revenue-hub__cards">
        <SummaryCard label="Revenue recognized (MTD)" value={formatCurrency(kpis.revenueRecognizedMtd)} hint="All revenue types" />
        <SummaryCard
          label="Contract liability"
          value={formatCurrency(kpis.contractLiability)}
          hint={`Incl. 1 flagged exception (−${formatCurrency(kpis.outstandingCredits - kpis.contractLiability)})`}
        />
        <SummaryCard label="Outstanding credits" value={formatCurrency(kpis.outstandingCredits)} hint="Wallet balances across 8 customers" />
        <SummaryCard label="Credits consumed today" value={formatCurrency(kpis.creditsConsumedToday)} hint="Aug 18, 2026" />
        <SummaryCard
          label="Estimated breakage"
          value={formatCurrency(kpis.breakageRecognizedMtd + kpis.breakageProjected)}
          hint={`${formatCurrency(kpis.breakageRecognizedMtd)} recognized MTD · ${formatCurrency(kpis.breakageProjected)} projected`}
        />
        <SummaryCard
          label="Accounting exceptions"
          value={String(kpis.openExceptionCount)}
          hint="Requiring review"
        />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Revenue recognition waterfall</h2>
        <RevenueWaterfallFlow stages={waterfall} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Contract liability rollforward</h2>
        <RollforwardTable rows={rollforward} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Wallet lots</h2>
        <WalletLotsTable lots={WALLET_LOTS} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Usage events</h2>
        <UsageEventsTable events={USAGE_EVENTS} journalEntries={journalEntries} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Journal entries</h2>
        <JournalEntriesTable entries={journalEntries} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Accounting exceptions</h2>
        <ExceptionsPanel exceptions={ACCOUNTING_EXCEPTIONS} />
      </div>
    </section>
  )
}
