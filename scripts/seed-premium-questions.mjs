// Uploads the medium + hard questions of every deck into Supabase
// `premium_questions` (the RLS-protected table). Easy questions stay as public
// static JSON (the free tier). Run with the SERVICE ROLE key — never ship it.
//
//   npm i @supabase/supabase-js
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   node scripts/seed-premium-questions.mjs
//
// Add --strip-public to ALSO rewrite the public question files to keep only the
// easy questions (so the protected ones no longer ship in the static build).
// Only do this once you've committed to the Supabase backend.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const strip = process.argv.includes('--strip-public')
const supabase = createClient(url, key, { auth: { persistSession: false } })

const dataDir = join(root, 'public', 'data')
const decks = readdirSync(dataDir).filter((d) => {
  try {
    return readdirSync(join(dataDir, d, 'questions')).length > 0
  } catch {
    return false
  }
})

let totalRows = 0
for (const deck of decks) {
  const qDir = join(dataDir, deck, 'questions')
  const files = readdirSync(qDir).filter((f) => f.endsWith('.json'))
  const rows = []
  for (const f of files) {
    const cardId = f.replace(/\.json$/, '')
    const bank = JSON.parse(readFileSync(join(qDir, f), 'utf8'))
    bank.questions.forEach((q, idx) => {
      if (q.difficulty === 'medium' || q.difficulty === 'hard') {
        rows.push({ deck, card_id: cardId, idx, difficulty: q.difficulty, q })
      }
    })
    if (strip) {
      bank.questions = bank.questions.filter((q) => q.difficulty === 'easy')
      writeFileSync(join(qDir, f), JSON.stringify(bank, null, 2) + '\n')
    }
  }
  // upsert in chunks to stay under request limits
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500)
    const { error } = await supabase.from('premium_questions').upsert(chunk, { onConflict: 'deck,card_id,idx' })
    if (error) {
      console.error(`${deck}: ${error.message}`)
      process.exit(1)
    }
  }
  totalRows += rows.length
  console.log(`${deck.padEnd(18)} ${rows.length} premium questions${strip ? ' (stripped from public)' : ''}`)
}
console.log(`Done — ${totalRows} medium/hard questions uploaded.`)
if (!strip) console.log('Tip: re-run with --strip-public to remove them from the static build.')
