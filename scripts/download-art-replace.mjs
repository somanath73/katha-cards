// Like download-art.mjs but OVERWRITES existing art (for regenerating a deck's
// images in place). Input: .art/<category>-real.manifest.json = [{ id, url }].
// Output: public/data/<category>/art/<id>.webp (replaced).
// Run: node scripts/download-art-replace.mjs <category> [manifestPath]
import { readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'kings-kingdoms'
const manifestPath = process.argv[3] || join(root, `.art/${category}-real.manifest.json`)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const outDir = join(root, `public/data/${category}/art`)
mkdirSync(outDir, { recursive: true })

const WIDTH = 600 // match the deck's existing card art width
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function one({ id, url }) {
  if (!url) return { id, ok: false, reason: 'no url' }
  const out = join(outDir, `${id}.webp`)
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const info = await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out)
      return { id, ok: true, kb: Math.round(info.size / 1024) }
    } catch (e) {
      if (attempt === 4) return { id, ok: false, reason: e.message }
      await sleep(attempt * 1500)
    }
  }
}

async function run() {
  const queue = [...manifest]
  const done = []
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) done.push(await one(queue.shift()))
  })
  await Promise.all(workers)
  const ok = done.filter((d) => d.ok)
  const bad = done.filter((d) => !d.ok)
  console.log(`Replaced ${ok.length}/${done.length} images (~${ok.reduce((s, d) => s + d.kb, 0)} KB)`)
  if (bad.length) console.log('Failed:', JSON.stringify(bad, null, 2))
}
run()
