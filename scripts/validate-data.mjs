// Validates cards.json + every question bank. Run: node scripts/validate-data.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'public', 'data', 'mahabharat')
const EMBLEMS = new Set(['chakra','bow','arrow','conch','mace','sword','trident','spear','shield','chariot','crown','throne','palace','dice','scroll','flute','lotus','tree','fire','river','mountain','sun','moon','star','serpent','garuda','elephant','horse','eye','vessel'])
const PALETTES = new Set(['royal','flame','forest','ocean','dusk','dawn'])
const TYPES = new Set(['character','event','place','artifact','concept'])

const problems = []
const deck = JSON.parse(readFileSync(join(dataDir, 'cards.json'), 'utf8'))

if (deck.cards.length !== 100) problems.push(`cards.json has ${deck.cards.length} cards, expected 100`)
const ids = new Set()
for (const c of deck.cards) {
  if (ids.has(c.id)) problems.push(`duplicate card id: ${c.id}`)
  ids.add(c.id)
  if (!EMBLEMS.has(c.emblem)) problems.push(`${c.id}: unknown emblem "${c.emblem}"`)
  if (!PALETTES.has(c.palette)) problems.push(`${c.id}: unknown palette "${c.palette}"`)
  if (!TYPES.has(c.type)) problems.push(`${c.id}: unknown type "${c.type}"`)
  if (!c.title || !c.subtitle || !c.description) problems.push(`${c.id}: missing text field`)
}
const orders = new Set(deck.cards.map((c) => c.order))
if (orders.size !== deck.cards.length) problems.push('duplicate order values')

const qDir = join(dataDir, 'questions')
const onDisk = new Set(existsSync(qDir) ? readdirSync(qDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : [])
const missing = []
const invalid = []
let totalQ = 0

for (const c of deck.cards) {
  if (!onDisk.has(c.id)) {
    missing.push(c.id)
    continue
  }
  try {
    const bank = JSON.parse(readFileSync(join(qDir, `${c.id}.json`), 'utf8'))
    const qs = bank.questions
    if (bank.cardId !== c.id) throw new Error(`cardId mismatch: ${bank.cardId}`)
    if (!Array.isArray(qs) || qs.length !== 30) throw new Error(`${qs?.length ?? 0} questions, expected 30`)
    for (const q of qs) {
      if (!q.q || typeof q.q !== 'string') throw new Error(`${q.id}: bad question text`)
      if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`${q.id}: needs 4 options`)
      if (new Set(q.options).size !== 4) throw new Error(`${q.id}: duplicate options`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) throw new Error(`${q.id}: bad answer index`)
      if (!['easy', 'medium', 'hard'].includes(q.difficulty)) throw new Error(`${q.id}: bad difficulty`)
      if (!q.explanation) throw new Error(`${q.id}: missing explanation`)
    }
    totalQ += qs.length
  } catch (e) {
    invalid.push(`${c.id}: ${e.message}`)
  }
}

for (const f of onDisk) if (!ids.has(f)) problems.push(`orphan question file: ${f}.json`)

console.log(JSON.stringify({
  cards: deck.cards.length,
  banksValid: deck.cards.length - missing.length - invalid.length,
  totalQuestions: totalQ,
  missing,
  invalid,
  problems,
}, null, 2))
