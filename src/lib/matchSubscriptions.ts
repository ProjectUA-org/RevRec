import type { Contract, LiveContractMatch, LiveMonthlyNewMRR, ReconciliationStatus } from '../types/reconciliation'

// Layer 1 tolerance: contract price vs. live billing price within 5% counts as matched.
const LAYER1_TOLERANCE_PCT = 0.05

export interface NormalizedSubscription {
  id: string
  customerEmail: string
  monthlyAmount: number
}

export function layer1StatusFromMRR(contractMRR: number, billingMRR: number | null): ReconciliationStatus {
  if (billingMRR === null) return 'gap'
  if (contractMRR === 0) return billingMRR === 0 ? 'matched' : 'mismatch'
  const diffPct = Math.abs(billingMRR - contractMRR) / contractMRR
  return diffPct <= LAYER1_TOLERANCE_PCT ? 'matched' : 'mismatch'
}

export function matchContractsToSubscriptions(
  contracts: Contract[],
  subscriptions: NormalizedSubscription[],
): LiveContractMatch[] {
  const byEmail = new Map<string, NormalizedSubscription[]>()
  for (const subscription of subscriptions) {
    const key = subscription.customerEmail.trim().toLowerCase()
    const existing = byEmail.get(key)
    if (existing) {
      existing.push(subscription)
    } else {
      byEmail.set(key, [subscription])
    }
  }

  return contracts.map((contract) => {
    const matches = byEmail.get(contract.customerEmail.trim().toLowerCase()) ?? []
    const billingPlatformMRR = matches.length > 0 ? matches.reduce((sum, s) => sum + s.monthlyAmount, 0) : null

    return {
      contractId: contract.id,
      customerEmail: contract.customerEmail,
      billingPlatformMRR,
      stripeSubscriptionId: matches[0]?.id ?? null,
      layer1Status: layer1StatusFromMRR(contract.contractMRR, billingPlatformMRR),
    }
  })
}

export function computeMonthlyNewMRR(contracts: Contract[], matches: LiveContractMatch[]): LiveMonthlyNewMRR[] {
  const billingMRRByContractId = new Map(matches.map((m) => [m.contractId, m.billingPlatformMRR]))
  const months = [...new Set(contracts.map((c) => c.month))].sort()

  return months.map((month) => ({
    month,
    billingNewMRR: contracts
      .filter((c) => c.month === month)
      .reduce((sum, c) => sum + (billingMRRByContractId.get(c.id) ?? 0), 0),
  }))
}
