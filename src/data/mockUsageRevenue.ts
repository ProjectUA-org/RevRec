import type {
  AccountingException,
  Customer,
  JournalEntry,
  Refund,
  UsageEvent,
  WalletLot,
  WalletLotStatus,
} from '../types/usageRevenue'

// Fixed "as of" date for the demo so the story (expiring lots, "today" totals,
// exception aging) stays stable no matter when this app is viewed.
export const TODAY = new Date('2026-08-18T00:00:00Z')
const DAY_MS = 24 * 60 * 60 * 1000

export const CUSTOMERS: Customer[] = [
  { id: 'openai', name: 'OpenAI', contractType: 'prepaid', contractId: 'CT-OPENAI-01' },
  { id: 'anthropic', name: 'Anthropic', contractType: 'prepaid', contractId: 'CT-ANTHROPIC-01' },
  { id: 'vercel', name: 'Vercel', contractType: 'prepaid', contractId: 'CT-VERCEL-01' },
  { id: 'clay', name: 'Clay', contractType: 'payg', contractId: 'CT-CLAY-01' },
  { id: 'cursor', name: 'Cursor AI', contractType: 'prepaid', contractId: 'CT-CURSOR-01' },
  { id: 'perplexity', name: 'Perplexity', contractType: 'prepaid', contractId: 'CT-PERPLEXITY-01' },
  { id: 'scaleai', name: 'Scale AI', contractType: 'prepaid', contractId: 'CT-SCALEAI-01' },
  { id: 'meridian', name: 'Meridian Labs', contractType: 'prepaid', contractId: 'CT-MERIDIAN-01' },
]

export function customerName(customerId: string): string {
  return CUSTOMERS.find((c) => c.id === customerId)?.name ?? customerId
}

function deriveLotStatus(remainingCredits: number, expiration: string): WalletLotStatus {
  const daysToExpiry = (new Date(`${expiration}T00:00:00Z`).getTime() - TODAY.getTime()) / DAY_MS
  if (remainingCredits < 0) return 'exception'
  if (remainingCredits === 0) return daysToExpiry <= 0 ? 'expired' : 'depleted'
  if (daysToExpiry <= 0) return 'expired'
  if (daysToExpiry <= 30) return 'expiring-soon'
  return 'active'
}

type RawLot = Omit<WalletLot, 'status'>

const RAW_WALLET_LOTS: RawLot[] = [
  // OpenAI — large, well-established prepaid relationship, mostly active.
  { id: 'WL-1001', customerId: 'openai', purchaseDate: '2026-02-01', originalCredits: 3_000_000, remainingCredits: 640_000, expiration: '2027-02-01', source: 'purchase' },
  { id: 'WL-1002', customerId: 'openai', purchaseDate: '2026-08-05', originalCredits: 1_200_000, remainingCredits: 1_090_000, expiration: '2027-08-05', source: 'purchase' },

  // Anthropic — largest wallet, heavy August draw-down.
  { id: 'WL-2001', customerId: 'anthropic', purchaseDate: '2025-11-01', originalCredits: 5_000_000, remainingCredits: 1_150_000, expiration: '2026-11-01', source: 'purchase' },
  { id: 'WL-2002', customerId: 'anthropic', purchaseDate: '2026-08-10', originalCredits: 2_000_000, remainingCredits: 2_000_000, expiration: '2027-08-10', source: 'purchase' },

  // Vercel — an older lot expiring in two weeks, plus a rollover lot reissued from unused balance.
  { id: 'WL-3001', customerId: 'vercel', purchaseDate: '2025-09-01', originalCredits: 800_000, remainingCredits: 150_000, expiration: '2026-09-01', source: 'purchase' },
  { id: 'WL-3002', customerId: 'vercel', purchaseDate: '2026-08-01', originalCredits: 150_000, remainingCredits: 150_000, expiration: '2027-02-01', source: 'rollover' },

  // Clay — mostly pay-as-you-go; one small promotional credit lot.
  { id: 'WL-4001', customerId: 'clay', purchaseDate: '2026-08-01', originalCredits: 25_000, remainingCredits: 21_900, expiration: '2026-11-01', source: 'promotional' },

  // Cursor AI — a fully depleted pilot lot, an expiring-soon lot, and a fresh August lot.
  { id: 'WL-5000', customerId: 'cursor', purchaseDate: '2026-03-01', originalCredits: 60_000, remainingCredits: 0, expiration: '2027-03-01', source: 'purchase' },
  { id: 'WL-5001', customerId: 'cursor', purchaseDate: '2026-05-01', originalCredits: 400_000, remainingCredits: 95_000, expiration: '2026-09-01', source: 'purchase' },
  { id: 'WL-5002', customerId: 'cursor', purchaseDate: '2026-08-12', originalCredits: 300_000, remainingCredits: 251_500, expiration: '2027-02-12', source: 'purchase' },

  // Perplexity — one lot expired Aug 1 with unused breakage, one active lot.
  { id: 'WL-6001', customerId: 'perplexity', purchaseDate: '2025-05-01', originalCredits: 250_000, remainingCredits: 0, expiration: '2026-08-01', source: 'purchase', breakageAmount: 42_000, breakageDate: '2026-08-01' },
  { id: 'WL-6002', customerId: 'perplexity', purchaseDate: '2026-06-01', originalCredits: 600_000, remainingCredits: 410_000, expiration: '2027-06-01', source: 'purchase' },

  // Scale AI — partial refund issued against this lot in August.
  { id: 'WL-7001', customerId: 'scaleai', purchaseDate: '2026-07-01', originalCredits: 1_000_000, remainingCredits: 620_000, expiration: '2027-07-01', source: 'purchase' },

  // Meridian Labs — usage exceeded the wallet balance; flagged accounting exception.
  { id: 'WL-8001', customerId: 'meridian', purchaseDate: '2026-08-01', originalCredits: 150_000, remainingCredits: -15_000, expiration: '2027-02-01', source: 'purchase' },
]

export const WALLET_LOTS: WalletLot[] = RAW_WALLET_LOTS.map((lot) => ({
  ...lot,
  status: deriveLotStatus(lot.remainingCredits, lot.expiration),
}))

export function walletLot(id: string | null): WalletLot | undefined {
  if (!id) return undefined
  return WALLET_LOTS.find((lot) => lot.id === id)
}

export const REFUNDS: Refund[] = [
  {
    id: 'RF-001',
    date: '2026-08-09',
    customerId: 'scaleai',
    walletLotId: 'WL-7001',
    amount: 120_000,
    reason: 'Pro-rated refund for Q3 committed-use tier downgrade per contract amendment #2.',
  },
]

export const USAGE_EVENTS: UsageEvent[] = [
  { id: 'UE-001', timestamp: '2026-08-02T09:14:00', customerId: 'openai', model: 'GPT-5', tokens: 140_000_000, walletLotId: 'WL-1001', revenueRecognized: 85_000, journalEntryStatus: 'posted' },
  { id: 'UE-002', timestamp: '2026-08-05T14:02:00', customerId: 'openai', model: 'GPT-5', tokens: 150_000_000, walletLotId: 'WL-1001', revenueRecognized: 92_000, journalEntryStatus: 'posted' },
  { id: 'UE-003', timestamp: '2026-08-09T11:47:00', customerId: 'anthropic', model: 'Claude Opus 5', tokens: 210_000_000, walletLotId: 'WL-2001', revenueRecognized: 128_000, journalEntryStatus: 'posted' },
  { id: 'UE-004', timestamp: '2026-08-12T08:30:00', customerId: 'openai', model: 'GPT-5 mini', tokens: 95_000_000, walletLotId: 'WL-1002', revenueRecognized: 45_000, journalEntryStatus: 'posted' },
  { id: 'UE-005', timestamp: '2026-08-15T16:05:00', customerId: 'anthropic', model: 'Claude Opus 5', tokens: 3_650_000_000, walletLotId: 'WL-2001', revenueRecognized: 2_300_000, journalEntryStatus: 'posted' },
  { id: 'UE-006', timestamp: '2026-08-16T10:12:00', customerId: 'openai', model: 'GPT-5', tokens: 118_000_000, walletLotId: 'WL-1002', revenueRecognized: 65_000, journalEntryStatus: 'posted' },
  { id: 'UE-007', timestamp: '2026-08-18T13:20:00', customerId: 'openai', model: 'GPT-5', tokens: 132_000_000, walletLotId: 'WL-1001', revenueRecognized: 78_000, journalEntryStatus: 'posted' },
  { id: 'UE-008', timestamp: '2026-08-03T09:55:00', customerId: 'vercel', model: 'Llama 4 70B', tokens: 60_000_000, walletLotId: 'WL-3001', revenueRecognized: 38_000, journalEntryStatus: 'posted' },
  { id: 'UE-009', timestamp: '2026-08-11T15:40:00', customerId: 'vercel', model: 'Llama 4 70B', tokens: 42_000_000, walletLotId: 'WL-3001', revenueRecognized: 26_000, journalEntryStatus: 'posted' },
  { id: 'UE-010', timestamp: '2026-08-01T12:00:00', customerId: 'clay', model: 'Mistral Large 3', tokens: 8_000_000, walletLotId: null, revenueRecognized: 4_200, journalEntryStatus: 'posted' },
  { id: 'UE-011', timestamp: '2026-08-06T09:30:00', customerId: 'clay', model: 'Mistral Large 3', tokens: 11_500_000, walletLotId: null, revenueRecognized: 6_050, journalEntryStatus: 'posted' },
  { id: 'UE-012', timestamp: '2026-08-13T17:22:00', customerId: 'clay', model: 'GPT-5 mini', tokens: 6_200_000, walletLotId: 'WL-4001', revenueRecognized: 3_100, journalEntryStatus: 'posted' },
  { id: 'UE-013', timestamp: '2026-08-04T10:05:00', customerId: 'cursor', model: 'Claude Sonnet 5', tokens: 54_000_000, walletLotId: 'WL-5001', revenueRecognized: 32_000, journalEntryStatus: 'posted' },
  { id: 'UE-014', timestamp: '2026-08-14T09:48:00', customerId: 'cursor', model: 'Claude Sonnet 5', tokens: 61_000_000, walletLotId: 'WL-5002', revenueRecognized: 37_500, journalEntryStatus: 'posted' },
  { id: 'UE-015', timestamp: '2026-08-07T14:33:00', customerId: 'perplexity', model: 'GPT-5', tokens: 88_000_000, walletLotId: 'WL-6002', revenueRecognized: 54_000, journalEntryStatus: 'posted' },
  { id: 'UE-016', timestamp: '2026-08-16T11:02:00', customerId: 'perplexity', model: 'Claude Opus 5', tokens: 72_000_000, walletLotId: 'WL-6002', revenueRecognized: 44_000, journalEntryStatus: 'posted' },
  { id: 'UE-017', timestamp: '2026-08-02T08:20:00', customerId: 'scaleai', model: 'Llama 4 70B', tokens: 145_000_000, walletLotId: 'WL-7001', revenueRecognized: 88_000, journalEntryStatus: 'posted' },
  { id: 'UE-018', timestamp: '2026-08-10T13:15:00', customerId: 'scaleai', model: 'Llama 4 70B', tokens: 151_000_000, walletLotId: 'WL-7001', revenueRecognized: 92_000, journalEntryStatus: 'posted' },
  { id: 'UE-019', timestamp: '2026-08-08T09:00:00', customerId: 'meridian', model: 'GPT-5 mini', tokens: 210_000_000, walletLotId: 'WL-8001', revenueRecognized: 125_000, journalEntryStatus: 'posted' },
  { id: 'UE-020', timestamp: '2026-08-12T12:40:00', customerId: 'meridian', model: 'GPT-5 mini', tokens: 65_000_000, walletLotId: 'WL-8001', revenueRecognized: 40_000, journalEntryStatus: 'exception' },
  { id: 'UE-021', timestamp: '2026-08-18T09:10:00', customerId: 'scaleai', model: 'Llama 4 70B', tokens: 68_000_000, walletLotId: 'WL-7001', revenueRecognized: 41_000, journalEntryStatus: 'posted' },
  { id: 'UE-022', timestamp: '2026-08-18T10:45:00', customerId: 'cursor', model: 'Claude Sonnet 5', tokens: 18_000_000, walletLotId: 'WL-5002', revenueRecognized: 11_000, journalEntryStatus: 'pending' },
]

export function usageEvent(id: string): UsageEvent | undefined {
  return USAGE_EVENTS.find((e) => e.id === id)
}

function isAugust(dateLike: string): boolean {
  return dateLike.slice(0, 7) === '2026-08'
}

function isToday(timestamp: string): boolean {
  return timestamp.slice(0, 10) === '2026-08-18'
}

export interface UsageRevenueKpis {
  revenueRecognizedMtd: number
  contractLiability: number
  outstandingCredits: number
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
  const outstandingCredits = WALLET_LOTS.reduce((sum, lot) => sum + Math.max(lot.remainingCredits, 0), 0)
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
    outstandingCredits,
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
  const creditsSold = WALLET_LOTS.filter((lot) => lot.source === 'purchase' && isAugust(lot.purchaseDate)).reduce(
    (sum, lot) => sum + lot.originalCredits,
    0,
  )
  const revenueRecognized = USAGE_EVENTS.filter((e) => e.walletLotId && isAugust(e.timestamp)).reduce(
    (sum, e) => sum + e.revenueRecognized,
    0,
  )
  const refunds = REFUNDS.filter((r) => isAugust(r.date)).reduce((sum, r) => sum + r.amount, 0)
  const breakage = WALLET_LOTS.filter(
    (lot) => lot.breakageAmount && lot.breakageDate && isAugust(lot.breakageDate),
  ).reduce((sum, lot) => sum + (lot.breakageAmount ?? 0), 0)

  const ending = WALLET_LOTS.reduce((sum, lot) => sum + lot.remainingCredits, 0)
  const beginning = ending - creditsSold + revenueRecognized + refunds + breakage

  return [
    { label: 'Beginning contract liability (Aug 1)', amount: beginning },
    { label: 'Credits sold', amount: creditsSold },
    { label: 'Revenue recognized', amount: -revenueRecognized },
    { label: 'Refunds', amount: -refunds },
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
  const cashPrepaid = WALLET_LOTS.filter((lot) => lot.source === 'purchase').reduce(
    (sum, lot) => sum + lot.originalCredits,
    0,
  )
  const creditsIssued = WALLET_LOTS.reduce((sum, lot) => sum + lot.originalCredits, 0)
  const usageConsumed = WALLET_LOTS.reduce(
    (sum, lot) => sum + (lot.originalCredits - lot.remainingCredits - (lot.breakageAmount ?? 0)),
    0,
  )
  const refundTotal = REFUNDS.reduce((sum, r) => sum + r.amount, 0)
  const breakageTotal = WALLET_LOTS.reduce((sum, lot) => sum + (lot.breakageAmount ?? 0), 0)
  const remainingLiability = WALLET_LOTS.reduce((sum, lot) => sum + lot.remainingCredits, 0)

  return [
    { label: 'Customer prepays cash', amount: cashPrepaid, caption: 'Cash collected for prepaid credit purchases' },
    { label: 'Credits issued to wallet', amount: creditsIssued, caption: '+ promotional & rollover credits added' },
    { label: 'Usage events received', amount: usageConsumed, caption: 'Metered consumption against wallet balances' },
    { label: 'Revenue recognized', amount: usageConsumed, caption: 'Usage satisfies the performance obligation 1:1' },
    {
      label: 'Remaining contract liability',
      amount: remainingLiability,
      caption: `Net of $${refundTotal.toLocaleString()} refunds & $${breakageTotal.toLocaleString()} breakage`,
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
      description: `${event.model} usage — ${lot ? `drawn from ${lot.id}` : 'pay-as-you-go billing'}`,
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
              'Exception engine flagged: usage exceeds available wallet balance',
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

  for (const lot of WALLET_LOTS) {
    if (lot.source === 'purchase' && isAugust(lot.purchaseDate)) {
      const customer = CUSTOMERS.find((c) => c.id === lot.customerId)
      entries.push({
        id: '',
        date: lot.purchaseDate,
        customerId: lot.customerId,
        kind: 'credit-sale',
        description: `Prepaid credit purchase — lot ${lot.id}`,
        debitAccount: 'Cash',
        debitAmount: lot.originalCredits,
        creditAccount: 'Contract Liability',
        creditAmount: lot.originalCredits,
        status: lot.customerId === 'meridian' ? 'pending' : 'posted',
        walletLotId: lot.id,
        contractId: customer?.contractId,
        auditTrail: [
          'Payment settled and confirmed by billing',
          'Wallet lot provisioned with prepaid balance',
          lot.customerId === 'meridian'
            ? 'Held pending resolution of related wallet exception'
            : 'Posted to general ledger',
        ],
      })
    }
  }

  for (const refund of REFUNDS) {
    const customer = CUSTOMERS.find((c) => c.id === refund.customerId)
    entries.push({
      id: '',
      date: refund.date,
      customerId: refund.customerId,
      kind: 'refund',
      description: `Refund — ${refund.reason}`,
      debitAccount: 'Contract Liability',
      debitAmount: refund.amount,
      creditAccount: 'Cash',
      creditAmount: refund.amount,
      status: 'posted',
      walletLotId: refund.walletLotId,
      contractId: customer?.contractId,
      auditTrail: [
        'Refund approved by Controller',
        'Contract liability reduced for unconsumed prepaid balance',
        'Posted to general ledger',
      ],
    })
  }

  for (const lot of WALLET_LOTS) {
    if (lot.breakageAmount && lot.breakageDate) {
      const customer = CUSTOMERS.find((c) => c.id === lot.customerId)
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
          'Breakage estimate reassessed against historical redemption pattern',
          'Posted to general ledger per ASC 606-10-55-46',
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
    type: 'Negative wallet balance',
    customerId: 'meridian',
    severity: 'high',
    status: 'open',
    detail:
      'Wallet lot WL-8001 went to a −$15,000 balance after the Aug 12 usage event posted against only $25,000 of remaining credits.',
    suggestedAction:
      'Reverse the overdraw, issue a $15,000 true-up invoice, and pause further usage until the customer tops up.',
    relatedWalletLotId: 'WL-8001',
  },
  {
    id: 'EX-002',
    type: 'Revenue exceeds available credits',
    customerId: 'meridian',
    severity: 'high',
    status: 'in-review',
    detail:
      'Journal entry JE for the Aug 12 usage event recognized $40,000 of revenue against a wallet with only $25,000 available at the time.',
    suggestedAction: 'Confirm recognition treatment with the Controller before month-end close.',
  },
  {
    id: 'EX-003',
    type: 'Promotional credits incorrectly mapped',
    customerId: 'clay',
    severity: 'medium',
    status: 'open',
    detail:
      'Promotional credit lot WL-4001 is posting to the standard Usage Revenue account instead of the promotional revenue sub-account.',
    suggestedAction: 'Reclassify the $3,100 recognized in August to the promotional revenue sub-account.',
    relatedWalletLotId: 'WL-4001',
  },
  {
    id: 'EX-004',
    type: 'Wallet credits expired',
    customerId: 'perplexity',
    severity: 'low',
    status: 'resolved',
    detail: '$42,000 of unused credits on lot WL-6001 expired Aug 1 and were recognized as breakage per policy.',
    suggestedAction: 'No further action required — recognized in the August breakage rollforward.',
    relatedWalletLotId: 'WL-6001',
  },
]
