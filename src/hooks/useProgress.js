import { useCallback, useEffect, useState } from 'react'

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

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  const record = useCallback((cardId, score, qIds) => {
    setData((d) => {
      const cur = d[cardId] || { plays: 0, best: 0, seen: [] }
      const seen = Array.from(new Set([...cur.seen, ...qIds]))
      return { ...d, [cardId]: { plays: cur.plays + 1, best: Math.max(cur.best, score), seen } }
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

  return { record, seenFor, bestFor, stats }
}
