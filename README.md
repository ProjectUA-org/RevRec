# RevRec

Vite + React + TypeScript finance tool with two tabs: Revenue Reconciliation and P&L.

No routing library and no CSS framework — tabs are plain component state, styles are plain CSS.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Live Stripe subscription matching

`api/subscriptions.ts` is a Vercel serverless function that calls the Stripe API live (no caching) to
fetch subscriptions from the test site, matches them to `CONTRACTS` by customer email, and returns each
contract's Layer 1 status (`matched` / `mismatch` / `gap`, based on a 5% price tolerance) plus each
month's live billing-platform new-MRR total. Requires `STRIPE_SECRET_KEY` to be set — see `.env.example`.
Run locally with `vercel dev` (`npm i -g vercel`) to serve `/api/subscriptions` alongside the Vite app.
