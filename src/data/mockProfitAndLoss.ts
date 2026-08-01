import { MONTHS, buildMonthlyReconciliation } from './mockReconciliation'
import type { MonthlyPnL } from '../types/pnl'

// Other revenue lines, and the cost/expense structure below, are illustrative
// P&L figures — not derived from the reconciliation data. Only newSubscriptions
// is a real figure: it's read from buildMonthlyReconciliation() so it can never
// drift from the Recognized Revenue column in the Revenue Reconciliation waterfall.
const EXPANSION_REVENUE: Record<string, number> = { '2026-06': 950, '2026-07': 1080, '2026-08': 1150 }
const RENEWALS_REVENUE: Record<string, number> = { '2026-06': 2400, '2026-07': 2550, '2026-08': 2700 }
const PROFESSIONAL_SERVICES_REVENUE: Record<string, number> = { '2026-06': 600, '2026-07': 450, '2026-08': 900 }
const REFUNDS_AND_CREDITS: Record<string, number> = { '2026-06': -180, '2026-07': -220, '2026-08': -150 }

const HOSTING_AND_INFRASTRUCTURE: Record<string, number> = { '2026-06': 1450, '2026-07': 1500, '2026-08': 1520 }
const CUSTOMER_SUCCESS: Record<string, number> = { '2026-06': 2100, '2026-07': 2150, '2026-08': 2180 }

const SALES_AND_MARKETING: Record<string, number> = { '2026-06': 5200, '2026-07': 5300, '2026-08': 5350 }
const RESEARCH_AND_DEVELOPMENT: Record<string, number> = { '2026-06': 3800, '2026-07': 3850, '2026-08': 3900 }
const GENERAL_AND_ADMINISTRATIVE: Record<string, number> = { '2026-06': 1900, '2026-07': 1950, '2026-08': 1980 }

export function buildMonthlyPnL(): MonthlyPnL[] {
  const recognizedRevenueByMonth = new Map(
    buildMonthlyReconciliation().map((row) => [row.month, row.recognizedRevenue]),
  )

  return MONTHS.map((month) => {
    const newSubscriptions = recognizedRevenueByMonth.get(month) ?? 0
    const expansion = EXPANSION_REVENUE[month] ?? 0
    const renewals = RENEWALS_REVENUE[month] ?? 0
    const professionalServices = PROFESSIONAL_SERVICES_REVENUE[month] ?? 0
    const refundsAndCredits = REFUNDS_AND_CREDITS[month] ?? 0
    const totalRevenue = newSubscriptions + expansion + renewals + professionalServices + refundsAndCredits

    const hostingAndInfrastructure = HOSTING_AND_INFRASTRUCTURE[month] ?? 0
    const customerSuccess = CUSTOMER_SUCCESS[month] ?? 0
    const totalCostOfRevenue = hostingAndInfrastructure + customerSuccess

    const grossProfit = totalRevenue - totalCostOfRevenue
    const grossMarginPct = totalRevenue === 0 ? 0 : (grossProfit / totalRevenue) * 100

    const salesAndMarketing = SALES_AND_MARKETING[month] ?? 0
    const researchAndDevelopment = RESEARCH_AND_DEVELOPMENT[month] ?? 0
    const generalAndAdministrative = GENERAL_AND_ADMINISTRATIVE[month] ?? 0
    const totalOperatingExpenses = salesAndMarketing + researchAndDevelopment + generalAndAdministrative

    const operatingIncome = grossProfit - totalOperatingExpenses
    const operatingMarginPct = totalRevenue === 0 ? 0 : (operatingIncome / totalRevenue) * 100

    return {
      month,
      newSubscriptions,
      expansion,
      renewals,
      professionalServices,
      refundsAndCredits,
      totalRevenue,
      hostingAndInfrastructure,
      customerSuccess,
      totalCostOfRevenue,
      grossProfit,
      grossMarginPct,
      salesAndMarketing,
      researchAndDevelopment,
      generalAndAdministrative,
      totalOperatingExpenses,
      operatingIncome,
      operatingMarginPct,
    }
  })
}
