// Adds "image": "art/<id>.webp" to each card that has a generated art file.
// Cards without art keep rendering their emblem fallback. Run:
//   node scripts/update-cards-images.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'mahabharat'
const cardsPath = join(root, `public/data/${category}/cards.json`)
const artDir = join(root, `public/data/${category}/art`)
const deck = JSON.parse(readFileSync(cardsPath, 'utf8'))

let withArt = 0
let without = 0
for (const c of deck.cards) {
  if (existsSync(join(artDir, `${c.id}.webp`))) {
    c.image = `art/${c.id}.webp`
    withArt++
  } else {
    delete c.image
    without++
  }
}

writeFileSync(cardsPath, JSON.stringify(deck, null, 2) + '\n')
console.log(`cards.json updated: ${withArt} cards with art, ${without} on emblem fallback`)
