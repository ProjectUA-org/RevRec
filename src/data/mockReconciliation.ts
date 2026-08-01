import type { Contract, MonthlyReconciliation, ReconciliationStatus } from '../types/reconciliation'

export const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08']

export const CONTRACTS: Contract[] = [
  // 2026-03
  { id: 'c01', company: 'Acme Robotics', package: 'Growth', month: '2026-03', contractMRR: 3200, billingPlatformMRR: 3200 },
  { id: 'c02', company: 'Northwind Retail', package: 'Starter', month: '2026-03', contractMRR: 1200, billingPlatformMRR: 1200 },
  { id: 'c03', company: 'Blue Harbor Logistics', package: 'Enterprise', month: '2026-03', contractMRR: 7800, billingPlatformMRR: 7500 },
  { id: 'c04', company: 'Fenwick & Cole', package: 'Starter', month: '2026-03', contractMRR: 950, billingPlatformMRR: null },

  // 2026-04
  { id: 'c05', company: 'Solace Analytics', package: 'Growth', month: '2026-04', contractMRR: 4100, billingPlatformMRR: 4100 },
  { id: 'c06', company: 'Vantage Health', package: 'Enterprise', month: '2026-04', contractMRR: 8900, billingPlatformMRR: 8900 },
  { id: 'c07', company: 'Cobalt Systems', package: 'Growth', month: '2026-04', contractMRR: 2600, billingPlatformMRR: 2400 },
  { id: 'c08', company: 'Meridian Foods', package: 'Starter', month: '2026-04', contractMRR: 1100, billingPlatformMRR: 1100 },

  // 2026-05
  { id: 'c09', company: 'Lumen Studios', package: 'Scale', month: '2026-05', contractMRR: 11200, billingPlatformMRR: 11200 },
  { id: 'c10', company: 'Pinecrest Capital', package: 'Enterprise', month: '2026-05', contractMRR: 6700, billingPlatformMRR: 6700 },
  { id: 'c11', company: 'Harbor Point Media', package: 'Growth', month: '2026-05', contractMRR: 3300, billingPlatformMRR: null },
  { id: 'c12', company: 'Quill & Ink', package: 'Starter', month: '2026-05', contractMRR: 890, billingPlatformMRR: 950 },

  // 2026-06
  { id: 'c13', company: 'Redshift Labs', package: 'Scale', month: '2026-06', contractMRR: 13400, billingPlatformMRR: 13400 },
  { id: 'c14', company: 'Sable Financial', package: 'Enterprise', month: '2026-06', contractMRR: 7200, billingPlatformMRR: 7200 },
  { id: 'c15', company: 'Terra Nova Energy', package: 'Growth', month: '2026-06', contractMRR: 3900, billingPlatformMRR: 3600 },
  { id: 'c16', company: 'Ashgrove Partners', package: 'Starter', month: '2026-06', contractMRR: 1050, billingPlatformMRR: 1050 },

  // 2026-07
  { id: 'c17', company: 'Brightline Media', package: 'Growth', month: '2026-07', contractMRR: 4400, billingPlatformMRR: 4400 },
  { id: 'c18', company: 'Cedar Peak Software', package: 'Enterprise', month: '2026-07', contractMRR: 9100, billingPlatformMRR: 8700 },
  { id: 'c19', company: 'Driftwood Goods', package: 'Starter', month: '2026-07', contractMRR: 1000, billingPlatformMRR: null },
  { id: 'c20', company: 'Everline Insurance', package: 'Scale', month: '2026-07', contractMRR: 12800, billingPlatformMRR: 12800 },

  // 2026-08
  { id: 'c21', company: 'Halcyon Group', package: 'Growth', month: '2026-08', contractMRR: 3700, billingPlatformMRR: 3700 },
  { id: 'c22', company: 'Amberline Foods', package: 'Starter', month: '2026-08', contractMRR: 970, billingPlatformMRR: 970 },
  { id: 'c23', company: 'Kestrel Systems', package: 'Enterprise', month: '2026-08', contractMRR: 8300, billingPlatformMRR: null },
  { id: 'c24', company: 'Palisade Media', package: 'Growth', month: '2026-08', contractMRR: 2900, billingPlatformMRR: 2750 },
]

// Recognized revenue as a fraction of that month's billing-platform MRR — hand-tuned
// per month to surface a mix of matched/mismatch/gap outcomes in the waterfall.
const RECOGNIZED_REVENUE_FACTOR: Record<string, number> = {
  '2026-03': 1.0,
  '2026-04': 0.985,
  '2026-05': 1.07,
  '2026-06': 0.6,
  '2026-07': 0.98,
  '2026-08': 0.92,
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
