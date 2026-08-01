// Seeds the Stripe *test-mode* account with customers + subscriptions matching
// src/data/mockReconciliation.ts, so api/subscriptions.ts has real data to match
// against by customer email. Safe to re-run: skips any email that already has
// a Stripe customer.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... npm run seed:stripe

import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY is not set.')
  process.exit(1)
}
if (!secretKey.startsWith('sk_test_')) {
  console.error('Refusing to run: STRIPE_SECRET_KEY does not look like a test-mode key (sk_test_...).')
  process.exit(1)
}

// Use the fetch-based HTTP client (routed through HTTPS_PROXY via NODE_USE_ENV_PROXY,
// set in the npm script below) instead of Stripe's default Node http client, which
// bypasses HTTPS_PROXY and can't reach Stripe from behind a proxying network egress.
const stripe = new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() })

// Mirrors CONTRACTS in src/data/mockReconciliation.ts. Ridgeline Freight is seeded
// below its $12,500 contract price on purpose (produces a "mismatch"); Thistle & Vine
// Co. is omitted on purpose (produces a "gap").
const SEED_CUSTOMERS = [
  { company: 'Harborline Media', email: 'billing@harborlinemedia.com', monthlyUsd: 3800 },
  { company: 'Vesper Analytics', email: 'billing@vesperanalytics.com', monthlyUsd: 8200 },
  { company: 'Coral Peak Outfitters', email: 'billing@coralpeakoutfitters.com', monthlyUsd: 1150 },
  { company: 'Ridgeline Freight', email: 'billing@ridgelinefreight.com', monthlyUsd: 9800 },
  { company: 'Northstar Biotech', email: 'billing@northstarbiotech.com', monthlyUsd: 7600 },
  { company: 'Milltown Hardware', email: 'billing@milltownhardware.com', monthlyUsd: 990 },
]

async function findExistingCustomer(email) {
  const result = await stripe.customers.list({ email, limit: 1 })
  return result.data[0] ?? null
}

async function seedCustomer({ company, email, monthlyUsd }) {
  const existing = await findExistingCustomer(email)
  if (existing) {
    console.log(`Skipping ${company} <${email}> — customer already exists (${existing.id}).`)
    return
  }

  const customer = await stripe.customers.create({ name: company, email })

  // pm_card_visa is a Stripe test-mode-only token for attaching a working test
  // card without Checkout/Elements — see https://docs.stripe.com/testing#cards
  const paymentMethod = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id })
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  })

  const price = await stripe.prices.create({
    unit_amount: monthlyUsd * 100,
    currency: 'usd',
    recurring: { interval: 'month' },
    product_data: { name: `${company} plan` },
  })

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    default_payment_method: paymentMethod.id,
  })

  console.log(`Seeded ${company} <${email}>: $${monthlyUsd}/mo (subscription ${subscription.id})`)
}

for (const entry of SEED_CUSTOMERS) {
  await seedCustomer(entry)
}

console.log('Done. Thistle & Vine Co. was intentionally left unseeded to produce a Layer 1 "gap".')
