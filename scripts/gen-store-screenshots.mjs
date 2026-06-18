// Generate App Store / Play marketing screenshots (1290x2796, iPhone 6.7").
// Real card art is cover-fit into a phone frame on a branded background, with a
// sample trivia question overlay and a party/trivia-night caption.
//
// Run: node scripts/gen-store-screenshots.mjs  ->  store-assets/screenshots/ios/*.png
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const W = 1290
const H = 2796
const OUT = 'store-assets/screenshots/ios'
await mkdir(OUT, { recursive: true })

// Phone geometry
const PW = 860
const PX = Math.round((W - PW) / 2)
const PY = 720
const PH = 1940
const BEZEL = 20
const SX = PX + BEZEL
const SY = PY + BEZEL
const SW = PW - BEZEL * 2
const SH = PH - BEZEL * 2
const SR = 64 // screen corner radius

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Segoe UI', Arial, sans-serif"
const GOLD = '#f4d58d'
const CREAM = '#f7f3e8'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const SHOTS = [
  {
    file: '01-trivia-night.png',
    deck: 'mahabharat', img: 'bhishma',
    head: ['Trivia night,', 'epic edition'],
    sub: 'Pass the phone. Test the table.',
    title: 'Bhishma', titleSub: 'The Grandsire of the Kurus',
    q: ["Bhishma's famous vow was to", 'never…'],
    answers: ['Marry or take the throne', 'Leave Hastinapur', 'Lift a weapon again'], correct: 0,
  },
  {
    file: '02-six-decks.png',
    deck: 'mythology', img: 'shiva',
    head: ['600 cards.', 'Six decks.'],
    sub: "All of India's great stories.",
    title: 'Shiva', titleSub: 'The Auspicious Destroyer',
    q: ["Shiva's cosmic dance is", 'called the…'],
    answers: ['Tandava', 'Garba', 'Kathak'], correct: 0,
  },
  {
    file: '03-flip-argue.png',
    deck: 'indian-cinema', img: 'devika-rani',
    head: ['Flip. Guess.', 'Argue. Repeat.'],
    sub: 'Three questions on every card.',
    title: 'Devika Rani', titleSub: 'First Lady of Indian Cinema',
    q: ['Devika Rani is the first', 'lady of Indian…'],
    answers: ['Cinema', 'Radio', 'Theatre'], correct: 0,
  },
  {
    file: '04-who-knows.png',
    deck: 'mythology', img: 'vishnu',
    head: ['Who really', 'knows the epics?'],
    sub: 'Settle it at your next gathering.',
    title: 'Vishnu', titleSub: 'The Preserver of the Cosmos',
    q: ['In the cosmic trinity,', 'Vishnu is the…'],
    answers: ['Preserver', 'Creator', 'Destroyer'], correct: 0,
  },
  {
    file: '05-myth-to-movies.png',
    deck: 'mahabharat', img: 'ganga',
    head: ['From myth', 'to the movies.'],
    sub: 'One very competitive evening.',
    title: 'Ganga', titleSub: 'The River Mother',
    q: ['Ganga came to earth to', 'free the…'],
    answers: ['Ancestors of Bhagiratha', 'Trapped monsoon', 'Captured sages'], correct: 0,
  },
]

// rounded-rect mask for the card screen
const maskSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" rx="${SR}" ry="${SR}" fill="#fff"/></svg>`,
)

function background(s) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0c0c26"/><stop offset="1" stop-color="#050510"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="54%" r="55%">
        <stop offset="0" stop-color="#f4d58d" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#f4d58d" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <ellipse cx="${W / 2}" cy="${PY + PH + 30}" rx="${PW * 0.62}" ry="70" fill="url(#shadow)"/>
    <text x="${W / 2}" y="300" text-anchor="middle" font-family="${SERIF}" font-size="96" font-weight="700" fill="${CREAM}">${esc(s.head[0])}</text>
    <text x="${W / 2}" y="408" text-anchor="middle" font-family="${SERIF}" font-size="96" font-weight="700" fill="${CREAM}">${esc(s.head[1])}</text>
    <text x="${W / 2}" y="500" text-anchor="middle" font-family="${SANS}" font-size="44" fill="${GOLD}">${esc(s.sub)}</text>
    <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="84" ry="84" fill="#0a0a16" stroke="#2a2a48" stroke-width="3"/>
  </svg>`)
}

function overlay(s) {
  const panelX = SX + 36
  const panelW = SW - 72
  const panelH = 540
  const panelY = SY + SH - 40 - panelH
  const chipH = 70
  const chipGap = 18
  const chipsTop = panelY + 196
  const chips = s.answers
    .map((a, i) => {
      const y = chipsTop + i * (chipH + chipGap)
      const on = i === s.correct
      const fill = on ? GOLD : '#191934'
      const stroke = on ? GOLD : '#34345a'
      const tcol = on ? '#1a1206' : '#e8e8f6'
      const mark = on ? '✓ ' : ''
      return `<rect x="${panelX + 28}" y="${y}" width="${panelW - 56}" height="${chipH}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${panelX + 56}" y="${y + 46}" font-family="${SANS}" font-size="34" font-weight="${on ? 700 : 500}" fill="${tcol}">${mark}${esc(a)}</text>`
    })
    .join('')
  const titleY = panelY - 132
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#05050f" stop-opacity="0"/>
        <stop offset="1" stop-color="#05050f" stop-opacity="0.92"/>
      </linearGradient>
    </defs>
    <rect x="${SX}" y="${titleY - 120}" width="${SW}" height="${SY + SH - (titleY - 120)}" fill="url(#scrim)"/>
    <rect x="${W / 2 - 95}" y="${SY + 26}" width="190" height="44" rx="22" fill="#000"/>
    <text x="${SX + 34}" y="${SY + 92}" font-family="${SERIF}" font-size="34" font-weight="700" fill="${GOLD}">✦ Katha Cards</text>
    <text x="${SX + 34}" y="${titleY}" font-family="${SERIF}" font-size="78" font-weight="700" fill="#fff">${esc(s.title)}</text>
    <text x="${SX + 34}" y="${titleY + 56}" font-family="${SANS}" font-size="36" font-style="italic" fill="${GOLD}">${esc(s.titleSub)}</text>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="28" fill="#0e0e22" stroke="#34345a" stroke-width="2"/>
    <text x="${panelX + 28}" y="${panelY + 58}" font-family="${SANS}" font-size="28" font-weight="700" letter-spacing="3" fill="${GOLD}">QUESTION 1 / 3</text>
    <text x="${panelX + 28}" y="${panelY + 112}" font-family="${SERIF}" font-size="42" fill="#fff">${esc(s.q[0])}</text>
    <text x="${panelX + 28}" y="${panelY + 160}" font-family="${SERIF}" font-size="42" fill="#fff">${esc(s.q[1])}</text>
    ${chips}
  </svg>`)
}

for (const s of SHOTS) {
  const card = await sharp(`public/data/${s.deck}/art/${s.img}.webp`)
    .resize(SW, SH, { fit: 'cover', position: 'centre' })
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer()

  await sharp(background(s))
    .composite([
      { input: card, left: SX, top: SY },
      { input: overlay(s), left: 0, top: 0 },
    ])
    .png()
    .toFile(`${OUT}/${s.file}`)
  console.log('wrote', `${OUT}/${s.file}`)
}
console.log('Done — 5 screenshots at 1290x2796 in', OUT)
