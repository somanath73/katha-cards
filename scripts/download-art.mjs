// Downloads each generated card image and downscales it to a web-weight WebP.
// Input:  .art/manifest.json  = [{ id, url }]
// Output: public/data/mahabharat/art/<id>.webp
// Run after `npm i sharp --no-save`:  node scripts/download-art.mjs
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'mahabharat'
const manifest = JSON.parse(readFileSync(join(root, `.art/${category}.manifest.json`), 'utf8'))
const outDir = join(root, `public/data/${category}/art`)
mkdirSync(outDir, { recursive: true })

const WIDTH = 600 // cards display ~190px; 600 is crisp on retina, ~50-90KB as webp

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function one({ id, url }) {
  if (!url) return { id, ok: false, reason: 'no url' }
  const out = join(outDir, `${id}.webp`)
  if (existsSync(out)) return { id, ok: true, kb: 0, skipped: true } // incremental reruns
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const info = await sharp(buf)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out)
      return { id, ok: true, kb: Math.round(info.size / 1024) }
    } catch (e) {
      if (attempt === 4) return { id, ok: false, reason: e.message }
      await sleep(attempt * 1500) // backoff
    }
  }
}

// Limited concurrency so we don't open 100 sockets at once.
async function run() {
  const queue = [...manifest]
  const done = []
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const item = queue.shift()
      done.push(await one(item))
    }
  })
  await Promise.all(workers)
  const ok = done.filter((d) => d.ok)
  const bad = done.filter((d) => !d.ok)
  const totalKb = ok.reduce((s, d) => s + d.kb, 0)
  console.log(`Saved ${ok.length}/${done.length} images, ~${totalKb} KB total (avg ${Math.round(totalKb / Math.max(ok.length, 1))} KB)`)
  if (bad.length) console.log('Failed:', JSON.stringify(bad, null, 2))
}

run()
