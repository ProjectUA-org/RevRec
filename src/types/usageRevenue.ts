export type ContractType = 'prepaid' | 'payg'
export type MeteringUnit = 'tokens' | 'gpu-minutes' | 'api-requests'

export interface Customer {
  id: string
  name: string
  legalEntity: string
  contractType: ContractType
  meteringUnit: MeteringUnit
  contractId: string
  expirationPolicy: string
  refundable: boolean
  autoRecharge: boolean
}

export type WalletLotSource = 'purchase' | 'promotional' | 'rollover'
export type WalletLotStatus = 'active' | 'expiring-soon' | 'expired' | 'depleted'

export interface WalletLot {
  id: string
  customerId: string
  issueDate: string
  originalCredits: number
  remainingCredits: number
  expiration: string
  source: WalletLotSource
  status: WalletLotStatus
  breakageAmount?: number
  breakageDate?: string
  remittanceAmount?: number
  remittanceDate?: string
  remittanceStatus?: 'pending' | 'remitted'
}

export type JournalEntryStatus = 'posted' | 'pending' | 'exception'

export interface UsageEvent {
  id: string
  timestamp: string
  customerId: string
  product: string
  unitsConsumed: number
  unitLabel: string
  walletLotId: string | null
  revenueRecognized: number
  journalEntryStatus: JournalEntryStatus
}

export type BillingEventKind = 'invoice-credit-sale' | 'cash-credit-sale' | 'invoice-usage' | 'collection' | 'refund'
export type BillingEventStatus = 'outstanding' | 'collected' | 'refunded'

export interface BillingEvent {
  id: string
  date: string
  customerId: string
  kind: BillingEventKind
  description: string
  amount: number
  status: BillingEventStatus
  walletLotId?: string
  relatedInvoiceId?: string
}

export type JournalEntryKind =
  | 'usage-recognition'
  | 'credit-sale'
  | 'collection'
  | 'refund'
  | 'breakage'
  | 'remittance-reclass'
  | 'promotional-grant'

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
