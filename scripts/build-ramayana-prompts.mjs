// Builds .art/ramayana.prompts.json = [{id, prompt}] for the Ramayana deck in the
// luminous devotional-fantasy style (approved Rama/Hanuman reference look), with a
// DIFFERENT dominant colour palette per card. Also writes the ~50 priority ids.
// Run: node scripts/build-ramayana-prompts.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const deck = JSON.parse(readFileSync(join(root, 'public/data/ramayana/cards.json'), 'utf8'))

const STYLE =
  'Luminous devotional-fantasy digital painting, richly ornate with intricate gold filigree, jewelled ' +
  'ornaments and crowns, a glowing circular mandala halo of light, a sacred radiant divine aura, sparkling ' +
  'magical particles and floating embers, an enchanted celestial setting, vibrant saturated jewel tones, soft ' +
  'cinematic god-rays, exquisitely detailed, ethereal and majestic. No text, no lettering, no captions, no ' +
  'watermark, no signature. Vertical portrait orientation.'

const lead = (c) => {
  switch (c.type) {
    case 'character': return `A luminous devotional-fantasy portrait of ${c.title}, ${c.subtitle} — a single divine figure filling the frame, face large and prominent.`
    case 'event': return `A luminous, dramatic devotional-fantasy scene depicting ${c.title} (${c.subtitle}).`
    case 'place': return `A luminous devotional-fantasy establishing vista of ${c.title}, ${c.subtitle}, no central figure.`
    case 'artifact': return `A luminous devotional-fantasy depiction of ${c.title}, ${c.subtitle}, the sacred object glowing as the radiant centrepiece.`
    case 'concept': return `A symbolic, allegorical devotional-fantasy composition representing ${c.title}, ${c.subtitle}.`
    default: return `${c.title}, ${c.subtitle}.`
  }
}

// Distinct jewel-tone palettes rotated for variety so no two images repeat.
const POOL = [
  'sapphire blue, saffron-gold and emerald-teal',
  'rose-pink, warm gold and soft cream',
  'emerald green, gold and warm amber',
  'crimson red, magenta and radiant gold',
  'royal violet, indigo and silver-gold',
  'turquoise, peacock-blue and gold',
  'ruby red, deep maroon and gold',
  'marigold orange, saffron and bronze',
  'royal purple, gold and ivory',
  'deep forest green, earthy brown and gold',
  'sunset orange, coral and gold',
  'midnight blue, starlit silver and gold',
  'jade green, teal and copper',
  'pearl white, pale gold and sky blue',
  'vermillion scarlet, deep red and gold',
  'lotus pink, lavender and gold',
  'amber, honey-gold and deep red',
  'aqua blue, mint green and gold',
]

// Curated palettes for the iconic / thematically-fixed cards.
const CURATED = {
  rama: 'sapphire blue, saffron-gold and emerald-teal',
  sita: 'rose-pink, warm gold and soft cream',
  lakshmana: 'emerald green, gold and warm amber',
  hanuman: 'crimson red, magenta, radiant gold and emerald green',
  bharata: 'marigold orange, saffron and bronze',
  shatrughna: 'amber, honey-gold and deep red',
  ravana: 'ember red, charcoal-black and molten gold',
  kumbhakarna: 'smouldering ember red, bronze and dark gold',
  indrajit: 'midnight blue, ember red and gold',
  'the-ten-heads': 'ember red, charcoal-black and molten gold',
  vibhishana: 'royal purple, gold and ivory',
  mandodari: 'deep wine-red, gold and pearl',
  shurpanakha: 'dark crimson, charcoal and smoky gold',
  tataka: 'ashen grey, ember red and dark bronze',
  maricha: 'golden amber, tawny fawn and emerald',
  khara: 'dark scarlet, iron-grey and gold',
  prahasta: 'iron-grey, dark crimson and bronze',
  dasharatha: 'aged bronze, sepia and royal gold',
  kaushalya: 'soft lotus pink, ivory and gold',
  kaikeyi: 'deep magenta, dusky violet and gold',
  sumitra: 'pale rose, mint and gold',
  janaka: 'serene white, pale blue and gold',
  vishvamitra: 'fiery saffron, bronze and ember',
  vasishtha: 'warm bronze, sandalwood cream and gold',
  agastya: 'earthy ochre, deep green and gold',
  parashurama: 'blood-red, dark bronze and gold',
  sugriva: 'tawny gold, forest green and amber',
  vali: 'burnished copper, deep green and gold',
  tara: 'jade green, lotus pink and gold',
  angada: 'bronze-gold, moss green and amber',
  jambavan: 'deep umber brown, charcoal and gold',
  hanuman_alt: 'crimson and gold',
  jatayu: 'dusky brown, amber and bronze-gold',
  sampati: 'rust-orange, ash-grey and gold',
  garuda: 'turquoise, white and brilliant gold',
  sita_fire: 'fiery orange, scarlet and gold',
  vanaras: 'forest green, tawny brown and gold',
}

// Build a per-card palette: curated where set, else a rotating pool entry that
// avoids repeating the previous card's colour.
let k = 0
const paletteFor = (c, prevPalette) => {
  if (CURATED[c.id]) return CURATED[c.id]
  let p = POOL[k % POOL.length]
  if (p === prevPalette) { k++; p = POOL[k % POOL.length] }
  k++
  return p
}

let prev = ''
const prompts = deck.cards.map((c) => {
  const palette = paletteFor(c, prev)
  prev = palette
  return { id: c.id, type: c.type, prompt: `${lead(c)} ${c.description} Dominant colour palette of ${palette}. ${STYLE}` }
})

mkdirSync(join(root, '.art'), { recursive: true })
writeFileSync(join(root, '.art/ramayana.prompts.json'), JSON.stringify(prompts, null, 2))

// ~50 priority cards for this session: all 46 characters + 4 iconic scenes.
const priorityEvents = ['the-golden-deer', 'slaying-of-ravana', 'agni-pariksha', 'return-to-ayodhya']
const priority = deck.cards
  .filter((c) => c.type === 'character' || priorityEvents.includes(c.id))
  .map((c) => c.id)
writeFileSync(join(root, '.art/ramayana.priority.json'), JSON.stringify(priority, null, 2))

console.log(`Wrote ${prompts.length} prompts; priority set = ${priority.length} cards`)
console.log('Sample (rama):', prompts.find((p) => p.id === 'rama').prompt.slice(0, 160), '…')
