import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// "Accounts mode" turns on only when both env vars are set at build time.
// Otherwise the app stays in the static/device model and none of this loads.
export const BACKEND = Boolean(url && anon)

export const supabase = BACKEND
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
