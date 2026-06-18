// Katha Cards — Stripe billing Worker (Cloudflare Workers).
//
// Routes:
//   POST /create-checkout-session  { device, successUrl, cancelUrl } -> { url }
//   POST /webhook                  Stripe webhook (signed) -> records entitlement
//   GET  /entitlement?device=ID    -> { premium: boolean }
//
// Entitlement is keyed by an anonymous device id the frontend generates and
// passes as the Checkout client_reference_id. The webhook flips a KV flag when
// the subscription is active and clears it when it ends.
//
// Required secrets / vars (see README):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET, ALLOWED_ORIGIN
//   KV binding: ENTITLEMENTS

const json = (obj, status, origin) =>
  new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json', ...cors(origin) },
  })

function cors(origin) {
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  }
}

const enc = new TextEncoder()
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

async function hmacHex(secret, payload) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(payload)))
}

// Verify a Stripe webhook signature (header: "t=...,v1=..."). Constant-ish time.
async function verifyStripeSig(header, body, secret) {
  if (!header) return false
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')))
  if (!parts.t || !parts.v1) return false
  const expected = await hmacHex(secret, `${parts.t}.${body}`)
  if (expected.length !== parts.v1.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i)
  return diff === 0
}

// Minimal Stripe REST calls (no SDK — the node SDK doesn't run on Workers).
async function stripe(env, path, form) {
  const body = new URLSearchParams(form).toString()
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  return r.json()
}

async function stripeGet(env, path) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  })
  return r.json()
}

// Live, authoritative check: does any Stripe customer with this email have an
// active (or trialing) subscription? This is what makes Premium follow the
// person — restorable on any device by the email used at checkout.
async function emailHasActiveSub(env, email) {
  const custs = await stripeGet(env, `customers?email=${encodeURIComponent(email)}&limit=10`)
  for (const c of custs?.data || []) {
    const subs = await stripeGet(env, `subscriptions?customer=${c.id}&status=all&limit=100`)
    if ((subs?.data || []).some((s) => s.status === 'active' || s.status === 'trialing')) return true
  }
  return false
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = env.ALLOWED_ORIGIN || request.headers.get('origin') || '*'

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })

    // --- Start a subscription checkout ---------------------------------------
    if (url.pathname === '/create-checkout-session' && request.method === 'POST') {
      const { device, successUrl, cancelUrl } = await request.json().catch(() => ({}))
      if (!device) return json({ error: 'missing device' }, 400, origin)
      const session = await stripe(env, 'checkout/sessions', {
        mode: 'subscription',
        'line_items[0][price]': env.STRIPE_PRICE_ID,
        'line_items[0][quantity]': '1',
        client_reference_id: device,
        success_url: successUrl || `${origin}/?upgrade=success`,
        cancel_url: cancelUrl || `${origin}/?upgrade=cancel`,
        allow_promotion_codes: 'true',
      })
      if (session.error) return json({ error: session.error.message }, 400, origin)
      return json({ url: session.url, id: session.id }, 200, origin)
    }

    // --- Stripe webhook -------------------------------------------------------
    if (url.pathname === '/webhook' && request.method === 'POST') {
      const body = await request.text()
      const ok = await verifyStripeSig(request.headers.get('stripe-signature'), body, env.STRIPE_WEBHOOK_SECRET)
      if (!ok) return new Response('bad signature', { status: 400 })
      const event = JSON.parse(body)
      const obj = event.data?.object || {}

      if (event.type === 'checkout.session.completed') {
        const device = obj.client_reference_id
        if (device && obj.subscription) {
          await env.ENTITLEMENTS.put(`device:${device}`, JSON.stringify({ active: true, sub: obj.subscription }))
          await env.ENTITLEMENTS.put(`sub:${obj.subscription}`, device)
        }
      } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const device = await env.ENTITLEMENTS.get(`sub:${obj.id}`)
        if (device) {
          const active = obj.status === 'active' || obj.status === 'trialing'
          await env.ENTITLEMENTS.put(`device:${device}`, JSON.stringify({ active, sub: obj.id }))
        }
      }
      return new Response('ok', { status: 200 })
    }

    // --- Entitlement check ----------------------------------------------------
    // ?email=  -> live Stripe lookup (works on any device; for "Restore").
    // ?device= -> fast KV lookup for the device that purchased (webhook-fresh).
    if (url.pathname === '/entitlement' && request.method === 'GET') {
      const email = url.searchParams.get('email')
      if (email) {
        const premium = await emailHasActiveSub(env, email.trim().toLowerCase())
        return json({ premium }, 200, origin)
      }
      const device = url.searchParams.get('device')
      if (!device) return json({ premium: false }, 200, origin)
      const raw = await env.ENTITLEMENTS.get(`device:${device}`)
      const premium = raw ? Boolean(JSON.parse(raw).active) : false
      return json({ premium }, 200, origin)
    }

    return json({ error: 'not found' }, 404, origin)
  },
}
