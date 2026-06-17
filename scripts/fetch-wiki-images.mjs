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
const category = process.argv[2] || 'indian-politics'
const outDir = join(root, `public/data/${category}/art`)
mkdirSync(outDir, { recursive: true })
mkdirSync(join(root, '.art'), { recursive: true })

// cardId -> exact Wikipedia article title (disambiguated where needed), per deck.
// Only people/places with genuinely free images get real photos; the license filter
// below rejects anything non-free, which then falls back to generated illustration.
const MAPS = {
  'indian-politics': {
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
  'supreme-court': 'Supreme Court of India',
    'reserve-bank-of-india': 'Reserve Bank of India',
    // note: 'national-emblem' deliberately omitted — the State Emblem of India is
    // legally restricted (Prohibition of Improper Use Act); it stays an illustration.
  },
  'indian-cinema': {
    // Real people — deceased classic-era figures (often PD/CC) and living stars
    // (CC event photos). Films/concepts/events have no free imagery and stay art.
    'dadasaheb-phalke': 'Dadasaheb Phalke',
    'devika-rani': 'Devika Rani',
    'k-l-saigal': 'K. L. Saigal',
    'v-shantaram': 'V. Shantaram',
    'mehboob-khan': 'Mehboob Khan',
    'nargis': 'Nargis',
    'dilip-kumar': 'Dilip Kumar',
    'madhubala': 'Madhubala',
    'guru-dutt': 'Guru Dutt',
    'raj-kapoor': 'Raj Kapoor',
    'bimal-roy': 'Bimal Roy',
    'meena-kumari': 'Meena Kumari',
    'waheeda-rehman': 'Waheeda Rehman',
    'satyajit-ray': 'Satyajit Ray',
    'ritwik-ghatak': 'Ritwik Ghatak',
    'mrinal-sen': 'Mrinal Sen',
    'uttam-kumar': 'Uttam Kumar',
    'suchitra-sen': 'Suchitra Sen',
    'm-g-ramachandran': 'M. G. Ramachandran',
    'sivaji-ganesan': 'Sivaji Ganesan',
    'kamal-haasan': 'Kamal Haasan',
    'rajinikanth': 'Rajinikanth',
    'mani-ratnam': 'Mani Ratnam',
    'ilaiyaraaja': 'Ilaiyaraaja',
    'n-t-rama-rao': 'N. T. Rama Rao',
    'savitri': 'Savitri (actress)',
    'k-viswanath': 'K. Viswanath',
    'chiranjeevi': 'Chiranjeevi',
    's-s-rajamouli': 'S. S. Rajamouli',
    'adoor-gopalakrishnan': 'Adoor Gopalakrishnan',
    'mammootty': 'Mammootty',
    'mohanlal': 'Mohanlal',
    'dr-rajkumar': 'Rajkumar (actor)',
    'girish-karnad': 'Girish Karnad',
    'shyam-benegal': 'Shyam Benegal',
    'smita-patil': 'Smita Patil',
    'shabana-azmi': 'Shabana Azmi',
    'naseeruddin-shah': 'Naseeruddin Shah',
    'lata-mangeshkar': 'Lata Mangeshkar',
    'asha-bhosle': 'Asha Bhosle',
    'mohammed-rafi': 'Mohammed Rafi',
    'kishore-kumar': 'Kishore Kumar',
    's-p-balasubrahmanyam': 'S. P. Balasubrahmanyam',
    'naushad': 'Naushad',
    's-d-burman': 'S. D. Burman',
    'r-d-burman': 'R. D. Burman',
    'a-r-rahman': 'A. R. Rahman',
    'amitabh-bachchan': 'Amitabh Bachchan',
    'yash-chopra': 'Yash Chopra',
    'sridevi': 'Sridevi',
    'madhuri-dixit': 'Madhuri Dixit',
    'shah-rukh-khan': 'Shah Rukh Khan',
    'aamir-khan': 'Aamir Khan',
    'anurag-kashyap': 'Anurag Kashyap',
    // Places with free photos
    'ramoji-film-city': 'Ramoji Film City',
    'ftii-pune': 'Film and Television Institute of India',
  },
}
const MAP = MAPS[category] || {}

// Override the auto-picked infobox image for cards where the infobox photo isn't
// clearly free (or is the wrong subject), but a specific known freely-licensed file
// exists. Pinning the file keeps real people/places on real photos instead of art.
const FILE_OVERRIDES = {
  'indian-politics': {
    'jawaharlal-nehru': 'File:Jawaharlal Nehru 1949.jpg',
    // Infobox photo is GFDL-1.2 (not in our accepted set); use a GODL-India PMO portrait.
    'deve-gowda': 'File:The former Prime Minister, Shri H.D. Deve Gowda calling on the Prime Minister, Shri Narendra Modi, in New Delhi on June 03, 2015 (cropped).jpg',
    // Auto-picker grabs the restricted court emblem; pin a CC BY-SA building photo instead.
    'supreme-court': 'File:Supreme Court of India front view 02.jpg',
    // 'sukumar-sen' has no free photograph; the only free file is the 2020 India Post
    // stamp, whose crop lands on the Election Commission logo (not his face), so he
    // stays an illustration.
  },
  'indian-cinema': {
    // filled in after a first pass reveals which infobox photos are non-free / wrong subject
  },
}
const FILE_OVERRIDE = FILE_OVERRIDES[category] || {}

// Accept only genuinely free licenses.
const FREE = /(public domain|^pd|cc0|cc[ -]by([ -]sa)?|creative commons attribution|godl)/i
const NONFREE = /(non[- ]free|fair use|all rights reserved|copyright)/i

const strip = (s) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const UA = 'KathaCards/1.0 (educational trivia app; contact via github.com/somanath73/katha-cards)'

// Retry on 429 / 5xx with long exponential backoff (rides out IP throttles).
async function fetchRetry(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (r.ok) return r
    if (r.status === 429 || r.status >= 500) {
      await sleep(8000 * Math.pow(2, attempt)) // 8s,16s,32s,64s,128s,256s
      continue
    }
    throw new Error(`HTTP ${r.status}`)
  }
  throw new Error('HTTP 429 (exhausted retries)')
}

// Use the action API pageimages = the canonical infobox photo (usually well-licensed).
async function summaryImage(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=900&titles=${encodeURIComponent(title)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  return page?.original?.source || page?.thumbnail?.source || null
}

// Resolve a specific Commons File: title directly to its url + license.
async function commonsFileInfo(fileTitle) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=${encodeURIComponent(fileTitle)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  const ii = page?.imageinfo?.[0]
  if (!ii) return null
  const m = ii.extmetadata || {}
  return {
    imgUrl: ii.url,
    license: strip(m.LicenseShortName?.value) || strip(m.License?.value) || strip(m.UsageTerms?.value),
    artist: strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown',
    licenseUrl: strip(m.LicenseUrl?.value),
    file: fileTitle.replace(/^File:/, ''),
  }
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
    let imgUrl, license, artist, licenseUrl, file
    if (FILE_OVERRIDE[id]) {
      const info = await commonsFileInfo(FILE_OVERRIDE[id])
      if (!info || !info.imgUrl) return { id, ok: false, reason: 'override: no info' }
      ;({ imgUrl, license, artist, licenseUrl, file } = info)
    } else {
      imgUrl = await summaryImage(title)
      if (!imgUrl) return { id, ok: false, reason: 'no image' }
      ;({ license, artist, licenseUrl, file } = await commonsLicense(imgUrl))
    }
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
  await sleep(5000) // slow pace to avoid Wikimedia rate limits
}

const attribution = [...done.values()]
writeFileSync(attrPath, JSON.stringify(attribution, null, 2))

console.log(`Real images sourced (total): ${attribution.length}/${Object.keys(MAP).length}`)
console.log('License mix:', JSON.stringify(attribution.reduce((a, r) => ((a[r.license] = (a[r.license] || 0) + 1), a), {}), null, 0))
console.log('Still need illustration:', JSON.stringify(failed.map((f) => `${f.id} (${f.reason})`), null, 2))
