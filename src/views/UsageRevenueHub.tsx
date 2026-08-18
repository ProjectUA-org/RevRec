import { useMemo } from 'react'
import {
  ACCOUNTING_EXCEPTIONS,
  BILLING_EVENTS,
  CUSTOMERS,
  USAGE_EVENTS,
  WALLET_LOTS,
  buildJournalEntries,
  computeKpis,
  computeRollforward,
  computeWaterfall,
} from '../data/mockUsageRevenue'
import { SummaryCard } from '../components/SummaryCard'
import { ContractPolicyTable } from '../components/ContractPolicyTable'
import { BillingCollectionsTable } from '../components/BillingCollectionsTable'
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
        OpenAI's issuer-side view of how prepaid API credits and pay-as-you-go usage flow into recognized revenue
        under ASC 606 — as of August 18, 2026.
      </p>

      <div className="usage-revenue-hub__cards">
        <SummaryCard label="Revenue recognized (MTD)" value={formatCurrency(kpis.revenueRecognizedMtd)} hint="All revenue types" />
        <SummaryCard label="Contract liability" value={formatCurrency(kpis.contractLiability)} hint="Ending balance, all wallets" />
        <SummaryCard label="Accounts receivable" value={formatCurrency(kpis.accountsReceivable)} hint="Invoiced, not yet collected" />
        <SummaryCard label="Credits consumed today" value={formatCurrency(kpis.creditsConsumedToday)} hint="Aug 18, 2026" />
        <SummaryCard
          label="Estimated breakage"
          value={formatCurrency(kpis.breakageRecognizedMtd + kpis.breakageProjected)}
          hint={`${formatCurrency(kpis.breakageRecognizedMtd)} recognized MTD · ${formatCurrency(kpis.breakageProjected)} projected`}
        />
        <SummaryCard label="Accounting exceptions" value={String(kpis.openExceptionCount)} hint="Requiring review" />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Contracts &amp; wallet policy</h2>
        <p className="usage-revenue-hub__section-note">
          Pricing model, metering unit, expiration policy, refundability, legal entity, and paid vs. promotional
          balances are captured per contract, since they drive different accounting outcomes.
        </p>
        <ContractPolicyTable customers={CUSTOMERS} />
      </div>

      <div className="usage-revenue-hub__journey">
        <h2>Journey 1 — Sell credits &amp; fund the wallet</h2>
        <p className="usage-revenue-hub__section-note">
          A prepayment for future usage is a contract liability, not revenue, whether cash arrives up front or the
          customer is invoiced first. Billing state is tracked separately from revenue state.
        </p>
        <div className="usage-revenue-hub__section">
          <h3>Billing &amp; collections</h3>
          <BillingCollectionsTable events={BILLING_EVENTS} />
        </div>
        <div className="usage-revenue-hub__section">
          <h3>Wallet lots</h3>
          <WalletLotsTable lots={WALLET_LOTS} />
        </div>
      </div>

      <div className="usage-revenue-hub__journey">
        <h2>Journey 2 — Deliver service &amp; earn revenue</h2>
        <p className="usage-revenue-hub__section-note">
          The earning event is consumption, not purchase: usage burns the correct wallet lot (or bills in arrears for
          pay-as-you-go) and revenue is recognized in the period the service was delivered.
        </p>
        <div className="usage-revenue-hub__section">
          <h3>Revenue recognition waterfall</h3>
          <RevenueWaterfallFlow stages={waterfall} />
        </div>
        <div className="usage-revenue-hub__section">
          <h3>Usage events</h3>
          <UsageEventsTable events={USAGE_EVENTS} journalEntries={journalEntries} />
        </div>
      </div>

      <div className="usage-revenue-hub__journey">
        <h2>Journey 3 — Resolve unused balances</h2>
        <p className="usage-revenue-hub__section-note">
          Expiration and rollover are workflow triggers, not automatic revenue events. Unused balances are resolved
          as breakage (recognized in proportion to usage, or at the point further redemption becomes remote), as a
          refund, or — where required by jurisdiction — reclassified to a remittance liability instead of revenue.
        </p>
        <div className="usage-revenue-hub__section">
          <h3>Contract liability rollforward</h3>
          <RollforwardTable rows={rollforward} />
        </div>
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Revenue subledger — journal entries</h2>
        <p className="usage-revenue-hub__section-note">
          Contract liability, receivable, cash, and revenue entries generated automatically from wallet and usage
          activity, ready for period-end rollforwards and JE export.
        </p>
        <JournalEntriesTable entries={journalEntries} />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Accounting exceptions</h2>
        <ExceptionsPanel exceptions={ACCOUNTING_EXCEPTIONS} />
      </div>
    </section>
  )
}
