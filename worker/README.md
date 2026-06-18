# Katha Cards — Stripe billing Worker

A tiny Cloudflare Worker that lets the static Katha Cards site sell the
**$0.99 / year Premium** subscription through Stripe, and tells the app whether
a device's subscription is active. Until this is deployed, the in-app Upgrade
button just unlocks Premium locally so you can test the flow.

## What it does

| Route | Purpose |
|-------|---------|
| `POST /create-checkout-session` | Creates a Stripe Checkout Session (mode: subscription) and returns the hosted checkout URL. |
| `POST /webhook` | Verifies Stripe's signature and records/clears entitlement in KV. |
| `GET /entitlement?device=ID` | Returns `{ premium: true/false }` for an anonymous device id. |

Entitlement is keyed by a random `device` id the browser generates (passed as
the Checkout `client_reference_id`). No accounts or logins required.

## One-time setup

### 1. Stripe
1. Create a **Product** with a **recurring Price** of `$0.99 / year`. Copy the
   price id (`price_...`).
2. Grab your **Secret key** (`sk_live_...` / `sk_test_...`).

### 2. Deploy the Worker
```bash
cd worker
npm i -g wrangler            # or: npx wrangler ...
wrangler login

# create the entitlement store, paste the id into wrangler.toml -> kv_namespaces.id
wrangler kv namespace create ENTITLEMENTS

# set vars in wrangler.toml: ALLOWED_ORIGIN, STRIPE_PRICE_ID
# set secrets:
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET   # fill in after step 3

wrangler deploy              # prints https://katha-billing.<you>.workers.dev
```

### 3. Stripe webhook
In the Stripe dashboard → Developers → Webhooks → **Add endpoint**:
- URL: `https://katha-billing.<you>.workers.dev/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- Copy the **Signing secret** (`whsec_...`) and run
  `wrangler secret put STRIPE_WEBHOOK_SECRET`, then `wrangler deploy` again.

### 4. Point the app at the Worker
In [`src/lib/premium.js`](../src/lib/premium.js) set:
```js
export const BILLING = {
  apiBase: 'https://katha-billing.<you>.workers.dev',
  paymentLink: '',
  price: '$0.99',
  period: 'year',
}
```
Rebuild and redeploy the site. Done — the Upgrade button now runs a real Stripe
Checkout and Premium unlocks only for paying devices (verified server-side).

## Simpler alternative (no Worker)

If you'd rather not host a backend, create a Stripe **Payment Link** for the
plan and set `BILLING.paymentLink` to its URL (leave `apiBase` empty). Real
payment still happens; entitlement is granted on the post-checkout redirect
(trust-on-return) rather than verified server-side.
