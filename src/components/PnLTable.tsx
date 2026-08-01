import { useId, useState } from 'react'
import type { MonthlyPnL } from '../types/pnl'
import { formatCurrency, formatMarginPercent, formatMonth } from '../utils/format'
import { MonthOverMonthChart } from './MonthOverMonthChart'
import './Table.css'
import './PnLTable.css'

interface Line {
  label: string
  values: (row: MonthlyPnL) => number
  kind?: 'line' | 'subtotal' | 'highlight'
}

interface Section {
  heading: string
  lines: Line[]
  subtotal: Line
}

const REVENUE_SECTION: Section = {
  heading: 'Revenue',
  lines: [
    { label: 'New subscriptions', values: (r) => r.newSubscriptions, kind: 'highlight' },
    { label: 'Expansion & upsell', values: (r) => r.expansion },
    { label: 'Renewals', values: (r) => r.renewals },
    { label: 'Professional services', values: (r) => r.professionalServices },
    { label: 'Less: refunds & credits', values: (r) => r.refundsAndCredits },
  ],
  subtotal: { label: 'Total revenue', values: (r) => r.totalRevenue, kind: 'subtotal' },
}

const COST_OF_REVENUE_SECTION: Section = {
  heading: 'Cost of revenue',
  lines: [
    { label: 'Hosting & infrastructure', values: (r) => r.hostingAndInfrastructure },
    { label: 'Customer success & support', values: (r) => r.customerSuccess },
  ],
  subtotal: { label: 'Total cost of revenue', values: (r) => r.totalCostOfRevenue, kind: 'subtotal' },
}

const OPERATING_EXPENSE_SECTION: Section = {
  heading: 'Operating expenses',
  lines: [
    { label: 'Sales & marketing', values: (r) => r.salesAndMarketing },
    { label: 'Research & development', values: (r) => r.researchAndDevelopment },
    { label: 'General & administrative', values: (r) => r.generalAndAdministrative },
  ],
  subtotal: { label: 'Total operating expenses', values: (r) => r.totalOperatingExpenses, kind: 'subtotal' },
}

function sumAcross(rows: MonthlyPnL[], values: (row: MonthlyPnL) => number): number {
  return rows.reduce((sum, row) => sum + values(row), 0)
}

export function PnLTable({ rows }: { rows: MonthlyPnL[] }) {
  const [showOperatingIncomeChart, setShowOperatingIncomeChart] = useState(false)
  const operatingIncomeChartId = useId()

  const renderLineRow = (line: Line, key: string) => (
    <tr key={key} className={line.kind === 'highlight' ? 'pnl-table__highlight' : undefined}>
      <td>{line.label}</td>
      {rows.map((row) => (
        <td key={row.month} className="numeric">
          {formatCurrency(line.values(row))}
        </td>
      ))}
      <td className="numeric">{formatCurrency(sumAcross(rows, line.values))}</td>
    </tr>
  )

  const renderSubtotalRow = (line: Line, key: string) => (
    <tr key={key} className="pnl-table__subtotal">
      <td>{line.label}</td>
      {rows.map((row) => (
        <td key={row.month} className="numeric">
          {formatCurrency(line.values(row))}
        </td>
      ))}
      <td className="numeric">{formatCurrency(sumAcross(rows, line.values))}</td>
    </tr>
  )

  const renderSection = (section: Section) => (
    <>
      <tr className="pnl-table__section">
        <td colSpan={rows.length + 2}>{section.heading}</td>
      </tr>
      {section.lines.map((line) => renderLineRow(line, `${section.heading}-${line.label}`))}
      {renderSubtotalRow(section.subtotal, `${section.heading}-subtotal`)}
    </>
  )

  const grossProfitTotal = sumAcross(rows, (r) => r.grossProfit)
  const totalRevenueTotal = sumAcross(rows, (r) => r.totalRevenue)
  const operatingIncomeTotal = sumAcross(rows, (r) => r.operatingIncome)

  return (
    <div className="table-card">
      <table className="pnl-table">
        <thead>
          <tr>
            <th>Line item</th>
            {rows.map((row) => (
              <th key={row.month} className="numeric">
                {formatMonth(row.month)}
              </th>
            ))}
            <th className="numeric">Total</th>
          </tr>
        </thead>
        <tbody>
          {renderSection(REVENUE_SECTION)}
          {renderSection(COST_OF_REVENUE_SECTION)}

          <tr className="pnl-table__subtotal pnl-table__subtotal--emphasis">
            <td>Gross profit</td>
            {rows.map((row) => (
              <td key={row.month} className="numeric">
                {formatCurrency(row.grossProfit)}
              </td>
            ))}
            <td className="numeric">{formatCurrency(grossProfitTotal)}</td>
          </tr>
          <tr className="pnl-table__margin">
            <td>Gross margin %</td>
            {rows.map((row) => (
              <td key={row.month} className="numeric">
                {formatMarginPercent(row.grossMarginPct)}
              </td>
            ))}
            <td className="numeric">
              {formatMarginPercent(totalRevenueTotal === 0 ? 0 : (grossProfitTotal / totalRevenueTotal) * 100)}
            </td>
          </tr>

          {renderSection(OPERATING_EXPENSE_SECTION)}

          <tr className="pnl-table__subtotal pnl-table__subtotal--emphasis">
            <td>
              <button
                type="button"
                className="pnl-table__row-toggle"
                aria-expanded={showOperatingIncomeChart}
                aria-controls={operatingIncomeChartId}
                onClick={() => setShowOperatingIncomeChart((open) => !open)}
              >
                <span
                  className={`pnl-table__chevron ${showOperatingIncomeChart ? 'pnl-table__chevron--open' : ''}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                Operating income
              </button>
            </td>
            {rows.map((row) => (
              <td key={row.month} className="numeric">
                {formatCurrency(row.operatingIncome)}
              </td>
            ))}
            <td className="numeric">{formatCurrency(operatingIncomeTotal)}</td>
          </tr>
          {showOperatingIncomeChart && (
            <tr id={operatingIncomeChartId}>
              <td colSpan={rows.length + 2} className="pnl-table__chart-cell">
                <MonthOverMonthChart data={rows.map((row) => ({ month: row.month, value: row.operatingIncome }))} />
              </td>
            </tr>
          )}
          <tr className="pnl-table__margin">
            <td>Operating margin %</td>
            {rows.map((row) => (
              <td key={row.month} className="numeric">
                {formatMarginPercent(row.operatingMarginPct)}
              </td>
            ))}
            <td className="numeric">
              {formatMarginPercent(totalRevenueTotal === 0 ? 0 : (operatingIncomeTotal / totalRevenueTotal) * 100)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
