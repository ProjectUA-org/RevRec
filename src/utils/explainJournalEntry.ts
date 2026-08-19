import type { JournalEntry } from '../types/usageRevenue'
import { CUSTOMERS, usageEvent, walletLot } from '../data/mockUsageRevenue'
import { formatCredits, formatCurrency, formatDate } from './format'

export function explainJournalEntry(entry: JournalEntry): string {
  const customer = CUSTOMERS.find((c) => c.id === entry.customerId)
  const customerName = customer?.name ?? entry.customerId

  if (entry.kind === 'usage-recognition') {
    const event = entry.sourceUsageEventId ? usageEvent(entry.sourceUsageEventId) : undefined
    const lot = walletLot(entry.walletLotId ?? null)
    const productClause = event ? ` of ${event.product}` : ''

    if (entry.status === 'exception') {
      return (
        `Revenue was recognized because ${formatCredits(entry.debitAmount)} in usage was billed on ` +
        `${formatDate(entry.date)}, but this usage occurred before ${customerName}'s pay-as-you-go contract was ` +
        `countersigned. Usage${productClause} still satisfied the performance obligation, so the entry debits ` +
        `${entry.debitAccount} and credits ${entry.creditAccount} for ${formatCurrency(entry.debitAmount)} — but ` +
        `recognizing revenue ahead of an executed contract has been flagged as an accounting exception pending ` +
        `Controller review before this entry is posted to the general ledger.`
      )
    }

    return (
      `Revenue was recognized because ${formatCredits(entry.debitAmount)} in usage was consumed on ` +
      `${formatDate(entry.date)}. Under the ${customer?.contractType === 'payg' ? 'pay-as-you-go' : 'prepaid'} ` +
      `contract with ${customerName}, OpenAI satisfied its performance obligation through usage${productClause}. The ` +
      `corresponding journal entry debits ${entry.debitAccount} and credits ${entry.creditAccount} for ` +
      `${formatCurrency(entry.debitAmount)}${lot ? `, drawing down wallet lot ${lot.id}` : ', billed in arrears with no prepaid wallet involved'}.`
    )
  }

  if (entry.kind === 'credit-sale') {
    const viaAr = entry.debitAccount === 'Accounts Receivable'
    return (
      `${customerName} committed to ${formatCurrency(entry.debitAmount)} of prepaid usage credits on ` +
      `${formatDate(entry.date)}${viaAr ? ', invoiced on Net 30 terms' : ', paid up front'}. Because no service has ` +
      `been delivered yet, ASC 606 requires OpenAI to treat this as a contract liability rather than revenue — the ` +
      `entry debits ${entry.debitAccount} and credits ${entry.creditAccount}. ${viaAr ? 'The receivable is tracked separately from the contract liability and is not affected by how quickly cash is collected. ' : ''}` +
      `Revenue will be recognized incrementally as ${customerName} consumes the credits through usage.`
    )
  }

  if (entry.kind === 'collection') {
    return (
      `${customerName} paid ${formatCurrency(entry.debitAmount)} in cash on ${formatDate(entry.date)} against an ` +
      `open invoice. Since the receivable was already recorded when the invoice was issued, this entry simply moves ` +
      `the balance from Accounts Receivable to Cash — it has no effect on revenue or the contract liability, which ` +
      `were already settled at the time of invoicing or usage.`
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

  if (entry.kind === 'promotional-grant') {
    return (
      `OpenAI granted ${customerName} promotional credits as part of a marketing program. Promotional credits are ` +
      `tracked separately from purchased credits because their accounting may differ depending on the commercial ` +
      `arrangement and whether they create a material right under ASC 606. In this example, the credits are treated ` +
      `as a marketing incentive.`
    )
  }

  if (entry.kind === 'remittance-reclass') {
    return (
      `The unused balance on wallet lot ${entry.walletLotId ?? 'this lot'} reached its contractual expiration on ` +
      `${formatDate(entry.date)} without being consumed. Based on the applicable jurisdiction, the unused balance ` +
      `may be subject to remittance under local unclaimed property or similar laws rather than recognized as ` +
      `breakage revenue. The entry debits ${entry.debitAccount} and credits ${entry.creditAccount} for ` +
      `${formatCurrency(entry.debitAmount)}, moving the balance out of the contract liability and into a remittance ` +
      `liability${entry.status === 'pending' ? ' pending confirmation from legal/tax' : ''}.`
    )
  }

  return (
    `The unused balance on wallet lot ${entry.walletLotId ?? 'this lot'} reached its contractual expiration on ` +
    `${formatDate(entry.date)} without being consumed. With limited historical redemption data to support an ` +
    `earlier proportional estimate, OpenAI applied the remote method under ASC 606-10-55-46 and recognized the ` +
    `unused portion as breakage revenue once further redemption became remote. The entry debits ${entry.debitAccount} ` +
    `and credits ${entry.creditAccount} for ${formatCurrency(entry.debitAmount)}, converting the expired liability ` +
    `into recognized revenue.`
  )
}
