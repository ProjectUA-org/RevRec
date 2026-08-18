import { useMemo } from 'react'
import {
  ACCOUNTING_EXCEPTIONS,
  CUSTOMERS,
  WALLET_LOTS,
  buildJournalEntries,
  computeClientBalances,
  computeKpis,
} from '../data/mockUsageRevenue'
import { SummaryCard } from '../components/SummaryCard'
import { ContractPolicyTable } from '../components/ContractPolicyTable'
import { ClientBalancesTable } from '../components/ClientBalancesTable'
import { ExceptionsPanel } from '../components/ExceptionsPanel'
import { formatCurrency } from '../utils/format'
import './UsageRevenueHub.css'

export function UsageRevenueHub() {
  const kpis = useMemo(() => computeKpis(), [])
  const balances = useMemo(() => computeClientBalances(), [])
  const journalEntries = useMemo(() => buildJournalEntries(), [])

  return (
    <section className="usage-revenue-hub">
      <h1>Usage Revenue Hub</h1>
      <p className="usage-revenue-hub__subtitle">
        OpenAI's issuer-side view of client credit balances, contract liability, and accounts receivable under ASC
        606 — as of August 18, 2026.
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

      <div className="usage-revenue-hub__section">
        <h2>Client balances</h2>
        <p className="usage-revenue-hub__section-note">
          Wallet balance and contract liability are the same reconciled number for prepaid contracts — this is the
          product tying the operational wallet ledger to the accounting subledger. Expand a row for that customer's
          wallet lots and recent journal entries.
        </p>
        <ClientBalancesTable
          customers={CUSTOMERS}
          balances={balances}
          walletLots={WALLET_LOTS}
          journalEntries={journalEntries}
        />
      </div>

      <div className="usage-revenue-hub__section">
        <h2>Accounting exceptions</h2>
        <ExceptionsPanel exceptions={ACCOUNTING_EXCEPTIONS} />
      </div>
    </section>
  )
}
