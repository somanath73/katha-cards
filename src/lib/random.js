export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Draw n questions, preferring ones the player hasn't seen yet; once the
// bank is exhausted, seen questions cycle back in.
export function drawQuestions(all, n, seenIds) {
  const seen = seenIds || new Set()
  const unseen = all.filter((q) => !seen.has(q.id))
  const pool = unseen.length >= n ? unseen : [...unseen, ...shuffle(all.filter((q) => seen.has(q.id)))]
  return shuffle(pool).slice(0, n)
}

export function toRoman(n) {
  const map = [
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let out = ''
  for (const [v, s] of map) {
    while (n >= v) {
      out += s
      n -= v
    }
  }
  return out || 'I'
}
