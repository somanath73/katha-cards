import { CATEGORIES } from '../data/categories'

// Daily Challenge: one card per day, played on Hard. Deterministic by date so
// everyone gets the same card all day and it rolls over at local midnight.

// Local YYYY-MM-DD (local, not UTC, so the roll-over matches the player's day).
export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Stable 32-bit hash of a string (FNV-1a).
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Picks today's deck + card deterministically and returns { categoryId, card }.
// Fetches the chosen deck's cards.json. Returns null if no data is available.
export async function pickDailyChallenge(base) {
  const decks = CATEGORIES.filter((c) => c.live)
  if (!decks.length) return null
  const key = todayKey()
  const deck = decks[hash(`deck:${key}`) % decks.length]
  const res = await fetch(`${base}data/${deck.id}/cards.json`)
  if (!res.ok) throw new Error('daily: cards unavailable')
  const cards = (await res.json()).cards || []
  if (!cards.length) return null
  const card = cards[hash(`card:${key}`) % cards.length]
  return { categoryId: deck.id, deckName: deck.name, card, key }
}
