// Sources REAL, freely-licensed lead images from Wikimedia for a curated set of
// Indian Politics cards (people / buildings / national symbols). Only accepts
// public-domain / CC / GODL-India licenses; records attribution; downscales to webp.
// Cards not listed here, or whose image isn't clearly free, are left for illustration.
// Run after `npm i sharp --no-save`:  node scripts/fetch-wiki-images.mjs
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = 'indian-politics'
const outDir = join(root, `public/data/${category}/art`)
mkdirSync(outDir, { recursive: true })
mkdirSync(join(root, '.art'), { recursive: true })

// cardId -> exact Wikipedia article title (disambiguated where needed)
const MAP = {
  'br-ambedkar': 'B. R. Ambedkar',
  'jawaharlal-nehru': 'Jawaharlal Nehru',
  'lal-bahadur-shastri': 'Lal Bahadur Shastri',
  'indira-gandhi': 'Indira Gandhi',
  'morarji-desai': 'Morarji Desai',
  'charan-singh': 'Charan Singh',
  'rajiv-gandhi': 'Rajiv Gandhi',
  'vp-singh': 'V. P. Singh',
  'chandra-shekhar': 'Chandra Shekhar',
  'pv-narasimha-rao': 'P. V. Narasimha Rao',
  'deve-gowda': 'H. D. Deve Gowda',
  'ik-gujral': 'I. K. Gujral',
  'atal-bihari-vajpayee': 'Atal Bihari Vajpayee',
  'manmohan-singh': 'Manmohan Singh',
  'narendra-modi': 'Narendra Modi',
  'rajendra-prasad': 'Rajendra Prasad',
  's-radhakrishnan': 'Sarvepalli Radhakrishnan',
  'zakir-husain': 'Zakir Husain (politician)',
  'vv-giri': 'V. V. Giri',
  'fakhruddin-ali-ahmed': 'Fakhruddin Ali Ahmed',
  'neelam-sanjiva-reddy': 'Neelam Sanjiva Reddy',
  'giani-zail-singh': 'Zail Singh',
  'r-venkataraman': 'R. Venkataraman',
  'kr-narayanan': 'K. R. Narayanan',
  'apj-abdul-kalam': 'A. P. J. Abdul Kalam',
  'pratibha-patil': 'Pratibha Patil',
  'pranab-mukherjee': 'Pranab Mukherjee',
  'droupadi-murmu': 'Droupadi Murmu',
  'sardar-patel': 'Vallabhbhai Patel',
  'maulana-azad': 'Abul Kalam Azad',
  'gv-mavalankar': 'G. V. Mavalankar',
  'sukumar-sen': 'Sukumar Sen (civil servant)',
  'tn-seshan': 'T. N. Seshan',
  'jayaprakash-narayan': 'Jayaprakash Narayan',
  'ram-manohar-lohia': 'Ram Manohar Lohia',
  'jagjivan-ram': 'Jagjivan Ram',
  'vk-krishna-menon': 'V. K. Krishna Menon',
  'cd-deshmukh': 'Chintaman Dwarkanath Deshmukh',
  'kanshi-ram': 'Kanshi Ram',
  'bn-rau': 'Benegal Narsing Rau',
  'sucheta-kripalani': 'Sucheta Kripalani',
  'parliament-house': 'Parliament House (India)',
  'rashtrapati-bhavan': 'Rashtrapati Bhavan',
  'national-emblem': 'State Emblem of India',
  'supreme-court': 'Supreme Court of India',
  'reserve-bank-of-india': 'Reserve Bank of India',
}

// Accept only genuinely free licenses.
const FREE = /(public domain|^pd|cc0|cc[ -]by([ -]sa)?|creative commons attribution|godl)/i
const NONFREE = /(non[- ]free|fair use|all rights reserved|copyright)/i

const strip = (s) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const UA = 'KathaCards/1.0 (educational trivia app; contact via github.com/somanath73/katha-cards)'

// Retry on 429 / 5xx with exponential backoff.
async function fetchRetry(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (r.ok) return r
    if (r.status === 429 || r.status >= 500) {
      await sleep(3000 * Math.pow(2, attempt)) // 3s, 6s, 12s, 24s, 48s
      continue
    }
    throw new Error(`HTTP ${r.status}`)
  }
  throw new Error('HTTP 429 (exhausted retries)')
}

async function summaryImage(title) {
  const enc = encodeURIComponent(title.replace(/ /g, '_'))
  const r = await fetchRetry(`https://en.wikipedia.org/api/rest_v1/page/summary/${enc}`)
  const j = await r.json()
  return j.originalimage?.source || j.thumbnail?.source || null
}

async function commonsLicense(imgUrl) {
  const file = 'File:' + decodeURIComponent(imgUrl.split('/').pop())
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent(file)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  const m = page?.imageinfo?.[0]?.extmetadata || {}
  const license = strip(m.LicenseShortName?.value) || strip(m.License?.value) || strip(m.UsageTerms?.value)
  const artist = strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown'
  const licenseUrl = strip(m.LicenseUrl?.value)
  return { license, artist, licenseUrl, file }
}

async function one(id, title) {
  try {
    const imgUrl = await summaryImage(title)
    if (!imgUrl) return { id, ok: false, reason: 'no image' }
    const { license, artist, licenseUrl, file } = await commonsLicense(imgUrl)
    const free = FREE.test(license) && !NONFREE.test(license)
    if (!license) return { id, ok: false, reason: 'license unknown' }
    if (!free) return { id, ok: false, reason: `non-free: ${license}` }
    const res = await fetchRetry(imgUrl)
    const buf = Buffer.from(await res.arrayBuffer())
    const out = join(outDir, `${id}.webp`)
    await sharp(buf, { failOn: 'none' })
      .resize({ width: 600, height: 900, fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toFile(out)
    return { id, ok: true, license, artist, licenseUrl, source: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`, file: file.replace(/^File:/, '') }
  } catch (e) {
    return { id, ok: false, reason: e.message }
  }
}

// Incremental: keep prior successes (by attribution entry), only fetch the rest.
const attrPath = join(root, `.art/${category}.attribution.json`)
const done = new Map()
if (existsSync(attrPath)) for (const e of JSON.parse(readFileSync(attrPath, 'utf8'))) done.set(e.id, e)

const todo = Object.entries(MAP).filter(([id]) => !done.has(id) || !existsSync(join(outDir, `${id}.webp`)))
console.log(`Already have ${done.size}; fetching ${todo.length} remaining...`)

const failed = []
for (const [id, title] of todo) {
  const r = await one(id, title)
  if (r.ok) done.set(id, { id: r.id, artist: r.artist, license: r.license, licenseUrl: r.licenseUrl, source: r.source, file: r.file })
  else failed.push(r)
  await sleep(3500) // slow pace to avoid Wikimedia rate limits
}

const attribution = [...done.values()]
writeFileSync(attrPath, JSON.stringify(attribution, null, 2))

console.log(`Real images sourced (total): ${attribution.length}/${Object.keys(MAP).length}`)
console.log('License mix:', JSON.stringify(attribution.reduce((a, r) => ((a[r.license] = (a[r.license] || 0) + 1), a), {}), null, 0))
console.log('Still need illustration:', JSON.stringify(failed.map((f) => `${f.id} (${f.reason})`), null, 2))
