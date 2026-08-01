export type ReconciliationStatus = 'matched' | 'mismatch' | 'gap'

export interface Contract {
  id: string
  company: string
  package: string
  month: string
  contractMRR: number
  billingPlatformMRR: number | null
}

export interface MonthlyReconciliation {
  month: string
  contractedMRR: number
  billingNewMRR: number
  recognizedRevenue: number
  variancePct: number
  status: ReconciliationStatus
}

export interface StatusCounts {
  matched: number
  mismatch: number
  gap: number
}
