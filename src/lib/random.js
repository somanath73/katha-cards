export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const DIFFICULTIES = ['easy', 'medium', 'hard']

// Draw n questions for a card.
//  - Free players (premium=false) always get the SAME first n EASY questions,
//    in bank order — a fixed taste of the deck.
//  - Premium players pick a difficulty ('all' | 'easy' | 'medium' | 'hard') and
//    get a fresh, shuffled draw that prefers questions they haven't seen yet.
export function drawQuestions(all, n, seenIds, opts = {}) {
  const { difficulty = 'all', premium = true } = opts

  if (!premium) {
    const easy = all.filter((q) => q.difficulty === 'easy')
    return (easy.length ? easy : all).slice(0, n)
  }

  let pool = difficulty === 'all' ? all : all.filter((q) => q.difficulty === difficulty)
  if (pool.length === 0) pool = all

  const seen = seenIds || new Set()
  const unseen = pool.filter((q) => !seen.has(q.id))
  const draw = unseen.length >= n ? unseen : [...unseen, ...shuffle(pool.filter((q) => seen.has(q.id)))]
  return shuffle(draw).slice(0, n)
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
