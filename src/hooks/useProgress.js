import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const KEY = 'katha-progress-v1' // per-card progress
const MKEY = 'katha-meta-v1' // per-deck play + daily streak (drives the dashboard stats)

const today = () => new Date().toISOString().slice(0, 10)
const dayBefore = (iso) => new Date(new Date(iso).getTime() - 86400000).toISOString().slice(0, 10)

function loadJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch {
    return {}
  }
}

export function useProgress() {
  const [data, setData] = useState(() => loadJSON(KEY))
  const [meta, setMeta] = useState(() => loadJSON(MKEY))
  const syncRef = useRef(null) // (deck, cardId, entry) => void — set in accounts mode

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])
  useEffect(() => {
    localStorage.setItem(MKEY, JSON.stringify(meta))
  }, [meta])

  const record = useCallback((deck, cardId, score, qIds) => {
    setData((d) => {
      const cur = d[cardId] || { plays: 0, best: 0, seen: [] }
      const seen = Array.from(new Set([...cur.seen, ...qIds]))
      const entry = { plays: cur.plays + 1, best: Math.max(cur.best, score), seen }
      if (syncRef.current) Promise.resolve().then(() => syncRef.current(deck, cardId, entry))
      return { ...d, [cardId]: entry }
    })
    // per-deck tally + daily streak (drives the home dashboard)
    setMeta((m) => {
      const decks = { ...(m.decks || {}) }
      const dd = decks[deck] || { plays: 0, cards: {}, last: 0 }
      decks[deck] = { plays: dd.plays + 1, cards: { ...dd.cards, [cardId]: 1 }, last: Date.now() }
      const t = today()
      const s = { count: 0, longest: 0, last: null, ...(m.streak || {}) }
      if (s.last !== t) {
        s.count = s.last === dayBefore(t) ? s.count + 1 : 1
        s.last = t
        s.longest = Math.max(s.longest || 0, s.count)
      }
      return { ...m, decks, streak: s }
    })
  }, [])

  const setSync = useCallback((fn) => {
    syncRef.current = fn
  }, [])

  const mergeRemote = useCallback((rows) => {
    if (!rows?.length) return
    setData((d) => {
      const next = { ...d }
      for (const r of rows) {
        const cur = next[r.card_id] || { plays: 0, best: 0, seen: [] }
        next[r.card_id] = {
          plays: Math.max(cur.plays, r.plays || 0),
          best: Math.max(cur.best, r.best || 0),
          seen: Array.from(new Set([...cur.seen, ...(r.seen || [])])),
        }
      }
      return next
    })
  }, [])

  const seenFor = useCallback((cardId) => new Set(data[cardId]?.seen || []), [data])
  const bestFor = useCallback((cardId) => data[cardId]?.best || 0, [data])

  const stats = useCallback(
    (cardIds) => {
      let played = 0
      let mastered = 0
      let stars = 0
      for (const id of cardIds) {
        const e = data[id]
        if (!e) continue
        played++
        stars += e.best
        if (e.best === 3) mastered++
      }
      return { played, mastered, stars }
    },
    [data],
  )

  // Profile-wide aggregates for the dashboard (Continue Playing + stat cards).
  const overall = useMemo(() => {
    let quizzes = 0
    let starsTotal = 0
    let cardsPlayed = 0
    let mastered = 0
    for (const e of Object.values(data)) {
      if (!e || typeof e.plays !== 'number') continue
      quizzes += e.plays
      starsTotal += e.best
      cardsPlayed++
      if (e.best === 3) mastered++
    }
    const decks = meta.decks || {}
    const deckIds = Object.keys(decks)
    let lastDeck = null
    let lastAt = -1
    for (const id of deckIds) {
      if ((decks[id]?.last || 0) > lastAt) {
        lastAt = decks[id].last
        lastDeck = id
      }
    }
    return {
      decksPlayed: deckIds.length,
      quizzes,
      mastered,
      accuracy: cardsPlayed ? Math.round((starsTotal / (3 * cardsPlayed)) * 100) : 0,
      streak: meta.streak?.count || 0,
      longest: meta.streak?.longest || 0,
      lastDeck,
    }
  }, [data, meta])

  // Completion % for a deck (distinct cards played out of 100).
  const deckPct = useCallback(
    (deckId) => {
      const c = meta.decks?.[deckId]?.cards
      return c ? Math.min(100, Object.keys(c).length) : 0
    },
    [meta],
  )

  return { record, seenFor, bestFor, stats, setSync, mergeRemote, overall, deckPct }
}
