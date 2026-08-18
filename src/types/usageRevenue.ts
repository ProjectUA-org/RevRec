export type ContractType = 'prepaid' | 'payg'

export interface Customer {
  id: string
  name: string
  contractType: ContractType
  contractId: string
}

export type WalletLotSource = 'purchase' | 'promotional' | 'rollover'
export type WalletLotStatus = 'active' | 'expiring-soon' | 'expired' | 'depleted' | 'exception'

export interface WalletLot {
  id: string
  customerId: string
  purchaseDate: string
  originalCredits: number
  remainingCredits: number
  expiration: string
  source: WalletLotSource
  status: WalletLotStatus
  breakageAmount?: number
  breakageDate?: string
}

export type JournalEntryStatus = 'posted' | 'pending' | 'exception'

export interface UsageEvent {
  id: string
  timestamp: string
  customerId: string
  model: string
  tokens: number
  walletLotId: string | null
  revenueRecognized: number
  journalEntryStatus: JournalEntryStatus
}

export interface Refund {
  id: string
  date: string
  customerId: string
  walletLotId: string
  amount: number
  reason: string
}

export type JournalEntryKind = 'usage-recognition' | 'credit-sale' | 'refund' | 'breakage'

export interface JournalEntry {
  id: string
  date: string
  customerId: string
  kind: JournalEntryKind
  description: string
  debitAccount: string
  debitAmount: number
  creditAccount: string
  creditAmount: number
  status: JournalEntryStatus
  sourceUsageEventId?: string
  walletLotId?: string
  contractId?: string
  auditTrail: string[]
}

export type ExceptionSeverity = 'high' | 'medium' | 'low'
export type ExceptionStatus = 'open' | 'in-review' | 'resolved'

export interface AccountingException {
  id: string
  type: string
  customerId: string
  severity: ExceptionSeverity
  status: ExceptionStatus
  detail: string
  suggestedAction: string
  relatedJournalEntryId?: string
  relatedWalletLotId?: string
}
