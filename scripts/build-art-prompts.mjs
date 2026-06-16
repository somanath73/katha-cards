// Builds .art/prompts.json = [{id, prompt}] for all 100 cards using one locked
// cinematic style recipe + each card's own subject. Run: node scripts/build-art-prompts.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const deck = JSON.parse(readFileSync(join(root, 'public/data/mahabharat/cards.json'), 'utf8'))

// The locked "Cinematic epic" style — applied identically to every card.
const STYLE =
  'Modern cinematic fantasy key art, dramatic digital painting, epic movie-poster lighting, ' +
  'glowing volumetric god-rays, rich saturated teal-and-gold cinematic color grade, dynamic ' +
  'swirling atmosphere, ultra-detailed, trending concept art, full-bleed vertical composition, ' +
  'cinematic depth of field, ancient India, Mahabharata epic. No text, no lettering, no words, no numerals, no signature.'

const lead = (c) => {
  switch (c.type) {
    case 'character':
      return `A single heroic central figure portrait: ${c.title}, ${c.subtitle}.`
    case 'event':
      return `A dramatic cinematic scene depicting ${c.title} (${c.subtitle}).`
    case 'place':
      return `A sweeping epic establishing shot of ${c.title}, ${c.subtitle}, no central person.`
    case 'artifact':
      return `A single legendary object as the hero of the frame, glowing with divine power: ${c.title}, ${c.subtitle}. No human figure.`
    case 'concept':
      return `A symbolic, allegorical composition representing ${c.title}, ${c.subtitle}.`
    default:
      return `${c.title}, ${c.subtitle}.`
  }
}

const prompts = deck.cards.map((c) => ({
  id: c.id,
  prompt: `${lead(c)} ${c.description} ${STYLE}`,
}))

mkdirSync(join(root, '.art'), { recursive: true })
writeFileSync(join(root, '.art/prompts.json'), JSON.stringify(prompts, null, 2))
console.log(`Wrote ${prompts.length} prompts to .art/prompts.json`)
console.log('Sample:', JSON.stringify(prompts[31], null, 2))
