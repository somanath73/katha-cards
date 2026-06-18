import { useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Billing config. Katha Cards is a static site, so real recurring payments run
// through a tiny Cloudflare Worker (see /worker) that talks to Stripe.
//
//   apiBase  — deployed Worker origin. When set, checkout uses a real Stripe
//              Checkout Session and premium is VERIFIED server-side (webhook +
//              KV), so it can't be faked by hitting the success URL.
//   paymentLink — a Stripe Payment Link URL. Simpler fallback when no Worker is
//              deployed: real payment, but entitlement is trust-on-redirect.
//   price    — display string only.
//
// With neither set, the Upgrade button unlocks locally so the flow is testable
// before Stripe is wired up.
// ---------------------------------------------------------------------------
export const BILLING = {
  apiBase: '', // e.g. 'https://katha-billing.YOURNAME.workers.dev'
  paymentLink: '', // e.g. 'https://buy.stripe.com/xxxxxxxx'
  price: '$0.99',
  period: 'year',
}

export const PREMIUM_PERKS = [
  'All three difficulties — easy, medium & hard',
  'Fresh, randomised questions every draw',
  'The full 3,000-question bank across every deck',
  'Support new decks & artwork',
]

const PREMIUM_KEY = 'katha-premium-v1'
const DEVICE_KEY = 'katha-device-v1'
const RETURN_PARAM = 'upgrade'

const base = import.meta.env.BASE_URL || '/'

function rid() {
  try {
    return crypto.randomUUID()
  } catch {
    return 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export function deviceId() {
  let id = null
  try {
    id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = rid()
      localStorage.setItem(DEVICE_KEY, id)
    }
  } catch {
    id = id || rid()
  }
  return id
}

export function isPremiumLocal() {
  try {
    return localStorage.getItem(PREMIUM_KEY) === '1'
  } catch {
    return false
  }
}

function setPremiumLocal(v) {
  try {
    if (v) localStorage.setItem(PREMIUM_KEY, '1')
    else localStorage.removeItem(PREMIUM_KEY)
  } catch {
    /* ignore */
  }
}

// Ask the Worker whether this device's subscription is active.
async function verifyEntitlement() {
  if (!BILLING.apiBase) return isPremiumLocal()
  try {
    const r = await fetch(`${BILLING.apiBase}/entitlement?device=${encodeURIComponent(deviceId())}`, {
      headers: { accept: 'application/json' },
    })
    if (!r.ok) return isPremiumLocal()
    const j = await r.json()
    const active = Boolean(j.premium)
    setPremiumLocal(active)
    return active
  } catch {
    return isPremiumLocal()
  }
}

const successUrl = `${location.origin}${base}?${RETURN_PARAM}=success`
const cancelUrl = `${location.origin}${base}?${RETURN_PARAM}=cancel`

// Send the player to Stripe (or unlock locally if billing isn't configured yet).
export async function startCheckout() {
  const device = deviceId()
  if (BILLING.apiBase) {
    try {
      const r = await fetch(`${BILLING.apiBase}/create-checkout-session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ device, successUrl, cancelUrl }),
      })
      const j = await r.json()
      if (j.url) {
        location.href = j.url
        return { redirected: true }
      }
    } catch {
      /* fall through */
    }
  }
  if (BILLING.paymentLink) {
    const u = new URL(BILLING.paymentLink)
    u.searchParams.set('client_reference_id', device)
    location.href = u.toString()
    return { redirected: true }
  }
  // No billing configured — unlock locally so the experience is testable.
  setPremiumLocal(true)
  return { redirected: false, unlocked: true }
}

// Handle the redirect back from Stripe. Returns 'success' | 'cancel' | null.
async function consumeReturn() {
  const params = new URLSearchParams(location.search)
  const status = params.get(RETURN_PARAM)
  if (!status) return null
  // Clean the URL so a refresh doesn't re-trigger.
  params.delete(RETURN_PARAM)
  const clean = base + (params.toString() ? `?${params}` : '') + location.hash
  history.replaceState(null, '', clean)
  if (status === 'success') {
    if (BILLING.apiBase) {
      // Webhook may lag a beat; poll entitlement briefly.
      for (let i = 0; i < 5; i++) {
        if (await verifyEntitlement()) break
        await new Promise((res) => setTimeout(res, 1200))
      }
    } else {
      setPremiumLocal(true)
    }
  }
  return status
}

export function usePremium() {
  const [premium, setPremium] = useState(isPremiumLocal)
  const [justUpgraded, setJustUpgraded] = useState(false)

  useEffect(() => {
    let dead = false
    ;(async () => {
      const ret = await consumeReturn()
      const active = await verifyEntitlement()
      if (dead) return
      setPremium(active)
      if (ret === 'success' && active) setJustUpgraded(true)
    })()
    return () => {
      dead = true
    }
  }, [])

  const upgrade = useCallback(async () => {
    const r = await startCheckout()
    if (r.unlocked) setPremium(true)
    return r
  }, [])

  const restore = useCallback(async () => {
    const active = await verifyEntitlement()
    setPremium(active)
    return active
  }, [])

  const clearUpgraded = useCallback(() => setJustUpgraded(false), [])

  return { premium, justUpgraded, clearUpgraded, upgrade, restore }
}
