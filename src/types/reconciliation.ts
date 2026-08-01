export type ReconciliationStatus = 'matched' | 'mismatch' | 'gap'

export interface Contract {
  id: string
  company: string
  customerEmail: string
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

// Layer 1 reconciliation computed live against Stripe, rather than from the static mock MRR fields.
export interface LiveContractMatch {
  contractId: string
  customerEmail: string
  billingPlatformMRR: number | null
  stripeSubscriptionId: string | null
  layer1Status: ReconciliationStatus
}

export interface LiveMonthlyNewMRR {
  month: string
  billingNewMRR: number
}

export interface LiveSubscriptionsResponse {
  fetchedAt: string
  matches: LiveContractMatch[]
  monthlyNewMRR: LiveMonthlyNewMRR[]
}
