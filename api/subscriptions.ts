import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { CONTRACTS } from '../src/data/mockReconciliation'
import { computeMonthlyNewMRR, matchContractsToSubscriptions } from '../src/lib/matchSubscriptions'
import type { LiveSubscriptionsResponse } from '../src/types/reconciliation'
import type { NormalizedSubscription } from '../src/lib/matchSubscriptions'

// Subscription statuses that represent an actively billing customer.
const LIVE_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing']

const OCCURRENCES_PER_MONTH: Record<Stripe.Price.Recurring.Interval, number> = {
  day: 30.44 / 1,
  week: 4.345,
  month: 1,
  year: 1 / 12,
}

function priceToMonthlyAmount(price: Stripe.Price | null, quantity: number): number {
  if (!price?.unit_amount || !price.recurring) return 0
  const perOccurrence = (price.unit_amount / 100) * quantity
  const occurrencesPerMonth = OCCURRENCES_PER_MONTH[price.recurring.interval] / price.recurring.interval_count
  return perOccurrence * occurrencesPerMonth
}

function subscriptionMonthlyAmount(subscription: Stripe.Subscription): number {
  return subscription.items.data.reduce(
    (sum, item) => sum + priceToMonthlyAmount(item.price, item.quantity ?? 1),
    0,
  )
}

async function fetchLiveSubscriptions(stripe: Stripe): Promise<NormalizedSubscription[]> {
  const results: NormalizedSubscription[] = []

  for (const status of LIVE_STATUSES) {
    const subscriptions = stripe.subscriptions.list({
      status,
      limit: 100,
      expand: ['data.customer'],
    })

    for await (const subscription of subscriptions) {
      const customer = subscription.customer
      if (typeof customer === 'string' || customer.deleted || !customer.email) continue

      results.push({
        id: subscription.id,
        customerEmail: customer.email,
        monthlyAmount: subscriptionMonthlyAmount(subscription),
      })
    }
  }

  return results
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always hit Stripe live — never serve a cached response.
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' })
    return
  }

  const stripe = new Stripe(secretKey)

  try {
    const subscriptions = await fetchLiveSubscriptions(stripe)
    const matches = matchContractsToSubscriptions(CONTRACTS, subscriptions)
    const monthlyNewMRR = computeMonthlyNewMRR(CONTRACTS, matches)

    const body: LiveSubscriptionsResponse = {
      fetchedAt: new Date().toISOString(),
      matches,
      monthlyNewMRR,
    }
    res.status(200).json(body)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching Stripe subscriptions'
    res.status(502).json({ error: message })
  }
}
