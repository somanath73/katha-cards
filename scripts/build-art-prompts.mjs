// Builds .art/<category>.prompts.json = [{id, prompt}] for all cards in a deck,
// using that deck's locked art style + each card's own subject.
// Run: node scripts/build-art-prompts.mjs <category>   (default: mahabharat)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'mahabharat'
const recipeKey = process.argv[3] || category // optional style override
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
  // Photoreal cinematic portraits — replaces the painterly K&K look so real
  // historical figures get specific, believable likenesses (approved style).
  'kings-kingdoms-real': {
    style:
      'Photorealistic, razor-sharp focus, ultra-detailed crisp fine detail on skin, beard, fabric weave ' +
      'and jewellery, dramatic warm golden lighting, rich true-to-life colour, period-accurate royal and ' +
      'ancient Indian attire and ornaments, regal and dignified mood, epic film-still quality, subtle ' +
      'volumetric god-rays, softly blurred Indian palace background. No text, no lettering, no captions, ' +
      'no watermark, no signature, no modern objects. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A photorealistic, dignified cinematic close-up portrait of a single historical figure: ${c.title}, ${c.subtitle}. Tight upper-body portrait, the figure fills the frame, face large and prominent.`
        case 'event': return `A photorealistic, cinematic depiction of the historic scene of ${c.title} (${c.subtitle}).`
        case 'place': return `A photorealistic, cinematic establishing shot of ${c.title}, ${c.subtitle}, a majestic Indian setting, no central person.`
        case 'artifact': return `A photorealistic, detailed cinematic close-up of ${c.title}, ${c.subtitle}, as the centerpiece. No human figure.`
        case 'concept': return `A photorealistic, symbolic cinematic composition evoking ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'indian-politics': {
    style:
      'Modern flat editorial illustration, clean bold vector style, vibrant limited colour palette, ' +
      'geometric shapes, smooth gradients, contemporary magazine and op-ed illustration aesthetic, ' +
      'crisp, stylish and dignified, civic and neutral. No text, no lettering, no words, no party symbols, ' +
      'no flags of any political party. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A bold flat editorial illustration portrait of ${c.title}, ${c.subtitle}.`
        case 'event': return `A bold flat editorial illustration depicting ${c.title} (${c.subtitle}).`
        case 'place': return `A bold flat editorial illustration of ${c.title}, ${c.subtitle}.`
        case 'artifact': return `A bold flat editorial illustration of ${c.title}, ${c.subtitle}, as the central subject.`
        case 'concept': return `A bold flat editorial conceptual illustration representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'indian-politics-real': {
    style:
      'Photorealistic, realistic natural cinematic lighting, rich true-to-life colours, documentary realism, ' +
      'highly detailed, dignified and respectful, civic and neutral, modern India. No text, no lettering, no ' +
      'party symbols, no political party flags, no captions. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A realistic, dignified portrait photograph of ${c.title}, ${c.subtitle}.`
        case 'event': return `A realistic, cinematic documentary photograph of the scene of ${c.title} (${c.subtitle}).`
        case 'place': return `A realistic photograph of ${c.title}, ${c.subtitle}.`
        case 'artifact': return `A realistic, detailed photograph of ${c.title}, ${c.subtitle}, as the central subject.`
        case 'concept': return `A realistic, evocative photographic image representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'mythology': {
    style:
      'Traditional Indian devotional painting in the luminous style of Raja Ravi Varma and classical temple ' +
      'calendar art, rich glowing jewel colours, divine golden aura and radiant halo light, ornate gold ' +
      'jewellery and silks, serene reverent idealised faces, lotus and celestial motifs, masterful soft ' +
      'realistic brushwork, sacred and majestic. No text, no lettering, no words, no captions, no watermark, ' +
      'no signature. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A reverent devotional painting portrait of ${c.title}, ${c.subtitle}.`
        case 'event': return `A dramatic devotional painting depicting the sacred episode of ${c.title} (${c.subtitle}).`
        case 'place': return `A majestic devotional painting of the sacred realm of ${c.title}, ${c.subtitle}, no central figure.`
        case 'artifact': return `A luminous devotional painting of the divine ${c.title}, ${c.subtitle}, as the radiant glowing centerpiece.`
        case 'concept': return `A symbolic, allegorical devotional painting representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  'indian-cinema': {
    style:
      'Vintage hand-painted Indian movie-poster art, classic Bollywood cinema-hoarding style, lush saturated ' +
      'technicolor, bold dramatic painterly brushwork, warm golden spotlight glow, expressive theatrical faces, ' +
      'nostalgic mid-century film-poster composition, rich reds and golds, ornate and romantic. No text, no ' +
      'lettering, no words, no captions, no title, no watermark, no signature. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'character': return `A bold hand-painted movie-poster portrait of ${c.title}, ${c.subtitle}.`
        case 'event': return `A dramatic hand-painted movie-poster scene depicting ${c.title} (${c.subtitle}).`
        case 'place': return `A vintage hand-painted poster-style depiction of ${c.title}, ${c.subtitle}, no central person.`
        case 'artifact': return `A hand-painted vintage movie-poster composition evoking ${c.title}, ${c.subtitle}.`
        case 'concept': return `A symbolic hand-painted movie-poster illustration representing ${c.title}, ${c.subtitle}.`
        default: return `${c.title}, ${c.subtitle}.`
      }
    },
  },
  // Photoreal architectural look so AI fallbacks blend with the real Wikimedia
  // photos that cover most of the deck.
  monuments: {
    style:
      'Photorealistic high-resolution travel photograph, razor-sharp focus, warm natural daylight, clear ' +
      'blue sky, ultra-detailed stonework and architecture, vivid true-to-life colour, professional ' +
      'architectural and landscape photography, epic wide establishing shot, subtle depth of field. No text, ' +
      'no lettering, no captions, no watermark, no signage, no tourists in the foreground. Vertical portrait orientation.',
    lead: (c) => {
      switch (c.type) {
        case 'place': return `A stunning photorealistic travel photograph of ${c.title}, ${c.subtitle}, a famous heritage monument in India.`
        case 'artifact': return `A photorealistic, detailed photograph of ${c.title}, ${c.subtitle}, a famous Indian monument, as the central subject.`
        case 'concept': return `A photorealistic, evocative photograph representing ${c.title}, ${c.subtitle}, an Indian heritage site.`
        default: return `A photorealistic photograph of ${c.title}, ${c.subtitle}, a famous monument in India.`
      }
    },
  },
}

const recipe = RECIPES[recipeKey]
if (!recipe) throw new Error(`No art recipe for "${recipeKey}"`)

const prompts = deck.cards.map((c) => ({
  id: c.id,
  prompt: `${recipe.lead(c)} ${c.description} ${recipe.style}`,
}))

mkdirSync(join(root, '.art'), { recursive: true })
writeFileSync(join(root, `.art/${category}.prompts.json`), JSON.stringify(prompts, null, 2))
console.log(`Wrote ${prompts.length} prompts to .art/${category}.prompts.json`)
console.log('Sample:', JSON.stringify(prompts[28], null, 2))
