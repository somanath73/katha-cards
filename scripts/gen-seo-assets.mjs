// Generates SEO/social assets into public/:
//   og-image.png   1200x630  — Open Graph / Twitter share card (on-brand poster)
//   favicon.ico               — multi-size (16/32/48) ICO with PNG entries
//   favicon-32.png / -16.png  — modern PNG favicons
// Source brand mark: public/icon-512.png. Run: node scripts/gen-seo-assets.mjs
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

// ---- OG image -------------------------------------------------------------
const W = 1200
const H = 630

// a sun/chakra emblem: concentric rings + radiating spokes
const cx = 600
const cy = 150
const spokes = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2
  const r1 = 30
  const r2 = i % 2 === 0 ? 50 : 42
  return `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="url(#gold)" stroke-width="2.4" stroke-linecap="round"/>`
}).join('')

const stars = [
  [120, 90], [240, 160], [330, 70], [980, 110], [1080, 200], [1010, 60],
  [180, 520], [90, 300], [1110, 470], [1040, 360], [760, 540], [430, 560],
].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 2.2 : 1.4}" fill="#ffffff" fill-opacity="${i % 3 === 0 ? 0.5 : 0.32}"/>`).join('')

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow1" cx="78%" cy="-12%" r="75%">
      <stop offset="0%" stop-color="#5038a0" stop-opacity="0.50"/>
      <stop offset="68%" stop-color="#5038a0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="-12%" cy="112%" r="65%">
      <stop offset="0%" stop-color="#7830a0" stop-opacity="0.34"/>
      <stop offset="60%" stop-color="#7830a0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="topglow" cx="50%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#e9c46a" stop-opacity="0.18"/>
      <stop offset="55%" stop-color="#e9c46a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f6e27a"/>
      <stop offset="100%" stop-color="#e9c46a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#08081a"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect width="${W}" height="${H}" fill="url(#topglow)"/>
  ${stars}
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="12" fill="none" stroke="#e9c46a" stroke-opacity="0.55" stroke-width="2"/>
  <rect x="37" y="37" width="${W - 74}" height="${H - 74}" rx="9" fill="none" stroke="#e9c46a" stroke-opacity="0.16" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="6" fill="url(#gold)"/>
  ${spokes}
  <text x="600" y="372" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="106" letter-spacing="7" fill="url(#gold)" text-anchor="middle">KATHA CARDS</text>
  <text x="600" y="442" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="42" fill="#f3efe2" text-anchor="middle">Flip a card. Face the legend.</text>
  <text x="600" y="506" font-family="'Segoe UI', Arial, sans-serif" font-size="25" letter-spacing="6" fill="#b3aecb" text-anchor="middle">MASTER THE EPICS OF INDIA</text>
  <text x="600" y="556" font-family="'Segoe UI', Arial, sans-serif" font-size="22" letter-spacing="2" fill="#e9c46a" fill-opacity="0.85" text-anchor="middle">Mahabharat · Ramayana · Mythology · Kings &amp; Kingdoms · and more</text>
</svg>`

await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og-image.png'))
console.log('wrote public/og-image.png (1200x630)')

// ---- favicons -------------------------------------------------------------
const src = await readFile(join(pub, 'icon-512.png'))
const sizes = [16, 32, 48]
const pngs = {}
for (const s of sizes) {
  pngs[s] = await sharp(src).resize(s, s, { fit: 'cover' }).png().toBuffer()
}
await writeFile(join(pub, 'favicon-16.png'), pngs[16])
await writeFile(join(pub, 'favicon-32.png'), pngs[32])
console.log('wrote public/favicon-16.png, favicon-32.png')

// Assemble a real favicon.ico (ICO container holding PNG entries).
function buildIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(entries.length, 4)
  const dir = Buffer.alloc(16 * entries.length)
  let offset = 6 + dir.length
  const bodies = []
  entries.forEach((e, i) => {
    const b = i * 16
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0) // width
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1) // height
    dir.writeUInt8(0, b + 2) // palette
    dir.writeUInt8(0, b + 3) // reserved
    dir.writeUInt16LE(1, b + 4) // color planes
    dir.writeUInt16LE(32, b + 6) // bits per pixel
    dir.writeUInt32LE(e.data.length, b + 8) // size of image data
    dir.writeUInt32LE(offset, b + 12) // offset
    offset += e.data.length
    bodies.push(e.data)
  })
  return Buffer.concat([header, dir, ...bodies])
}
const ico = buildIco(sizes.map((s) => ({ size: s, data: pngs[s] })))
await writeFile(join(pub, 'favicon.ico'), ico)
console.log('wrote public/favicon.ico (16/32/48)')
