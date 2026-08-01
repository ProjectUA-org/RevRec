import type { Contract, MonthlyReconciliation, ReconciliationStatus } from '../types/reconciliation'

export const MONTHS = ['2026-06', '2026-07', '2026-08']

export const CONTRACTS: Contract[] = [
  // 2026-06
  { id: 'c01', company: 'Harborline Media', package: 'Growth', month: '2026-06', contractMRR: 3800, billingPlatformMRR: 3800 },
  { id: 'c02', company: 'Vesper Analytics', package: 'Enterprise', month: '2026-06', contractMRR: 8200, billingPlatformMRR: 8200 },

  // 2026-07
  { id: 'c03', company: 'Coral Peak Outfitters', package: 'Starter', month: '2026-07', contractMRR: 1150, billingPlatformMRR: 1150 },
  // Deliberate mismatch: signed at $12,500/mo, billing platform only reflects $9,800/mo.
  { id: 'c04', company: 'Ridgeline Freight', package: 'Scale', month: '2026-07', contractMRR: 12500, billingPlatformMRR: 9800 },
  // Deliberate gap: signed but never set up in the billing platform.
  { id: 'c05', company: 'Thistle & Vine Co.', package: 'Growth', month: '2026-07', contractMRR: 2950, billingPlatformMRR: null },

  // 2026-08
  { id: 'c06', company: 'Northstar Biotech', package: 'Enterprise', month: '2026-08', contractMRR: 7600, billingPlatformMRR: 7600 },
  { id: 'c07', company: 'Milltown Hardware', package: 'Starter', month: '2026-08', contractMRR: 990, billingPlatformMRR: 990 },
]

// Recognized revenue as a fraction of that month's billing-platform MRR — hand-tuned
// per month to surface a mix of matched/mismatch/gap outcomes in the waterfall.
const RECOGNIZED_REVENUE_FACTOR: Record<string, number> = {
  '2026-06': 1.0,
  '2026-07': 1.0,
  '2026-08': 1.0,
}

export function layer1Status(contract: Contract): ReconciliationStatus {
  if (contract.billingPlatformMRR === null) return 'gap'
  return contract.contractMRR === contract.billingPlatformMRR ? 'matched' : 'mismatch'
}

function variantStatus(variancePct: number, hasZeroLeg: boolean): ReconciliationStatus {
  if (hasZeroLeg) return 'gap'
  const abs = Math.abs(variancePct)
  if (abs <= 3) return 'matched'
  if (abs <= 15) return 'mismatch'
  return 'gap'
}

export function buildMonthlyReconciliation(): MonthlyReconciliation[] {
  return MONTHS.map((month) => {
    const contractsInMonth = CONTRACTS.filter((c) => c.month === month)
    const contractedMRR = contractsInMonth.reduce((sum, c) => sum + c.contractMRR, 0)
    const billingNewMRR = contractsInMonth.reduce((sum, c) => sum + (c.billingPlatformMRR ?? 0), 0)
    const recognizedRevenue = Math.round(billingNewMRR * RECOGNIZED_REVENUE_FACTOR[month])
    const variancePct = billingNewMRR === 0 ? 0 : ((recognizedRevenue - billingNewMRR) / billingNewMRR) * 100

    return {
      month,
      contractedMRR,
      billingNewMRR,
      recognizedRevenue,
      variancePct,
      status: variantStatus(variancePct, billingNewMRR === 0 || recognizedRevenue === 0),
    }
  })
}
