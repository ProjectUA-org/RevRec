import { useMemo } from 'react'
import { buildMonthlyPnL } from '../data/mockProfitAndLoss'
import { SummaryCard } from '../components/SummaryCard'
import { Callout } from '../components/Callout'
import { PnLTable } from '../components/PnLTable'
import { formatCurrency, formatMarginPercent } from '../utils/format'
import './ProfitAndLoss.css'

export function ProfitAndLoss() {
  const rows = useMemo(() => buildMonthlyPnL(), [])

  const totalRevenue = useMemo(() => rows.reduce((sum, r) => sum + r.totalRevenue, 0), [rows])
  const grossProfit = useMemo(() => rows.reduce((sum, r) => sum + r.grossProfit, 0), [rows])
  const operatingIncome = useMemo(() => rows.reduce((sum, r) => sum + r.operatingIncome, 0), [rows])
  const grossMarginPct = totalRevenue === 0 ? 0 : (grossProfit / totalRevenue) * 100
  const operatingMarginPct = totalRevenue === 0 ? 0 : (operatingIncome / totalRevenue) * 100

  return (
    <section className="pnl">
      <h1>Profit &amp; Loss</h1>

      <div className="pnl__cards">
        <SummaryCard label="Total revenue" value={formatCurrency(totalRevenue)} />
        <SummaryCard label="Gross margin" value={formatMarginPercent(grossMarginPct)} />
        <SummaryCard label="Operating margin" value={formatMarginPercent(operatingMarginPct)} />
      </div>

      <Callout title="Same number, same source">
        The <strong>New subscriptions</strong> line below is not a separate estimate — it's read directly
        from the same monthly reconciliation that produces the <strong>Recognized revenue</strong> column
        in the Revenue Reconciliation waterfall. It's the literal source of that recon figure, so if
        billing-platform data changes, both views move together automatically.
      </Callout>

      <div className="pnl__section">
        <PnLTable rows={rows} />
      </div>
    </section>
  )
}
