import type { JournalEntry } from '../types/usageRevenue'
import { CUSTOMERS, usageEvent, walletLot } from '../data/mockUsageRevenue'
import { formatCredits, formatCurrency, formatDate } from './format'

export function explainJournalEntry(entry: JournalEntry): string {
  const customer = CUSTOMERS.find((c) => c.id === entry.customerId)
  const customerName = customer?.name ?? entry.customerId

  if (entry.kind === 'usage-recognition') {
    const event = entry.sourceUsageEventId ? usageEvent(entry.sourceUsageEventId) : undefined
    const lot = walletLot(entry.walletLotId ?? null)
    const modelClause = event ? ` of the ${event.model} model` : ''

    if (entry.status === 'exception') {
      return (
        `Revenue was recognized because ${formatCredits(entry.debitAmount)} in prepaid API credits were consumed on ` +
        `${formatDate(entry.date)}, but the draw-down exceeded ${customerName}'s remaining wallet balance on lot ` +
        `${lot?.id ?? 'the associated lot'}. Usage${modelClause} still satisfied the performance obligation, so the ` +
        `entry debits ${entry.debitAccount} and credits ${entry.creditAccount} for ${formatCurrency(entry.debitAmount)} — ` +
        `but the resulting negative wallet balance has been flagged as an accounting exception pending Controller review ` +
        `before this entry is posted to the general ledger.`
      )
    }

    return (
      `Revenue was recognized because ${formatCredits(entry.debitAmount)} in prepaid API credits were consumed on ` +
      `${formatDate(entry.date)}. Under the ${customer?.contractType === 'payg' ? 'pay-as-you-go' : 'prepaid'} contract ` +
      `with ${customerName}, the company satisfied its performance obligation through usage${modelClause}. The ` +
      `corresponding journal entry debits ${entry.debitAccount} and credits ${entry.creditAccount} for ` +
      `${formatCurrency(entry.debitAmount)}${lot ? `, drawing down wallet lot ${lot.id}` : ', billed directly with no prepaid wallet involved'}.`
    )
  }

  if (entry.kind === 'credit-sale') {
    return (
      `${customerName} prepaid ${formatCurrency(entry.debitAmount)} in cash for a new block of usage credits on ` +
      `${formatDate(entry.date)}. Because no service has been delivered yet, ASC 606 requires the company to treat ` +
      `the cash as a contract liability rather than revenue — the entry debits ${entry.debitAccount} and credits ` +
      `${entry.creditAccount}. Revenue will be recognized incrementally as ${customerName} consumes the credits ` +
      `through usage.`
    )
  }

  if (entry.kind === 'refund') {
    return (
      `${customerName} received a ${formatCurrency(entry.debitAmount)} refund on ${formatDate(entry.date)} for ` +
      `unconsumed prepaid credits. Since that cash will no longer be earned through future usage, the refund reduces ` +
      `the outstanding contract liability directly — the entry debits ${entry.debitAccount} and credits ` +
      `${entry.creditAccount} — rather than flowing through revenue.`
    )
  }

  return (
    `The unused balance on wallet lot ${entry.walletLotId ?? 'this lot'} reached its contractual expiration on ` +
    `${formatDate(entry.date)} without being consumed. Under ASC 606-10-55-46, the company recognizes this unused ` +
    `portion as breakage revenue once the likelihood of the customer exercising those remaining rights becomes ` +
    `remote. The entry debits ${entry.debitAccount} and credits ${entry.creditAccount} for ` +
    `${formatCurrency(entry.debitAmount)}, converting the expired liability into recognized revenue.`
  )
}
