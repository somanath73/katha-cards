// V2 Ramayana art prompts — scene-directive, for regenerating with a stronger
// model (nano_banana / gpt_image_2). The v1 STYLE forced "a single divine figure
// filling the frame + mandala halo portrait", which made event/place/concept
// cards collapse into static deity busts (e.g. death-of-kumbhakarna had no battle,
// hanuman-and-the-mountain had no mountain). V2 leads with the ACTION/ELEMENTS and
// explicitly forbids the portrait default for non-character cards. Characters keep
// a portrait lead (those came out fine). Same per-card palette logic as v1.
// Run: node scripts/build-ramayana-prompts-v2.mjs   →  .art/ramayana.prompts-v2.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const deck = JSON.parse(readFileSync(join(root, 'public/data/ramayana/cards.json'), 'utf8'))

const STYLE =
  'Luminous devotional-fantasy digital painting in a richly ornate Indian sacred-art style, ' +
  'intricate gold filigree and jewelled ornaments, glowing divine light and radiant aura, sparkling ' +
  'particles and soft cinematic god-rays, vibrant saturated jewel tones, dramatic and epic, exquisitely ' +
  'detailed, full-bleed edge-to-edge composition. No border, no frame, no text, no lettering, no caption, ' +
  'no watermark, no signature. Vertical portrait orientation.'

const lead = (c) => {
  const t = `${c.title}${c.subtitle ? `, ${c.subtitle}` : ''}`
  switch (c.type) {
    case 'character':
      return `A majestic devotional-fantasy portrait of ${t} — a single divine figure, face large and prominent, filling the frame. ${c.description}`
    case 'event':
      return `A dramatic, dynamic devotional-fantasy scene of ${t}. ${c.description} Depict the action and the figures involved clearly in a cinematic, energetic composition — this is a narrative scene, NOT a static seated portrait or a single calm deity bust.`
    case 'place':
      return `A sweeping devotional-fantasy establishing vista of ${t}. ${c.description} A landscape or architectural scene; do NOT make it a portrait of a single central deity dominating the frame.`
    case 'artifact':
      return `A devotional-fantasy depiction of the sacred object ${t}. ${c.description} The object itself glows as the clear central focus — show the object, not a portrait of a person.`
    case 'concept':
      return `A symbolic, allegorical devotional-fantasy composition expressing ${t}. ${c.description} Use evocative symbolic imagery that illustrates the idea; it may include figures or scenes, but should not be a plain head-and-shoulders bust.`
    default:
      return `${t}. ${c.description}`
  }
}

// Per-card palette: same scheme as v1 so colours stay consistent across the deck.
const POOL = [
  'sapphire blue, saffron-gold and emerald-teal', 'rose-pink, warm gold and soft cream',
  'emerald green, gold and warm amber', 'crimson red, magenta and radiant gold',
  'royal violet, indigo and silver-gold', 'turquoise, peacock-blue and gold',
  'ruby red, deep maroon and gold', 'marigold orange, saffron and bronze',
  'royal purple, gold and ivory', 'deep forest green, earthy brown and gold',
  'sunset orange, coral and gold', 'midnight blue, starlit silver and gold',
  'jade green, teal and copper', 'pearl white, pale gold and sky blue',
  'vermillion scarlet, deep red and gold', 'lotus pink, lavender and gold',
  'amber, honey-gold and deep red', 'aqua blue, mint green and gold',
]
const CURATED = {
  rama: 'sapphire blue, saffron-gold and emerald-teal', sita: 'rose-pink, warm gold and soft cream',
  lakshmana: 'emerald green, gold and warm amber', hanuman: 'crimson red, magenta, radiant gold and emerald green',
  bharata: 'marigold orange, saffron and bronze', shatrughna: 'amber, honey-gold and deep red',
  ravana: 'ember red, charcoal-black and molten gold', kumbhakarna: 'smouldering ember red, bronze and dark gold',
  indrajit: 'midnight blue, ember red and gold', 'the-ten-heads': 'ember red, charcoal-black and molten gold',
  vibhishana: 'royal purple, gold and ivory', mandodari: 'deep wine-red, gold and pearl',
  shurpanakha: 'dark crimson, charcoal and smoky gold', tataka: 'ashen grey, ember red and dark bronze',
  maricha: 'golden amber, tawny fawn and emerald', khara: 'dark scarlet, iron-grey and gold',
  prahasta: 'iron-grey, dark crimson and bronze', dasharatha: 'aged bronze, sepia and royal gold',
  kaushalya: 'soft lotus pink, ivory and gold', kaikeyi: 'deep magenta, dusky violet and gold',
  sumitra: 'pale rose, mint and gold', janaka: 'serene white, pale blue and gold',
  vishvamitra: 'fiery saffron, bronze and ember', vasishtha: 'warm bronze, sandalwood cream and gold',
  agastya: 'earthy ochre, deep green and gold', parashurama: 'blood-red, dark bronze and gold',
  sugriva: 'tawny gold, forest green and amber', vali: 'burnished copper, deep green and gold',
  tara: 'jade green, lotus pink and gold', angada: 'bronze-gold, moss green and amber',
  jambavan: 'deep umber brown, charcoal and gold', jatayu: 'dusky brown, amber and bronze-gold',
  sampati: 'rust-orange, ash-grey and gold', garuda: 'turquoise, white and brilliant gold',
}
let k = 0
const paletteFor = (c, prev) => {
  if (CURATED[c.id]) return CURATED[c.id]
  let p = POOL[k % POOL.length]
  if (p === prev) { k++; p = POOL[k % POOL.length] }
  k++
  return p
}

let prev = ''
const prompts = deck.cards.map((c) => {
  const palette = paletteFor(c, prev)
  prev = palette
  return { id: c.id, type: c.type, prompt: `${lead(c)} Dominant colour palette of ${palette}. ${STYLE}` }
})

mkdirSync(join(root, '.art'), { recursive: true })
writeFileSync(join(root, '.art/ramayana.prompts-v2.json'), JSON.stringify(prompts, null, 2))
console.log(`Wrote ${prompts.length} v2 prompts → .art/ramayana.prompts-v2.json`)
console.log('Sample (death-of-kumbhakarna):')
console.log(prompts.find((p) => p.id === 'death-of-kumbhakarna').prompt)
