// Stripe webhook -> writes entitlement (service role, bypasses RLS).
// Configure this URL in Stripe with events:
//   checkout.session.completed, customer.subscription.created/updated/deleted
// Deploy with --no-verify-jwt (Stripe can't send a Supabase JWT).
//
// Hardening (per security review): we trust ONLY the server-set metadata.user_id,
// re-fetch the live subscription from Stripe as the source of truth (handles
// unpaid sessions + out-of-order delivery), and dedupe on event.id.
import Stripe from 'https://esm.sh/stripe@16.2.0?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const iso = (unixSeconds?: number | null) =>
  unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    )
  } catch (e) {
    return new Response(`bad signature: ${(e as Error).message}`, { status: 400 })
  }

  // Idempotency / replay guard — skip events we've already applied.
  const seen = await admin.from('webhook_events').select('event_id').eq('event_id', event.id).maybeSingle()
  if (seen.data) return new Response('duplicate', { status: 200 })

  const obj = event.data.object as Record<string, unknown>

  // Resolve the subscription id + the user from server-set metadata only.
  let subscriptionId: string | undefined
  let userId: string | undefined
  if (event.type === 'checkout.session.completed') {
    const s = obj as unknown as Stripe.Checkout.Session
    if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') {
      return new Response('unpaid', { status: 200 })
    }
    subscriptionId = s.subscription ? String(s.subscription) : undefined
    userId = (s.metadata?.user_id as string) || undefined // NOT client_reference_id
  } else if (event.type.startsWith('customer.subscription.')) {
    const sub = obj as unknown as Stripe.Subscription
    subscriptionId = sub.id
    userId = (sub.metadata?.user_id as string) || undefined
  } else {
    return new Response('ignored', { status: 200 })
  }
  if (!subscriptionId) return new Response('no subscription', { status: 200 })

  try {
    // Source of truth: the live subscription, not the (possibly stale) event body.
    const sub = await stripe.subscriptions.retrieve(subscriptionId)

    // Fall back to an existing mapping if metadata is absent (e.g. on delete).
    if (!userId) {
      const { data } = await admin
        .from('entitlements')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()
      userId = data?.user_id
    }
    if (!userId) return new Response('unmapped', { status: 200 })

    const active = sub.status === 'active' || sub.status === 'trialing'
    const periodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end

    await admin.from('entitlements').upsert({
      user_id: userId,
      is_premium: active,
      status: sub.status,
      current_period_end: iso(periodEnd),
      stripe_customer_id: String(sub.customer),
      stripe_subscription_id: sub.id,
      updated_at: new Date().toISOString(),
    })

    // Record only after a successful apply (so a mid-failure lets Stripe retry).
    await admin.from('webhook_events').insert({ event_id: event.id }).then(
      () => {},
      () => {},
    )
  } catch (e) {
    return new Response(`handler error: ${(e as Error).message}`, { status: 500 })
  }

  return new Response('ok', { status: 200 })
})
