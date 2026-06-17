// Builds .art/<category>.prompts.json = [{id, prompt}] for all cards in a deck,
// using that deck's locked art style + each card's own subject.
// Run: node scripts/build-art-prompts.mjs <category>   (default: mahabharat)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'mahabharat'
const deck = JSON.parse(readFileSync(join(root, `public/data/${category}/cards.json`), 'utf8'))

// Per-deck locked style recipe + per-type framing.
const RECIPES = {
  mahabharat: {
    style:
      'Modern cinematic fantasy key art, dramatic digital painting, epic movie-poster lighting, ' +
      'glowing volumetric god-rays, rich saturated teal-and-gold cinematic color grade, dynamic ' +
      'swirling atmosphere, ultra-detailed, trending concept art, full-bleed vertical composition, ' +
      'cinematic depth of field, ancient India, Mahabharata epic. No text, no lettering, no words, no numerals, no signature.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A single heroic central figure portrait: ${c.title}, ${c.subtitle}.`
        case 'event': return `A dramatic cinematic scene depicting ${c.title} (${c.subtitle}).`
        case 'place': return `A sweeping epic establishing shot of ${c.title}, ${c.subtitle}, no central person.`
        case 'artifact': return `A single legendary object as the hero of the frame, glowing with divine power: ${c.title}, ${c.subtitle}. No human figure.`
        case 'concept': return `A symbolic, allegorical composition representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'freedom-struggle': {
    style:
      'Authentic vintage archival photograph of India between 1857 and 1947, monochrome black-and-white ' +
      'with warm sepia toning, fine film grain, soft worn photo texture, documentary realism, period-accurate ' +
      'clothing and setting, dignified and respectful. No text, no lettering, no captions, no watermark, no ' +
      'modern objects. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A dignified archival portrait photograph of ${c.title}, ${c.subtitle}.`
        case 'event': return `A historic documentary photograph capturing ${c.title} (${c.subtitle}).`
        case 'place': return `A period photograph of the place ${c.title}, ${c.subtitle}.`
        case 'artifact': return `A still-life period photograph of ${c.title}, ${c.subtitle}, as the subject of the frame.`
        case 'concept': return `An evocative symbolic period photograph representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'kings-kingdoms': {
    style:
      'Majestic realistic oil-painting with rich VIBRANT saturated colours and luminous warm golden light, ' +
      'bright jewel tones, glowing highlights, lifelike painterly detail, grand and regal uplifting mood, ' +
      'ornate colourful royal Indian attire and architecture, richly detailed. No text, no lettering, no ' +
      'captions, no picture frame, no border. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A majestic, vibrant oil-painting portrait of ${c.title}, ${c.subtitle}.`
        case 'event': return `A grand, colourful oil-painting depicting the historic scene of ${c.title} (${c.subtitle}).`
        case 'place': return `A grand, sunlit oil-painting of ${c.title}, ${c.subtitle}, a majestic Indian setting.`
        case 'artifact': return `A richly detailed, vibrant oil-painting of ${c.title}, ${c.subtitle}, as the glowing centerpiece.`
        case 'concept': return `A symbolic, majestic oil-painting evoking the glory of ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
}

const recipe = RECIPES[category]
if (!recipe) throw new Error(`No art recipe for category "${category}"`)

const prompts = deck.cards.map((c) => ({
  id: c.id,
  prompt: `${recipe.lead(c)} ${c.description} ${recipe.style}`,
}))

mkdirSync(join(root, '.art'), { recursive: true })
writeFileSync(join(root, `.art/${category}.prompts.json`), JSON.stringify(prompts, null, 2))
console.log(`Wrote ${prompts.length} prompts to .art/${category}.prompts.json`)
console.log('Sample:', JSON.stringify(prompts[28], null, 2))
