import { useMemo } from 'react'
import { CONTRACTS, MONTHS, buildMonthlyReconciliation, layer1Status } from '../data/mockReconciliation'
import type { ReconciliationStatus, StatusCounts } from '../types/reconciliation'
import { SummaryCard } from '../components/SummaryCard'
import { StatusBanner } from '../components/StatusBanner'
import { WaterfallTable } from '../components/WaterfallTable'
import { ContractsTable } from '../components/ContractsTable'
import { formatCurrency } from '../utils/format'
import './RevenueReconciliation.css'

function countStatuses(statuses: ReconciliationStatus[]): StatusCounts {
  return statuses.reduce<StatusCounts>(
    (acc, status) => {
      acc[status] += 1
      return acc
    },
    { matched: 0, mismatch: 0, gap: 0 },
  )
}

export function RevenueReconciliation() {
  const monthlyRows = useMemo(() => buildMonthlyReconciliation(), [])

  const contractMRR = useMemo(() => CONTRACTS.reduce((sum, c) => sum + c.contractMRR, 0), [])
  const contractARR = contractMRR * 12

  const layer1Counts = useMemo(() => countStatuses(CONTRACTS.map(layer1Status)), [])
  const layer2Counts = useMemo(() => countStatuses(monthlyRows.map((row) => row.status)), [monthlyRows])

  return (
    <section className="reconciliation">
      <h1>Revenue Reconciliation</h1>

      <div className="reconciliation__cards">
        <SummaryCard label="Signed contracts" value={String(CONTRACTS.length)} />
        <SummaryCard label="Contract ARR" value={formatCurrency(contractARR)} />
        <SummaryCard label="Contract MRR" value={formatCurrency(contractMRR)} />
      </div>

      <div className="reconciliation__banners">
        <StatusBanner
          title="Layer 1"
          subtitle="Signed contract ↔ billing platform"
          counts={layer1Counts}
        />
        <StatusBanner
          title="Layer 2"
          subtitle="Billing platform ↔ recognized revenue"
          counts={layer2Counts}
        />
      </div>

      <div className="reconciliation__section">
        <h2>Monthly waterfall</h2>
        <WaterfallTable rows={monthlyRows} />
      </div>

      <div className="reconciliation__section">
        <h2>Contracts</h2>
        <ContractsTable contracts={CONTRACTS} months={MONTHS} />
      </div>
    </section>
  )
}
