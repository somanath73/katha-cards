import { useCallback, useEffect, useRef, useState } from 'react'

const KEY = 'katha-progress-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function useProgress() {
  const [data, setData] = useState(load)
  const syncRef = useRef(null) // (deck, cardId, entry) => void — set in accounts mode

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  const record = useCallback((deck, cardId, score, qIds) => {
    setData((d) => {
      const cur = d[cardId] || { plays: 0, best: 0, seen: [] }
      const seen = Array.from(new Set([...cur.seen, ...qIds]))
      const entry = { plays: cur.plays + 1, best: Math.max(cur.best, score), seen }
      // push to the server out of the render phase (no-op unless a sync is set)
      if (syncRef.current) Promise.resolve().then(() => syncRef.current(deck, cardId, entry))
      return { ...d, [cardId]: entry }
    })
  }, [])

  const setSync = useCallback((fn) => {
    syncRef.current = fn
  }, [])

  // Fold server rows into local progress (max best/plays, union of seen ids).
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

  return { record, seenFor, bestFor, stats, setSync, mergeRemote }
}
