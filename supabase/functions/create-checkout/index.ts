// Creates a Stripe Checkout Session for the signed-in user.
// The user's id rides along in metadata so the webhook can grant entitlement.
import Stripe from 'https://esm.sh/stripe@16.2.0?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    // Identify the caller from their Supabase JWT.
    const authHeader = req.headers.get('Authorization') || ''
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return json({ error: 'auth required' }, 401)

    const { successUrl, cancelUrl } = await req.json().catch(() => ({}))
    const origin = req.headers.get('origin') || Deno.env.get('ALLOWED_ORIGIN') || ''

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
      success_url: successUrl || `${origin}/?upgrade=success`,
      cancel_url: cancelUrl || `${origin}/?upgrade=cancel`,
    })
    return json({ url: session.url })
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400)
  }
})
