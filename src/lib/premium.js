import { useCallback, useEffect, useState } from 'react'
import { BACKEND } from './supabase'
import * as account from './account'

// ---------------------------------------------------------------------------
// Billing config. Katha Cards is a static site, so real recurring payments run
// through a tiny Cloudflare Worker (see /worker) that talks to Stripe.
//
//   apiBase  — deployed Worker origin. When set, checkout uses a real Stripe
//              Checkout Session and premium is VERIFIED server-side. Entitlement
//              follows the customer's EMAIL, so it restores on any device.
//   paymentLink — a Stripe Payment Link URL. Simpler fallback when no Worker is
//              deployed: real payment, but entitlement is trust-on-redirect.
//   price/period — display strings only.
//
// With neither set, the Upgrade button unlocks locally so the flow is testable
// before Stripe is wired up.
// ---------------------------------------------------------------------------
export const BILLING = {
  apiBase: '', // e.g. 'https://katha-billing.YOURNAME.workers.dev'
  paymentLink: '', // e.g. 'https://buy.stripe.com/xxxxxxxx'
  price: '$0.99',
  period: 'year',
  launchNote: 'Launch price', // shown under the price; clear later for normal pricing
}

// At-a-glance Free vs Premium so the paywall shows what free already gives you.
export const PLAN_COMPARE = [
  { label: 'Easy questions, every deck', free: true, prem: true },
  { label: 'Medium & Hard difficulty', free: false, prem: true },
  { label: 'A fresh, random draw every time', free: false, prem: true },
  { label: 'The full 3,000-question bank', free: false, prem: true },
  { label: 'Future decks & artwork', free: false, prem: true },
]

const PREMIUM_KEY = 'katha-premium-v1'
const DEVICE_KEY = 'katha-device-v1'
const EMAIL_KEY = 'katha-email-v1'
const VERIFY_KEY = 'katha-verify-v1' // { premium, ts } — caches the email re-check
const RETURN_PARAM = 'upgrade'
const VERIFY_TTL = 12 * 60 * 60 * 1000 // re-check the email against Stripe twice a day

const base = import.meta.env.BASE_URL || '/'

const ls = {
  get(k) {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* ignore */
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

function rid() {
  try {
    return crypto.randomUUID()
  } catch {
    return 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export function deviceId() {
  let id = ls.get(DEVICE_KEY)
  if (!id) {
    id = rid()
    ls.set(DEVICE_KEY, id)
  }
  return id
}

export const getEmail = () => ls.get(EMAIL_KEY) || ''
const setEmail = (e) => (e ? ls.set(EMAIL_KEY, e) : ls.del(EMAIL_KEY))

export function isPremiumLocal() {
  return ls.get(PREMIUM_KEY) === '1'
}
function setPremiumLocal(v) {
  if (v) ls.set(PREMIUM_KEY, '1')
  else {
    ls.del(PREMIUM_KEY)
    ls.del(VERIFY_KEY)
  }
}

function readVerifyCache() {
  try {
    const c = JSON.parse(ls.get(VERIFY_KEY) || 'null')
    if (c && Date.now() - c.ts < VERIFY_TTL) return Boolean(c.premium)
  } catch {
    /* ignore */
  }
  return null
}
function writeVerifyCache(premium) {
  ls.set(VERIFY_KEY, JSON.stringify({ premium, ts: Date.now() }))
}

const norm = (e) => (e || '').trim().toLowerCase()

async function ask(query) {
  const r = await fetch(`${BILLING.apiBase}/entitlement?${query}`, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('entitlement http ' + r.status)
  const j = await r.json()
  return Boolean(j.premium)
}

// Source of truth: the deployed Worker (which checks Stripe). If an email is on
// file we follow that (restores anywhere, cached to limit Stripe calls); the
// buying device falls back to its device id (kept fresh by webhooks in KV).
async function verifyEntitlement({ force = false } = {}) {
  if (!BILLING.apiBase) return isPremiumLocal()
  const email = getEmail()
  try {
    let active
    if (email) {
      if (!force) {
        const cached = readVerifyCache()
        if (cached !== null) return cached
      }
      active = await ask(`email=${encodeURIComponent(email)}`)
      writeVerifyCache(active)
    } else {
      active = await ask(`device=${encodeURIComponent(deviceId())}`)
    }
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
  setPremiumLocal(true) // no billing configured — unlock locally for testing
  return { redirected: false, unlocked: true }
}

// Restore an existing subscription on THIS device by email (works after a
// reinstall, on a new phone, in another browser…). Verified live against Stripe.
export async function restoreByEmail(rawEmail) {
  const email = norm(rawEmail)
  if (!email) return false
  if (!BILLING.apiBase) {
    setEmail(email)
    setPremiumLocal(true) // test mode (no backend)
    return true
  }
  const active = await ask(`email=${encodeURIComponent(email)}`)
  if (active) {
    setEmail(email)
    setPremiumLocal(true)
    writeVerifyCache(true)
  }
  return active
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Strip the ?upgrade= param from the URL and return its value.
function consumeReturn() {
  const params = new URLSearchParams(location.search)
  const status = params.get(RETURN_PARAM)
  if (!status) return null
  params.delete(RETURN_PARAM)
  history.replaceState(null, '', base + (params.toString() ? `?${params}` : '') + location.hash)
  return status
}

// One hook, two modes. STATIC: device/email entitlement (localStorage + optional
// Worker). ACCOUNTS: Supabase magic-link auth + server-verified entitlement.
export function usePremium() {
  const [premium, setPremium] = useState(() => (BACKEND ? false : isPremiumLocal()))
  const [user, setUser] = useState(null)
  const [justUpgraded, setJustUpgraded] = useState(false)

  useEffect(() => {
    let dead = false
    let unsub = () => {}
    ;(async () => {
      const ret = consumeReturn()

      if (BACKEND) {
        unsub = account.onAuthChange(async (u) => {
          if (dead) return
          setUser(u)
          setPremium(u ? await account.fetchEntitlement() : false)
        })
        const u = await account.currentUser()
        if (dead) return
        setUser(u)
        let active = u ? await account.fetchEntitlement() : false
        if (ret === 'success' && u && !active) {
          for (let i = 0; i < 6 && !active; i++) {
            await sleep(1400)
            active = await account.fetchEntitlement()
          }
        }
        if (dead) return
        setPremium(active)
        if (ret === 'success' && active) setJustUpgraded(true)
        return
      }

      // static mode
      if (ret === 'success') {
        if (BILLING.apiBase) {
          for (let i = 0; i < 5; i++) {
            if (await verifyEntitlement({ force: true })) break
            await sleep(1200)
          }
        } else {
          setPremiumLocal(true)
        }
      }
      const active = await verifyEntitlement()
      if (dead) return
      setPremium(active)
      if (ret === 'success' && active) setJustUpgraded(true)
    })()
    return () => {
      dead = true
      unsub()
    }
  }, [])

  const upgrade = useCallback(async () => {
    if (BACKEND) {
      const u = await account.currentUser()
      if (!u) return { needAuth: true } // paywall will prompt sign-in first
      return account.startCheckoutBackend(successUrl, cancelUrl)
    }
    const r = await startCheckout()
    if (r.unlocked) setPremium(true)
    return r
  }, [])

  // STATIC: verify an existing sub by email. ACCOUNTS: email a magic link
  // (signing in with the checkout email restores the subscription).
  const restore = useCallback(async (email) => {
    if (BACKEND) {
      const r = await account.signInWithEmail(email)
      return r.ok ? 'sent' : false
    }
    const ok = await restoreByEmail(email)
    if (ok) setPremium(true)
    return ok
  }, [])

  const signIn = useCallback(async (email) => account.signInWithEmail(email), [])
  const signOut = useCallback(async () => {
    await account.signOut()
    setUser(null)
    setPremium(false)
  }, [])

  const clearUpgraded = useCallback(() => setJustUpgraded(false), [])

  return {
    mode: BACKEND ? 'accounts' : 'static',
    premium,
    user,
    justUpgraded,
    clearUpgraded,
    upgrade,
    restore,
    signIn,
    signOut,
  }
}

// --- free daily allowance --------------------------------------------------
// A generous, client-side soft cap on free question rounds (free content is
// public static JSON, so this can only ever be a nudge). Set to 0 = unlimited.
export const FREE_DAILY_DRAWS = 10
const DRAWS_KEY = 'katha-draws-v1'
const today = () => new Date().toISOString().slice(0, 10)

function readDraws() {
  try {
    const d = JSON.parse(ls.get(DRAWS_KEY) || 'null')
    return d && d.day === today() ? d.count : 0
  } catch {
    return 0
  }
}

export function freeDrawsLeft() {
  if (!FREE_DAILY_DRAWS) return Infinity
  return Math.max(0, FREE_DAILY_DRAWS - readDraws())
}

export function noteFreeDraw() {
  if (!FREE_DAILY_DRAWS) return
  ls.set(DRAWS_KEY, JSON.stringify({ day: today(), count: readDraws() + 1 }))
}
