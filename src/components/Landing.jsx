import { useState } from 'react'
import Emblem from './Emblem'
import { CardBack } from './TarotCard'
import { CATEGORIES } from '../data/categories'
import { paletteFor } from '../data/palettes'

export default function Landing({ onEnter }) {
  const [shaking, setShaking] = useState(null)

  const pick = (cat) => {
    if (cat.live) return onEnter(cat)
    setShaking(cat.id)
    setTimeout(() => setShaking(null), 500)
  }

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-cards" aria-hidden="true">
          <CardBack className="float f1" />
          <CardBack className="float f2" />
          <CardBack className="float f3" />
        </div>
        <p className="hero-kicker">A deck of legends · A test of memory</p>
        <h1 className="hero-title">
          Katha <span>Cards</span>
        </h1>
        <p className="hero-sub">
          Flip a card. Face three questions. Master the epics of India — one legend at a time.
        </p>
        <button
          className="btn-gold"
          onClick={() => document.getElementById('cats')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Choose your deck ↓
        </button>
      </section>

      <section className="cats" id="cats">
        {CATEGORIES.map((cat) => {
          const pal = paletteFor(cat.palette)
          return (
            <button
              key={cat.id}
              className={`cat ${cat.live ? '' : 'locked'} ${shaking === cat.id ? 'shake' : ''}`}
              style={{ '--c1': pal.c1, '--c2': pal.c2, '--accent': pal.accent, '--glow': pal.glow }}
              onClick={() => pick(cat)}
            >
              <div className="cat-emblem">
                <Emblem name={cat.emblem} />
              </div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-tag">{cat.tagline}</div>
              <div className="cat-cta">{cat.live ? '100 cards · Play now →' : '🔒 Coming soon'}</div>
            </button>
          )
        })}
      </section>

      <footer className="foot">Made with 🪔 — the Mahabharat deck is live · five more decks on the way</footer>
    </div>
  )
}
