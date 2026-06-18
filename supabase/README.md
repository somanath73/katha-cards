# Katha Cards — accounts backend (Supabase + Stripe)

Optional. Turns the static app into a real accounts product: **magic-link
sign-in**, **server-verified entitlement**, **content-protected premium
questions** (medium/hard never ship to free browsers), and **cross-device
progress sync**. The app runs fine without this — it only switches into
"accounts mode" when the two `VITE_SUPABASE_*` env vars are set at build time.

## Pieces

| Where | What |
|-------|------|
| `migrations/0001_init.sql` | tables + RLS (`entitlements`, `progress`, `premium_questions`) + `is_premium()` |
| `functions/create-checkout` | authed → Stripe Checkout Session with the user's id in metadata |
| `functions/stripe-webhook` | verifies Stripe signature → writes entitlement (service role) |
| `scripts/seed-premium-questions.mjs` | loads medium/hard questions into the protected table |

## Setup

### 1. Create the project & schema
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-ref>
supabase db push            # applies migrations/0001_init.sql
```
In **Auth → Providers**, enable **Email** (magic link is on by default). Add your
site URL + `…/` to the allowed redirect URLs.

### 2. Stripe
Create a Product with a recurring **$0.99/year** Price (`price_…`). Then set the
function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_PRICE_ID=price_... \
  STRIPE_WEBHOOK_SECRET=whsec_...  ALLOWED_ORIGIN=https://somanath73.github.io
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```
In Stripe → Webhooks, add `https://<ref>.functions.supabase.co/stripe-webhook`
with events `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`; copy the signing
secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

### 3. Protect the premium questions
```bash
npm i @supabase/supabase-js
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed-premium-questions.mjs --strip-public
```
This uploads medium/hard questions to the RLS-protected table **and** removes
them from the public JSON, so free browsers only ever receive easy questions.

### 4. Turn it on in the app
Add a build-time `.env` (see `.env.example`):
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CHECKOUT_FN=https://<ref>.functions.supabase.co/create-checkout
```
Rebuild & redeploy. The app now uses accounts; with the vars unset it falls back
to the static/device model.

## Why daily limits are client-side
Free content (easy questions) is public static JSON, so a server can't truly
"ration" it — the limit is a friendly client-side nudge (`Continue free tomorrow`).
The *protected* content (medium/hard) is genuinely server-gated by RLS, and
premium play is unlimited.

## Security notes
- RLS: users read only their own `entitlements`/`progress`; `premium_questions`
  rows are visible only to a premium account (`is_premium(auth.uid())`).
- Entitlement is written **only** by the webhook (service role) — never the client.
- Checkout attaches `user_id` to Stripe metadata, so the webhook maps payments
  to accounts without trusting the browser.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the frontend.
