// Reads a workflow result .output file, dedupes the {id,url} results, and writes
// .art/manifest.json. Reports which of the 100 card ids still have no art.
// Usage: node scripts/process-art-results.mjs <path-to-output-or-json> [moreFiles...]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'mahabharat'
const ids = JSON.parse(readFileSync(join(root, `.art/${category}.prompts.json`), 'utf8')).map((p) => p.id)
const manifestPath = join(root, `.art/${category}.manifest.json`)

// Start from any existing manifest so reruns accumulate.
const byId = new Map()
if (existsSync(manifestPath)) {
  for (const r of JSON.parse(readFileSync(manifestPath, 'utf8'))) if (r.url) byId.set(r.id, r.url)
}

for (const file of process.argv.slice(3)) {
  const raw = JSON.parse(readFileSync(file, 'utf8'))
  const results = raw.result?.results || raw.results || raw // tolerate shapes
  for (const r of results) {
    if (r && r.id && r.url && ids.includes(r.id)) byId.set(r.id, r.url) // last wins
  }
}

const manifest = ids.filter((id) => byId.has(id)).map((id) => ({ id, url: byId.get(id) }))
const missing = ids.filter((id) => !byId.has(id))

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`manifest.json: ${manifest.length}/${ids.length} cards have art`)
console.log(`missing (${missing.length}): ${JSON.stringify(missing)}`)
