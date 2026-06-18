// Accounts-mode helpers (Supabase). All no-ops unless BACKEND is on.
import { supabase, BACKEND } from './supabase'

const redirectTo = location.origin + (import.meta.env.BASE_URL || '/')

export function onAuthChange(cb) {
  if (!BACKEND) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null))
  return () => data.subscription.unsubscribe()
}

export async function currentUser() {
  if (!BACKEND) return null
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

// Passwordless magic-link / OTP sign-in. Doubles as "restore" — signing in with
// the email used at checkout brings the subscription with you.
export async function signInWithEmail(email) {
  if (!BACKEND) return { ok: false }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: redirectTo },
  })
  return { ok: !error, error: error?.message }
}

export async function signOut() {
  if (BACKEND) await supabase.auth.signOut()
}

// Server-verified entitlement (RLS: a user can only read their own row).
export async function fetchEntitlement() {
  if (!BACKEND) return false
  const { data } = await supabase
    .from('entitlements')
    .select('is_premium,current_period_end')
    .maybeSingle()
  if (!data || !data.is_premium) return false
  return !data.current_period_end || new Date(data.current_period_end) > new Date()
}

// Start a real Stripe Checkout via the edge function (must be signed in).
export async function startCheckoutBackend(successUrl, cancelUrl) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { successUrl, cancelUrl },
  })
  if (error) throw error
  if (data?.url) {
    location.href = data.url
    return { redirected: true }
  }
  throw new Error('no checkout url')
}

// Premium (medium/hard) questions — RLS returns rows ONLY to a premium account.
export async function fetchPremiumQuestions(deck, cardId) {
  if (!BACKEND) return []
  const { data } = await supabase
    .from('premium_questions')
    .select('q,idx')
    .eq('deck', deck)
    .eq('card_id', cardId)
    .order('idx')
  return (data || []).map((r) => r.q)
}

// --- progress sync --------------------------------------------------------
export async function loadRemoteProgress() {
  if (!BACKEND) return []
  const { data } = await supabase.from('progress').select('deck,card_id,best,plays,seen')
  return data || []
}

export async function pushProgressRow(deck, cardId, entry) {
  if (!BACKEND) return
  const user = await currentUser()
  if (!user) return
  await supabase.from('progress').upsert(
    {
      user_id: user.id,
      deck,
      card_id: cardId,
      best: entry.best,
      plays: entry.plays,
      seen: entry.seen,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,deck,card_id' },
  )
}
