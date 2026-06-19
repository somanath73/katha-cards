import { useMemo, useState } from 'react'
import Emblem from './Emblem'
import { CATEGORIES } from '../data/categories'
import { paletteFor } from '../data/palettes'

const base = import.meta.env.BASE_URL
const cover = (id) => `${base}covers/${id}.webp`

// Decorative per-deck metadata to match the dashboard design (category filter,
// a representative difficulty + "accuracy" badge). Purely presentational.
const META = {
  mahabharat: { group: 'Mythology', diff: 'Hard', acc: 72 },
  mythology: { group: 'Mythology', diff: 'Hard', acc: 68 },
  'kings-kingdoms': { group: 'History', diff: 'Medium', acc: 61 },
  'freedom-struggle': { group: 'History', diff: 'Medium', acc: 54 },
  'indian-politics': { group: 'Society', diff: 'Easy', acc: 48 },
  'indian-cinema': { group: 'Culture', diff: 'Easy', acc: 42 },
  ramayana: { group: 'Mythology', diff: 'Medium', acc: 0 },
  monuments: { group: 'History', diff: 'Medium', acc: 0 },
  science: { group: 'Society', diff: 'Easy', acc: 0 },
  festivals: { group: 'Culture', diff: 'Easy', acc: 0 },
}
const GROUPS = ['All', 'Mythology', 'History', 'Society', 'Culture']
const FAN_ORDER = ['kings-kingdoms', 'mahabharat', 'mythology', 'freedom-struggle', 'indian-politics', 'indian-cinema']

const I = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  chevL: 'm15 18-6-6 6-6',
  chevR: 'm9 18 6-6-6-6',
  play: 'M6 4v16l13-8z',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
}
const Ic = ({ d, fill }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

export default function Landing({ onEnter, premium, onUpgrade, progress }) {
  const [active, setActive] = useState(2) // Mythology centered, as in the design
  const [group, setGroup] = useState('All')
  const [q, setQ] = useState('')
  const [shaking, setShaking] = useState(null)

  const live = CATEGORIES.filter((c) => c.live)
  const fan = FAN_ORDER.map((id) => CATEGORIES.find((c) => c.id === id)).filter(Boolean)
  const trending = CATEGORIES.find((c) => c.id === 'mythology')

  // Real profile stats (from saved progress) drive the streak, continue bar and stat cards.
  const ov = progress?.overall || { decksPlayed: 0, quizzes: 0, accuracy: 0, streak: 0, longest: 0, lastDeck: null }
  const resume = CATEGORIES.find((c) => c.id === ov.lastDeck) || live[0]
  const resumePct = progress?.deckPct ? progress.deckPct(resume?.id) : 0

  const pick = (cat) => {
    if (!cat) return
    if (cat.live) onEnter(cat)
    else {
      setShaking(cat.id)
      setTimeout(() => setShaking(null), 500)
    }
  }

  const scrollToDecks = () => document.getElementById('decks')?.scrollIntoView({ behavior: 'smooth' })

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return CATEGORIES.filter((c) => {
      const m = META[c.id] || {}
      const okGroup = group === 'All' || m.group === group
      const okQ = !needle || `${c.name} ${c.tagline}`.toLowerCase().includes(needle)
      return okGroup && okQ
    })
  }, [group, q])

  const move = (delta) => setActive((a) => (a + delta + fan.length) % fan.length)

  return (
    <div className="home">
      {/* ---------------- top nav ---------------- */}
      <header className="nav">
        <div className="nav-brand">
          <span className="nav-mark"><Emblem name="chakra" /></span>
          <span className="nav-brand-txt">
            <span className="nav-logo">KATHA <b>CARDS</b></span>
            <span className="nav-tag">A test of memory. A tribute to legends.</span>
          </span>
        </div>
        <nav className="nav-links">
          <a className="on">Home</a>
          <a onClick={scrollToDecks}>Decks</a>
          <a title="Coming soon" className="soon">Daily Challenge</a>
          <span className="nav-streak" title="Your daily streak">🔥 {ov.streak > 0 ? `${ov.streak} Day Streak` : 'Start a Streak'}</span>
          <a className="nav-prem" onClick={() => !premium && onUpgrade()}>
            {premium ? '👑 Premium' : '♛ Premium'}
          </a>
        </nav>
        <div className="nav-right">
          <label className="nav-search">
            <Ic d={I.search} />
            <input placeholder="Search decks, topics…" value={q} onChange={(e) => setQ(e.target.value)} />
            <kbd>⌘K</kbd>
          </label>
          <button className="nav-icon" aria-label="Notifications"><Ic d={I.bell} /></button>
          <button className="nav-ava" aria-label="Account"><span>🪔</span></button>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="hero2">
        <div className="hero2-left">
          <span className="hero-badge">✦ India's Best Trivia Experience</span>
          <h1 className="hero2-title">Katha <span>Cards</span></h1>
          <p className="hero2-sub">Flip a card. Face three epic questions. Master the timeless stories that shaped India.</p>
          <div className="hero2-cta">
            <button className="btn-gold" onClick={() => pick(live[0])}><Ic d={I.bolt} fill /> Start Playing</button>
            <button className="btn-ghost big" onClick={scrollToDecks}><Ic d={I.grid} /> Explore Decks</button>
          </div>
        </div>

        <div className="hero2-right">
          <div className="streak">
            <span className="streak-fire">🔥</span>
            <div>
              <b>{ov.streak > 0 ? `${ov.streak} Day Streak` : 'Start a Streak'}</b>
              <span>{ov.streak > 0 ? 'Keep it going!' : 'Play daily to build it'}</span>
            </div>
            <div className="streak-days">
              {Array.from({ length: 7 }).map((_, i) => {
                const on = i < Math.min(ov.streak, 7)
                return <i key={i} className={on ? 'on' : ''}>{on ? '✓' : ''}</i>
              })}
            </div>
            <span className="streak-gift">🎁</span>
          </div>

          <div className="fan">
            {fan.map((c, i) => {
              const off = i - active
              const abs = Math.abs(off)
              const pal = paletteFor(c.palette)
              return (
                <button
                  key={c.id}
                  className={`fan-card ${off === 0 ? 'is-active' : ''}`}
                  style={{
                    transform: `translateX(-50%) translateX(${off * 50}%) translateY(${off === 0 ? -14 : abs * 18}px) rotate(${off * 7}deg) scale(${off === 0 ? 1.08 : 1 - abs * 0.1})`,
                    zIndex: 20 - abs,
                    '--accent': pal.accent,
                    '--glow': pal.glow,
                  }}
                  onClick={() => (off === 0 ? pick(c) : setActive(i))}
                  aria-label={c.name}
                >
                  <img src={cover(c.id)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.opacity = 0)} />
                  <span className="fan-emblem"><Emblem name={c.emblem} /></span>
                  <span className="fan-name">{c.name}</span>
                  <span className="fan-count">100 cards</span>
                </button>
              )
            })}
          </div>

          <div className="fan-ctrl">
            <button onClick={() => move(-1)} aria-label="Previous"><Ic d={I.chevL} /></button>
            <div className="dots">{fan.map((_, i) => <i key={i} className={i === active ? 'on' : ''} onClick={() => setActive(i)} />)}</div>
            <button onClick={() => move(1)} aria-label="Next"><Ic d={I.chevR} /></button>
          </div>
        </div>
      </section>

      {/* ---------------- continue + stats ---------------- */}
      <section className="cbar">
        <div className="cbar-resume">
          <span className="cbar-h">▣ Continue Playing</span>
          <div className="cbar-deck">
            <img src={cover(resume.id)} alt="" />
            <div className="cbar-info">
              <b>{resume.name}</b>
              <span>{resume.tagline}</span>
              <div className="cbar-prog"><i style={{ width: `${resumePct}%` }} /></div>
            </div>
            <button className="btn-ghost" onClick={() => pick(resume)}>{ov.lastDeck ? '↺ Resume' : '▶ Start'}</button>
          </div>
        </div>
        <div className="cbar-stats">
          <Stat icon="🗂️" label="Decks Played" value={`${ov.decksPlayed} / ${live.length}`} tint="#9b8cff" />
          <Stat icon="🏆" label="Quizzes Completed" value={String(ov.quizzes)} tint="#f6c453" />
          <Stat icon="🎯" label="Accuracy" value={ov.quizzes ? `${ov.accuracy}%` : '—'} tint="#ff6b6b" />
          <Stat icon="🔥" label="Longest Streak" value={`${ov.longest} ${ov.longest === 1 ? 'Day' : 'Days'}`} tint="#ffa24d" />
        </div>
      </section>

      {/* ---------------- decks ---------------- */}
      <section className="decks" id="decks">
        <aside className="trending">
          <h3><Ic d={I.bolt} fill /> Trending Decks</h3>
          <button className="trend-card" onClick={() => pick(trending)} style={{ '--accent': paletteFor(trending.palette).accent }}>
            <img src={cover(trending.id)} alt="" />
            <span className="trend-rank">1</span>
            <div className="trend-body">
              <b>{trending.name}</b>
              <span>{trending.tagline}</span>
              <span className="trend-cta">Play Now →</span>
            </div>
          </button>
        </aside>

        <div className="decks-main">
          <div className="decks-head">
            <h3>♛ Choose Your Deck</h3>
            <div className="chips">
              {GROUPS.map((g) => (
                <button key={g} className={`chip ${group === g ? 'on' : ''}`} onClick={() => setGroup(g)}>{g}</button>
              ))}
              <a className="view-all" onClick={scrollToDecks}>View All →</a>
            </div>
          </div>

          <div className="deckgrid">
            {visible.map((c) => {
              const pal = paletteFor(c.palette)
              const m = META[c.id] || {}
              return (
                <button
                  key={c.id}
                  className={`deckcard ${c.live ? '' : 'locked'} ${shaking === c.id ? 'shake' : ''}`}
                  style={{ '--accent': pal.accent, '--glow': pal.glow, '--c2': pal.c2 }}
                  onClick={() => pick(c)}
                >
                  <div className="deckcard-cover">
                    <img src={cover(c.id)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.opacity = 0)} />
                    <span className="deckcard-emblem"><Emblem name={c.emblem} /></span>
                    <span className="deckcard-mark">🔖</span>
                    {!c.live && <span className="deckcard-soon">🔒 Soon</span>}
                  </div>
                  <div className="deckcard-body">
                    <b className="deckcard-name">{c.name}</b>
                    <p className="deckcard-tag">{c.tagline}</p>
                    <div className="deckcard-foot">
                      <span className="deckcard-acc">{c.live ? `◔ ${m.acc}%` : '100 cards'}</span>
                      <span className="deckcard-count">100 Cards</span>
                      <span className={`deckcard-play ${c.live ? '' : 'off'}`}><Ic d={I.play} fill /></span>
                    </div>
                    <span className={`deckcard-diff diff-${(m.diff || 'easy').toLowerCase()}`}>{c.live ? m.diff : 'Coming soon'}</span>
                  </div>
                </button>
              )
            })}
            {!visible.length && <p className="empty">No decks match “{q}”.</p>}
          </div>
        </div>
      </section>

      <footer className="foot">
        {premium ? (
          <span>👑 Premium unlocked — every difficulty across all decks.</span>
        ) : (
          <span>
            Made with 🪔 · Free plan plays easy questions.{' '}
            <button className="linklike" onClick={() => onUpgrade()}>Go Premium</button>{' '}
            for every difficulty &amp; fresh questions.
          </span>
        )}
      </footer>
    </div>
  )
}

function Stat({ icon, label, value, tint }) {
  return (
    <div className="stat">
      <span className="stat-icon" style={{ color: tint, background: `${tint}22` }}>{icon}</span>
      <div>
        <span className="stat-label">{label}</span>
        <b className="stat-value">{value}</b>
      </div>
    </div>
  )
}
