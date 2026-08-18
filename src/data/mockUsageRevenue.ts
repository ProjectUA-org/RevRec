import type {
  AccountingException,
  BillingEvent,
  Customer,
  JournalEntry,
  UsageEvent,
  WalletLot,
  WalletLotStatus,
} from '../types/usageRevenue'

// Fixed "as of" date for the demo so the story (expiring lots, "today" totals,
// exception aging) stays stable no matter when this app is viewed.
export const TODAY = new Date('2026-08-18T00:00:00Z')
const DAY_MS = 24 * 60 * 60 * 1000

// This dashboard models OpenAI as the issuer: it sells prepaid API credit
// wallets (and, for one customer, pay-as-you-go access) to enterprise
// customers who consume GPT-5-family models against those balances.
export const CUSTOMERS: Customer[] = [
  {
    id: 'beacon',
    name: 'Beacon Robotics',
    legalEntity: 'OpenAI, Inc. (US)',
    contractType: 'prepaid',
    meteringUnit: 'gpu-minutes',
    contractId: 'CT-BEACON-01',
    expirationPolicy: '12 months from issuance',
    refundable: false,
    autoRecharge: true,
  },
  {
    id: 'northwind',
    name: 'Northwind Analytics',
    legalEntity: 'OpenAI, Inc. (US)',
    contractType: 'prepaid',
    meteringUnit: 'tokens',
    contractId: 'CT-NORTHWIND-01',
    expirationPolicy: '12 months from issuance',
    refundable: true,
    autoRecharge: false,
  },
  {
    id: 'lumen',
    name: 'Lumen Health',
    legalEntity: 'OpenAI Ireland Ltd. (IE)',
    contractType: 'prepaid',
    meteringUnit: 'api-requests',
    contractId: 'CT-LUMEN-01',
    expirationPolicy: '16 months from issuance',
    refundable: false,
    autoRecharge: false,
  },
  {
    id: 'cascade',
    name: 'Cascade Logistics',
    legalEntity: 'OpenAI, Inc. (US)',
    contractType: 'prepaid',
    meteringUnit: 'tokens',
    contractId: 'CT-CASCADE-01',
    expirationPolicy: '12 months (paid) / 90 days (promotional)',
    refundable: false,
    autoRecharge: false,
  },
  {
    id: 'argon',
    name: 'Argon Studios',
    legalEntity: 'OpenAI, Inc. (US)',
    contractType: 'payg',
    meteringUnit: 'api-requests',
    contractId: 'CT-ARGON-01',
    expirationPolicy: 'N/A — billed in arrears',
    refundable: false,
    autoRecharge: false,
  },
]

export function customerName(customerId: string): string {
  return CUSTOMERS.find((c) => c.id === customerId)?.name ?? customerId
}

function deriveLotStatus(remainingCredits: number, expiration: string): WalletLotStatus {
  const daysToExpiry = (new Date(`${expiration}T00:00:00Z`).getTime() - TODAY.getTime()) / DAY_MS
  if (remainingCredits === 0) return daysToExpiry <= 0 ? 'expired' : 'depleted'
  if (daysToExpiry <= 0) return 'expired'
  if (daysToExpiry <= 30) return 'expiring-soon'
  return 'active'
}

type RawLot = Omit<WalletLot, 'status'>

const RAW_WALLET_LOTS: RawLot[] = [
  // Beacon Robotics — GPU-minutes, auto-recharge enabled. Active lot, an
  // older lot expiring in two weeks, a rollover lot, and a fresh August lot
  // that was invoiced (not paid up front) and is still outstanding.
  { id: 'WL-B1', customerId: 'beacon', issueDate: '2026-02-01', originalCredits: 2_000_000, remainingCredits: 850_000, expiration: '2027-02-01', source: 'purchase' },
  { id: 'WL-B2', customerId: 'beacon', issueDate: '2026-05-01', originalCredits: 500_000, remainingCredits: 120_000, expiration: '2026-09-01', source: 'purchase' },
  { id: 'WL-B3', customerId: 'beacon', issueDate: '2026-08-01', originalCredits: 80_000, remainingCredits: 80_000, expiration: '2027-02-01', source: 'rollover' },
  { id: 'WL-B4', customerId: 'beacon', issueDate: '2026-08-01', originalCredits: 500_000, remainingCredits: 500_000, expiration: '2027-08-01', source: 'purchase' },

  // Northwind Analytics — tokens. Active lot with a partial refund, an
  // expired lot whose small unused balance was recognized as breakage via
  // the remote method, and a fresh cash-upfront August lot.
  { id: 'WL-N1', customerId: 'northwind', issueDate: '2026-03-01', originalCredits: 400_000, remainingCredits: 175_000, expiration: '2027-03-01', source: 'purchase' },
  { id: 'WL-N2', customerId: 'northwind', issueDate: '2025-06-01', originalCredits: 150_000, remainingCredits: 0, expiration: '2026-08-01', source: 'purchase', breakageAmount: 18_000, breakageDate: '2026-08-01' },
  { id: 'WL-N3', customerId: 'northwind', issueDate: '2026-08-05', originalCredits: 100_000, remainingCredits: 100_000, expiration: '2027-08-05', source: 'purchase' },

  // Lumen Health — API requests, routed through the Ireland entity. Active
  // lot, an expired lot whose unused balance is subject to unclaimed-property
  // rules in that jurisdiction (reclassified to a remittance liability
  // instead of breakage revenue), and a fresh cash-upfront August lot.
  { id: 'WL-L1', customerId: 'lumen', issueDate: '2026-05-01', originalCredits: 300_000, remainingCredits: 140_000, expiration: '2027-05-01', source: 'purchase' },
  { id: 'WL-L2', customerId: 'lumen', issueDate: '2025-04-01', originalCredits: 200_000, remainingCredits: 0, expiration: '2026-08-01', source: 'purchase', remittanceAmount: 31_000, remittanceDate: '2026-08-01', remittanceStatus: 'pending' },
  { id: 'WL-L3', customerId: 'lumen', issueDate: '2026-08-08', originalCredits: 90_000, remainingCredits: 90_000, expiration: '2027-08-08', source: 'purchase' },

  // Cascade Logistics — tokens. A purchased lot alongside a separately
  // tracked promotional lot (marketing incentive, no cash changes hands).
  { id: 'WL-C1', customerId: 'cascade', issueDate: '2026-07-01', originalCredits: 250_000, remainingCredits: 190_000, expiration: '2027-07-01', source: 'purchase' },
  { id: 'WL-C2', customerId: 'cascade', issueDate: '2026-08-01', originalCredits: 20_000, remainingCredits: 15_500, expiration: '2026-11-01', source: 'promotional' },
]

export const WALLET_LOTS: WalletLot[] = RAW_WALLET_LOTS.map((lot) => ({
  ...lot,
  status: deriveLotStatus(lot.remainingCredits, lot.expiration),
}))

export function walletLot(id: string | null | undefined): WalletLot | undefined {
  if (!id) return undefined
  return WALLET_LOTS.find((lot) => lot.id === id)
}

export const USAGE_EVENTS: UsageEvent[] = [
  // Beacon Robotics (GPU-minutes, prepaid)
  { id: 'UE-001', timestamp: '2026-08-03T09:55:00', customerId: 'beacon', product: 'GPT-5 fine-tuning', unitsConsumed: 40_000, unitLabel: 'GPU-min', walletLotId: 'WL-B1', revenueRecognized: 32_000, journalEntryStatus: 'posted' },
  { id: 'UE-002', timestamp: '2026-08-09T11:20:00', customerId: 'beacon', product: 'GPT-5 fine-tuning', unitsConsumed: 35_000, unitLabel: 'GPU-min', walletLotId: 'WL-B1', revenueRecognized: 28_000, journalEntryStatus: 'posted' },
  { id: 'UE-003', timestamp: '2026-08-16T14:10:00', customerId: 'beacon', product: 'GPT-5 fine-tuning', unitsConsumed: 12_000, unitLabel: 'GPU-min', walletLotId: 'WL-B2', revenueRecognized: 9_600, journalEntryStatus: 'posted' },
  { id: 'UE-004', timestamp: '2026-08-18T09:05:00', customerId: 'beacon', product: 'GPT-5 fine-tuning', unitsConsumed: 15_000, unitLabel: 'GPU-min', walletLotId: 'WL-B2', revenueRecognized: 12_000, journalEntryStatus: 'posted' },

  // Northwind Analytics (tokens, prepaid)
  { id: 'UE-005', timestamp: '2026-08-04T10:05:00', customerId: 'northwind', product: 'GPT-5', unitsConsumed: 60_000_000, unitLabel: 'tokens', walletLotId: 'WL-N1', revenueRecognized: 35_000, journalEntryStatus: 'posted' },
  { id: 'UE-006', timestamp: '2026-08-13T15:40:00', customerId: 'northwind', product: 'GPT-5 mini', unitsConsumed: 42_000_000, unitLabel: 'tokens', walletLotId: 'WL-N1', revenueRecognized: 24_000, journalEntryStatus: 'posted' },

  // Lumen Health (API requests, prepaid, Ireland entity)
  { id: 'UE-007', timestamp: '2026-08-06T08:30:00', customerId: 'lumen', product: 'GPT-5', unitsConsumed: 850_000, unitLabel: 'requests', walletLotId: 'WL-L1', revenueRecognized: 28_000, journalEntryStatus: 'posted' },
  { id: 'UE-008', timestamp: '2026-08-15T13:15:00', customerId: 'lumen', product: 'GPT-5 mini', unitsConsumed: 620_000, unitLabel: 'requests', walletLotId: 'WL-L1', revenueRecognized: 20_000, journalEntryStatus: 'posted' },

  // Cascade Logistics (tokens, prepaid — one purchased lot, one promotional)
  { id: 'UE-009', timestamp: '2026-08-07T12:45:00', customerId: 'cascade', product: 'GPT-5', unitsConsumed: 30_000_000, unitLabel: 'tokens', walletLotId: 'WL-C1', revenueRecognized: 18_000, journalEntryStatus: 'posted' },
  { id: 'UE-010', timestamp: '2026-08-14T16:00:00', customerId: 'cascade', product: 'GPT-5 mini', unitsConsumed: 7_500_000, unitLabel: 'tokens', walletLotId: 'WL-C2', revenueRecognized: 4_500, journalEntryStatus: 'posted' },
  { id: 'UE-011', timestamp: '2026-08-18T10:30:00', customerId: 'cascade', product: 'GPT-5', unitsConsumed: 5_000_000, unitLabel: 'tokens', walletLotId: 'WL-C1', revenueRecognized: 3_000, journalEntryStatus: 'posted' },

  // Argon Studios (API requests, pay-as-you-go — billed in arrears, no wallet)
  { id: 'UE-012', timestamp: '2026-08-02T09:00:00', customerId: 'argon', product: 'GPT-5', unitsConsumed: 120_000, unitLabel: 'requests', walletLotId: null, revenueRecognized: 7_200, journalEntryStatus: 'posted' },
  { id: 'UE-013', timestamp: '2026-08-09T14:20:00', customerId: 'argon', product: 'GPT-5', unitsConsumed: 95_000, unitLabel: 'requests', walletLotId: null, revenueRecognized: 5_700, journalEntryStatus: 'posted' },
  { id: 'UE-014', timestamp: '2026-08-12T11:00:00', customerId: 'argon', product: 'GPT-5 mini', unitsConsumed: 60_000, unitLabel: 'requests', walletLotId: null, revenueRecognized: 3_100, journalEntryStatus: 'exception' },
  { id: 'UE-015', timestamp: '2026-08-18T15:30:00', customerId: 'argon', product: 'GPT-5', unitsConsumed: 40_000, unitLabel: 'requests', walletLotId: null, revenueRecognized: 2_600, journalEntryStatus: 'pending' },
]

export function usageEvent(id: string | undefined): UsageEvent | undefined {
  if (!id) return undefined
  return USAGE_EVENTS.find((e) => e.id === id)
}

export const BILLING_EVENTS: BillingEvent[] = [
  { id: 'INV-B1', date: '2026-08-01', customerId: 'beacon', kind: 'invoice-credit-sale', description: 'Prepaid credit purchase — lot WL-B4 (invoiced, Net 30)', amount: 500_000, status: 'outstanding', walletLotId: 'WL-B4' },
  { id: 'INV-N1', date: '2026-08-05', customerId: 'northwind', kind: 'cash-credit-sale', description: 'Prepaid credit purchase — lot WL-N3 (paid up front)', amount: 100_000, status: 'collected', walletLotId: 'WL-N3' },
  { id: 'INV-L1', date: '2026-08-08', customerId: 'lumen', kind: 'cash-credit-sale', description: 'Prepaid credit purchase — lot WL-L3 (paid up front)', amount: 90_000, status: 'collected', walletLotId: 'WL-L3' },
  { id: 'INV-A1', date: '2026-08-03', customerId: 'argon', kind: 'invoice-usage', description: 'Usage invoice — Aug 2 usage (Net 30)', amount: 7_200, status: 'outstanding' },
  { id: 'INV-A2', date: '2026-08-10', customerId: 'argon', kind: 'invoice-usage', description: 'Usage invoice — Aug 9 usage (Net 30)', amount: 5_700, status: 'collected' },
  { id: 'COL-A2', date: '2026-08-18', customerId: 'argon', kind: 'collection', description: 'Collection against INV-A2', amount: 5_700, status: 'collected', relatedInvoiceId: 'INV-A2' },
  { id: 'RF-N1', date: '2026-08-11', customerId: 'northwind', kind: 'refund', description: 'Refund — prepaid tier downgrade against lot WL-N1', amount: 45_000, status: 'refunded', walletLotId: 'WL-N1' },
]

function isAugust(dateLike: string): boolean {
  return dateLike.slice(0, 7) === '2026-08'
}

function isToday(timestamp: string): boolean {
  return timestamp.slice(0, 10) === '2026-08-18'
}

export interface UsageRevenueKpis {
  revenueRecognizedMtd: number
  contractLiability: number
  accountsReceivable: number
  creditsConsumedToday: number
  breakageRecognizedMtd: number
  breakageProjected: number
  openExceptionCount: number
}

export function computeKpis(): UsageRevenueKpis {
  const revenueRecognizedMtd = USAGE_EVENTS.filter((e) => isAugust(e.timestamp)).reduce(
    (sum, e) => sum + e.revenueRecognized,
    0,
  )
  const contractLiability = WALLET_LOTS.reduce((sum, lot) => sum + lot.remainingCredits, 0)
  // Accounts receivable is accrued at the moment AR is debited — whether by
  // an invoiced credit sale or by PAYG usage recognition — not only once an
  // invoice document has been generated. A usage event that hasn't been
  // formally invoiced yet (e.g. a held exception, or today's usage ahead of
  // the next billing cycle) still increases AR, consistent with billing
  // state lagging revenue state rather than the other way around.
  const accountsReceivable =
    BILLING_EVENTS.filter((b) => b.kind === 'invoice-credit-sale').reduce((sum, b) => sum + b.amount, 0) +
    USAGE_EVENTS.filter((e) => e.walletLotId === null).reduce((sum, e) => sum + e.revenueRecognized, 0) -
    BILLING_EVENTS.filter((b) => b.kind === 'collection').reduce((sum, b) => sum + b.amount, 0)
  const creditsConsumedToday = USAGE_EVENTS.filter((e) => isToday(e.timestamp)).reduce(
    (sum, e) => sum + e.revenueRecognized,
    0,
  )
  const breakageRecognizedMtd = WALLET_LOTS.filter(
    (lot) => lot.breakageAmount && lot.breakageDate && isAugust(lot.breakageDate),
  ).reduce((sum, lot) => sum + (lot.breakageAmount ?? 0), 0)
  const breakageProjected = Math.round(
    WALLET_LOTS.filter((lot) => lot.status === 'expiring-soon').reduce(
      (sum, lot) => sum + lot.remainingCredits,
      0,
    ) * 0.2,
  )
  const openExceptionCount = ACCOUNTING_EXCEPTIONS.filter((ex) => ex.status !== 'resolved').length

  return {
    revenueRecognizedMtd,
    contractLiability,
    accountsReceivable,
    creditsConsumedToday,
    breakageRecognizedMtd,
    breakageProjected,
    openExceptionCount,
  }
}

export interface RollforwardRow {
  label: string
  amount: number
  isTotal?: boolean
}

export function computeRollforward(): RollforwardRow[] {
  const creditsSold = WALLET_LOTS.filter((lot) => lot.source === 'purchase' && isAugust(lot.issueDate)).reduce(
    (sum, lot) => sum + lot.originalCredits,
    0,
  )
  const promotionalGrants = WALLET_LOTS.filter(
    (lot) => lot.source === 'promotional' && isAugust(lot.issueDate),
  ).reduce((sum, lot) => sum + lot.originalCredits, 0)
  const revenueRecognized = USAGE_EVENTS.filter((e) => e.walletLotId && isAugust(e.timestamp)).reduce(
    (sum, e) => sum + e.revenueRecognized,
    0,
  )
  const refunds = BILLING_EVENTS.filter((b) => b.kind === 'refund' && isAugust(b.date)).reduce(
    (sum, b) => sum + b.amount,
    0,
  )
  const remittance = WALLET_LOTS.filter(
    (lot) => lot.remittanceAmount && lot.remittanceDate && isAugust(lot.remittanceDate),
  ).reduce((sum, lot) => sum + (lot.remittanceAmount ?? 0), 0)
  const breakage = WALLET_LOTS.filter(
    (lot) => lot.breakageAmount && lot.breakageDate && isAugust(lot.breakageDate),
  ).reduce((sum, lot) => sum + (lot.breakageAmount ?? 0), 0)

  const ending = WALLET_LOTS.reduce((sum, lot) => sum + lot.remainingCredits, 0)
  const beginning = ending - creditsSold - promotionalGrants + revenueRecognized + refunds + remittance + breakage

  return [
    { label: 'Beginning contract liability (Aug 1)', amount: beginning },
    { label: 'Credits sold', amount: creditsSold },
    { label: 'Promotional credits granted', amount: promotionalGrants },
    { label: 'Revenue recognized', amount: -revenueRecognized },
    { label: 'Refunds', amount: -refunds },
    { label: 'Reclassified to remittance liability', amount: -remittance },
    { label: 'Breakage', amount: -breakage },
    { label: 'Ending contract liability', amount: ending, isTotal: true },
  ]
}

export interface WaterfallStage {
  label: string
  amount: number
  caption: string
}

export function computeWaterfall(): WaterfallStage[] {
  const cashOrArPrepaid = WALLET_LOTS.filter((lot) => lot.source === 'purchase').reduce(
    (sum, lot) => sum + lot.originalCredits,
    0,
  )
  const creditsIssued = WALLET_LOTS.reduce((sum, lot) => sum + lot.originalCredits, 0)
  const usageConsumed = WALLET_LOTS.reduce(
    (sum, lot) =>
      sum + (lot.originalCredits - lot.remainingCredits - (lot.breakageAmount ?? 0) - (lot.remittanceAmount ?? 0)),
    0,
  )
  const refundTotal = BILLING_EVENTS.filter((b) => b.kind === 'refund').reduce((sum, b) => sum + b.amount, 0)
  const remittanceTotal = WALLET_LOTS.reduce((sum, lot) => sum + (lot.remittanceAmount ?? 0), 0)
  const breakageTotal = WALLET_LOTS.reduce((sum, lot) => sum + (lot.breakageAmount ?? 0), 0)
  const remainingLiability = WALLET_LOTS.reduce((sum, lot) => sum + lot.remainingCredits, 0)

  return [
    { label: 'Customer prepays cash / AR', amount: cashOrArPrepaid, caption: 'Cash or invoiced receivable for prepaid credit purchases' },
    { label: 'Credits issued to wallet', amount: creditsIssued, caption: '+ promotional & rollover credits added' },
    { label: 'Usage events received', amount: usageConsumed, caption: 'Metered consumption against wallet balances' },
    { label: 'Revenue recognized', amount: usageConsumed, caption: 'Usage satisfies the performance obligation 1:1' },
    {
      label: 'Remaining contract liability',
      amount: remainingLiability,
      caption: `Net of $${refundTotal.toLocaleString()} refunds, $${remittanceTotal.toLocaleString()} remitted & $${breakageTotal.toLocaleString()} breakage`,
    },
  ]
}

export function buildJournalEntries(): JournalEntry[] {
  const entries: JournalEntry[] = []

  for (const event of USAGE_EVENTS) {
    const customer = CUSTOMERS.find((c) => c.id === event.customerId)
    const lot = walletLot(event.walletLotId)
    entries.push({
      id: '',
      date: event.timestamp.slice(0, 10),
      customerId: event.customerId,
      kind: 'usage-recognition',
      description: `${event.product} usage — ${lot ? `drawn from ${lot.id}` : 'pay-as-you-go billing'}`,
      debitAccount: lot ? 'Contract Liability' : 'Accounts Receivable',
      debitAmount: event.revenueRecognized,
      creditAccount: 'Usage Revenue',
      creditAmount: event.revenueRecognized,
      status: event.journalEntryStatus,
      sourceUsageEventId: event.id,
      walletLotId: event.walletLotId ?? undefined,
      contractId: customer?.contractId,
      auditTrail:
        event.journalEntryStatus === 'exception'
          ? [
              'Usage ingested from metering pipeline',
              'Revenue rule engine applied ASC 606 recognition',
              'Exception engine flagged: usage occurred before contract execution date',
              'Held for Controller review — not yet posted to GL',
            ]
          : [
              'Usage ingested from metering pipeline',
              'Revenue rule engine applied ASC 606 recognition',
              event.journalEntryStatus === 'pending'
                ? 'Queued for next ledger batch (posts within 24 hours)'
                : 'Posted to general ledger',
            ],
    })
  }

  for (const billing of BILLING_EVENTS) {
    const customer = CUSTOMERS.find((c) => c.id === billing.customerId)

    if (billing.kind === 'invoice-credit-sale' || billing.kind === 'cash-credit-sale') {
      entries.push({
        id: '',
        date: billing.date,
        customerId: billing.customerId,
        kind: 'credit-sale',
        description: billing.description,
        debitAccount: billing.kind === 'cash-credit-sale' ? 'Cash' : 'Accounts Receivable',
        debitAmount: billing.amount,
        creditAccount: 'Contract Liability',
        creditAmount: billing.amount,
        status: 'posted',
        walletLotId: billing.walletLotId,
        contractId: customer?.contractId,
        auditTrail:
          billing.kind === 'cash-credit-sale'
            ? ['Payment settled and confirmed by billing', 'Wallet lot provisioned with prepaid balance', 'Posted to general ledger']
            : ['Invoice issued, Net 30 terms', 'Wallet lot provisioned with prepaid balance', 'Posted to general ledger — cash collection tracked separately in AR'],
      })
    }

    // Note: 'invoice-usage' billing events intentionally do not generate a
    // journal entry — for pay-as-you-go usage, revenue and the receivable
    // are already booked by the usage-recognition entry above at the moment
    // of consumption. The invoice merely formalizes that existing
    // receivable for the customer; booking a second entry here would
    // double-count both revenue and AR.

    if (billing.kind === 'collection') {
      entries.push({
        id: '',
        date: billing.date,
        customerId: billing.customerId,
        kind: 'collection',
        description: billing.description,
        debitAccount: 'Cash',
        debitAmount: billing.amount,
        creditAccount: 'Accounts Receivable',
        creditAmount: billing.amount,
        status: 'posted',
        contractId: customer?.contractId,
        auditTrail: ['Payment received and matched to open invoice', 'Accounts receivable balance cleared', 'Posted to general ledger'],
      })
    }

    if (billing.kind === 'refund') {
      entries.push({
        id: '',
        date: billing.date,
        customerId: billing.customerId,
        kind: 'refund',
        description: billing.description,
        debitAccount: 'Contract Liability',
        debitAmount: billing.amount,
        creditAccount: 'Cash',
        creditAmount: billing.amount,
        status: 'posted',
        walletLotId: billing.walletLotId,
        contractId: customer?.contractId,
        auditTrail: ['Refund approved by Controller', 'Contract liability reduced for unconsumed prepaid balance', 'Posted to general ledger'],
      })
    }
  }

  for (const lot of WALLET_LOTS) {
    const customer = CUSTOMERS.find((c) => c.id === lot.customerId)

    if (lot.source === 'promotional' && isAugust(lot.issueDate)) {
      entries.push({
        id: '',
        date: lot.issueDate,
        customerId: lot.customerId,
        kind: 'promotional-grant',
        description: `Promotional credit grant — lot ${lot.id} (marketing incentive, no cash)`,
        debitAccount: 'Marketing Expense',
        debitAmount: lot.originalCredits,
        creditAccount: 'Contract Liability',
        creditAmount: lot.originalCredits,
        status: 'posted',
        walletLotId: lot.id,
        contractId: customer?.contractId,
        auditTrail: [
          'Promotional credits granted per marketing agreement',
          'Tracked in a separate promotional lot from paid balances',
          'Posted to general ledger',
        ],
      })
    }

    if (lot.breakageAmount && lot.breakageDate) {
      entries.push({
        id: '',
        date: lot.breakageDate,
        customerId: lot.customerId,
        kind: 'breakage',
        description: `Breakage recognized — unused credits forfeited at expiration (lot ${lot.id})`,
        debitAccount: 'Contract Liability',
        debitAmount: lot.breakageAmount,
        creditAccount: 'Breakage Revenue',
        creditAmount: lot.breakageAmount,
        status: 'posted',
        walletLotId: lot.id,
        contractId: customer?.contractId,
        auditTrail: [
          'Lot reached contractual expiration with unused balance',
          'Limited historical redemption data — recognized via the remote method at expiration rather than proportionally',
          'Posted to general ledger per ASC 606-10-55-46',
        ],
      })
    }

    if (lot.remittanceAmount && lot.remittanceDate) {
      entries.push({
        id: '',
        date: lot.remittanceDate,
        customerId: lot.customerId,
        kind: 'remittance-reclass',
        description: `Unused balance reclassified to remittance liability at expiration (lot ${lot.id})`,
        debitAccount: 'Contract Liability',
        debitAmount: lot.remittanceAmount,
        creditAccount: 'Remittance Liability',
        creditAmount: lot.remittanceAmount,
        status: lot.remittanceStatus === 'remitted' ? 'posted' : 'pending',
        walletLotId: lot.id,
        contractId: customer?.contractId,
        auditTrail: [
          'Lot reached contractual expiration with unused balance',
          'Ireland entity — unclaimed-property rules require remittance rather than breakage revenue',
          lot.remittanceStatus === 'remitted'
            ? 'Remitted to the relevant authority — posted to general ledger'
            : 'Pending legal review before remittance is filed',
        ],
      })
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
  return entries.map((entry, i) => ({ ...entry, id: `JE-${String(i + 1).padStart(3, '0')}` }))
}

export const ACCOUNTING_EXCEPTIONS: AccountingException[] = [
  {
    id: 'EX-001',
    type: 'Usage without contract',
    customerId: 'argon',
    severity: 'high',
    status: 'open',
    detail:
      'The Aug 12 usage event ($3,100) was ingested and revenue was recognized before the pay-as-you-go contract was countersigned on Aug 14.',
    suggestedAction: 'Confirm the executed contract covers the Aug 12 usage retroactively before releasing the entry to the GL.',
  },
  {
    id: 'EX-002',
    type: 'Remittance liability pending legal review',
    customerId: 'lumen',
    severity: 'medium',
    status: 'in-review',
    detail:
      'Wallet lot WL-L2 expired Aug 1 with a $31,000 unused balance. Because the contract is routed through the Ireland entity, unclaimed-property rules may require remittance instead of breakage revenue.',
    suggestedAction: 'Confirm the applicable jurisdiction and remittance timeline with legal/tax before filing.',
    relatedWalletLotId: 'WL-L2',
  },
  {
    id: 'EX-003',
    type: 'Promotional credits posted to standard revenue account',
    customerId: 'cascade',
    severity: 'medium',
    status: 'open',
    detail:
      'Promotional credit lot WL-C2 is posting to the standard Usage Revenue account instead of a promotional revenue sub-account.',
    suggestedAction: 'Reclassify the $4,500 recognized in August to the promotional revenue sub-account.',
    relatedWalletLotId: 'WL-C2',
  },
  {
    id: 'EX-004',
    type: 'Breakage recognized at expiration',
    customerId: 'northwind',
    severity: 'low',
    status: 'resolved',
    detail: '$18,000 of unused credits on lot WL-N2 expired Aug 1 and were recognized as breakage via the remote method.',
    suggestedAction: 'No further action required — recognized in the August breakage rollforward.',
    relatedWalletLotId: 'WL-N2',
  },
]
