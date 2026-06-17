import { useEffect, useMemo, useState } from 'react'
import TarotCard from './TarotCard'
import QuizModal from './QuizModal'
import Credits from './Credits'

const TYPES = ['all', 'character', 'event', 'place', 'artifact', 'concept']

export default function Deck({ category, progress, onBack }) {
  const [deck, setDeck] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(null)
  const [credits, setCredits] = useState(null)
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    let dead = false
    fetch(`${import.meta.env.BASE_URL}data/${category.id}/credits.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!dead && Array.isArray(d) && d.length) setCredits(d)
      })
      .catch(() => {})
    return () => {
      dead = true
    }
  }, [category.id])

  useEffect(() => {
    let timer
    let dead = false
    const load = () =>
      fetch(`${import.meta.env.BASE_URL}data/${category.id}/cards.json`)
        .then((r) => {
          if (!r.ok) throw new Error('not ready')
          return r.json()
        })
        .then((d) => {
          if (!dead) setDeck(d)
        })
        .catch(() => {
          if (dead) return
          setWaiting(true)
          timer = setTimeout(load, 4000)
        })
    load()
    return () => {
      dead = true
      clearTimeout(timer)
    }
  }, [category.id])

  const cards = deck?.cards || []
  const shown = useMemo(
    () =>
      cards.filter(
        (c) =>
          (filter === 'all' || c.type === filter) &&
          (query === '' || `${c.title} ${c.subtitle}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [cards, filter, query],
  )
  const stats = progress.stats(cards.map((c) => c.id))

  return (
    <div className="deck">
      <header className="deck-head">
        <button className="btn-ghost" onClick={onBack}>
          ← Decks
        </button>
        <div className="deck-title-wrap">
          <h2 className="deck-title">{category.name}</h2>
          <div className="deck-stats">
            <span>🃏 {stats.played}/{cards.length || '—'} played</span>
            <span>👑 {stats.mastered} mastered</span>
            <span>★ {stats.stars}</span>
          </div>
        </div>
        <input
          className="search"
          placeholder="Search cards…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <div className="chips">
        {TYPES.map((t) => (
          <button key={t} className={`chip ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'All' : `${t}s`}
          </button>
        ))}
        {credits && (
          <button className="chip credits-chip" onClick={() => setShowCredits(true)} title="Photo attributions">
            ⓘ Image credits
          </button>
        )}
      </div>

      {!deck ? (
        <div className="forge">
          <div className="forge-spin" />
          <p>
            {waiting
              ? 'The deck is still being forged — it will appear here automatically…'
              : 'Shuffling the deck…'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((c) => (
            <TarotCard
              key={c.id}
              card={c}
              best={progress.bestFor(c.id)}
              imgSrc={c.image ? `${import.meta.env.BASE_URL}data/${category.id}/${c.image}` : null}
              onClick={() => setActive(c)}
            />
          ))}
          {shown.length === 0 && <p className="empty">No cards match — try another search.</p>}
        </div>
      )}

      {active && (
        <QuizModal
          key={active.id}
          card={active}
          categoryId={category.id}
          progress={progress}
          onClose={() => setActive(null)}
        />
      )}

      {showCredits && credits && <Credits credits={credits} onClose={() => setShowCredits(false)} />}
    </div>
  )
}
