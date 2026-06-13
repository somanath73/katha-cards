import { useRef } from 'react'
import Emblem from './Emblem'
import { paletteFor } from '../data/palettes'
import { toRoman } from '../lib/random'

// The ornate back shared by the deck, the quiz flip and the landing hero.
export function CardBack({ className = '', style }) {
  return (
    <div className={`card-back ${className}`} style={style}>
      <div className="card-back-ring" />
      <div className="card-back-core">
        <Emblem name="chakra" />
      </div>
    </div>
  )
}

export default function TarotCard({ card, best = 0, onClick }) {
  const ref = useRef(null)
  const pal = paletteFor(card.palette)

  const move = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  const leave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <button
      ref={ref}
      className="tcard"
      style={{ '--c1': pal.c1, '--c2': pal.c2, '--accent': pal.accent, '--glow': pal.glow }}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
    >
      <div className="tcard-tilt">
        <div className="tcard-border" />
        <div className="tcard-face">
          <div className="tcard-top">
            <span className="tcard-numeral">{toRoman(card.order)}</span>
            <span className="tcard-type">{card.type}</span>
          </div>
          <div className="tcard-emblem">
            <div className="tcard-halo" />
            <Emblem name={card.emblem} />
          </div>
          <div className="tcard-name">{card.title}</div>
          <div className="tcard-sub">{card.subtitle}</div>
          <div className="tcard-stars">
            {best > 0 ? (
              <>
                {'★'.repeat(best)}
                <span className="dim">{'★'.repeat(3 - best)}</span>
              </>
            ) : (
              <span className="dim">unplayed</span>
            )}
          </div>
        </div>
        <div className="tcard-sheen" />
      </div>
    </button>
  )
}
