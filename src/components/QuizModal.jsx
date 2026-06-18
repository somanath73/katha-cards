import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import Emblem from './Emblem'
import { CardBack } from './TarotCard'
import { paletteFor } from '../data/palettes'
import { drawQuestions, toRoman } from '../lib/random'
import { withV } from '../lib/imgver'

const DIFF_TABS = ['all', 'easy', 'medium', 'hard']

export default function QuizModal({ card, categoryId, progress, premium, onUpgrade, onClose }) {
  const pal = paletteFor(card.palette)
  const imgSrc = card.image ? withV(`${import.meta.env.BASE_URL}data/${categoryId}/${card.image}`) : null
  const [bank, setBank] = useState(null)
  const [missing, setMissing] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [stage, setStage] = useState('reveal') // reveal | quiz | result
  const [qs, setQs] = useState([])
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState(premium ? 'all' : 'easy')
  const retryRef = useRef(null)

  useEffect(() => {
    let dead = false
    const load = () =>
      fetch(`${import.meta.env.BASE_URL}data/${categoryId}/questions/${card.id}.json`)
        .then((r) => {
          if (!r.ok) throw new Error('not ready')
          return r.json()
        })
        .then((d) => {
          if (dead) return
          setBank(d.questions)
          setMissing(false)
        })
        .catch(() => {
          if (dead) return
          setMissing(true)
          retryRef.current = setTimeout(load, 4000)
        })
    load()
    const t = setTimeout(() => setFlipped(true), 350)
    return () => {
      dead = true
      clearTimeout(retryRef.current)
      clearTimeout(t)
    }
  }, [card.id, categoryId])

  const begin = () => {
    const diff = premium ? difficulty : 'easy'
    setQs(drawQuestions(bank, 3, progress.seenFor(card.id), { difficulty: diff, premium }))
    setStage('quiz')
    setQi(0)
    setScore(0)
    setPicked(null)
  }

  const pickDifficulty = (d) => {
    if (!premium && d !== 'easy') {
      onUpgrade(`"${d.charAt(0).toUpperCase() + d.slice(1)}" questions are a Premium feature.`)
      return
    }
    setDifficulty(d)
  }

  const choose = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === qs[qi].answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (qi < qs.length - 1) {
      setQi(qi + 1)
      setPicked(null)
    } else {
      progress.record(card.id, score, qs.map((q) => q.id))
      setStage('result')
      if (score === 3) {
        confetti({
          particleCount: 170,
          spread: 80,
          origin: { y: 0.6 },
          colors: [pal.accent, '#ffffff', '#e9c46a'],
        })
      }
    }
  }

  const q = qs[qi]

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-box"
        style={{ '--c1': pal.c1, '--c2': pal.c2, '--accent': pal.accent, '--glow': pal.glow }}
      >
        <button className="modal-x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {stage === 'reveal' && (
          <div className="reveal">
            <div className={`flip ${flipped ? 'flipped' : ''}`}>
              <div className="flip-inner">
                <div className="flip-back">
                  <CardBack />
                </div>
                <div className="flip-front">
                  <div className={`reveal-card ${imgSrc ? 'has-art' : ''}`}>
                    {imgSrc && <img className="reveal-art" src={imgSrc} alt={card.title} />}
                    {imgSrc && <div className="reveal-shade" />}
                    <span className="tcard-numeral">{toRoman(card.order)}</span>
                    {!imgSrc && (
                      <div className="reveal-emblem">
                        <Emblem name={card.emblem} />
                      </div>
                    )}
                    <div className="reveal-card-foot">
                      <h3>{card.title}</h3>
                      <p className="reveal-sub">{card.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="reveal-desc">{card.description}</p>
            {bank ? (
              <>
                <div className="diff-pick" role="group" aria-label="Question difficulty">
                  {DIFF_TABS.map((d) => {
                    const locked = !premium && d !== 'easy'
                    const on = (premium ? difficulty : 'easy') === d
                    return (
                      <button
                        key={d}
                        className={`diff-tab ${d !== 'all' ? `diff-${d}` : ''} ${on ? 'on' : ''} ${
                          locked ? 'locked' : ''
                        }`}
                        onClick={() => pickDifficulty(d)}
                        aria-pressed={on}
                      >
                        {locked && <span className="diff-lock">🔒</span>}
                        {d === 'all' ? 'All' : d}
                      </button>
                    )
                  })}
                </div>
                <button className="btn-gold pulse" onClick={begin}>
                  Draw 3 {premium ? (difficulty === 'all' ? '' : `${difficulty} `) : 'easy '}questions
                </button>
                {!premium && (
                  <button className="reveal-upsell linklike" onClick={() => onUpgrade()}>
                    Free plan · easy questions only. <b>Go Premium</b> for medium, hard &amp; fresh draws →
                  </button>
                )}
              </>
            ) : (
              <p className="inscribe">
                {missing
                  ? "The scribes are still inscribing this card's questions — it will unlock automatically…"
                  : 'Opening the scrolls…'}
              </p>
            )}
          </div>
        )}

        {stage === 'quiz' && q && (
          <div className="quiz" key={q.id}>
            <div className="quiz-top">
              <span className="quiz-card-name">{card.title}</span>
              <div className="quiz-dots">
                {qs.map((_, i) => (
                  <span key={i} className={`qdot ${i < qi ? 'done' : i === qi ? 'now' : ''}`} />
                ))}
              </div>
              <span className={`diff diff-${q.difficulty}`}>{q.difficulty}</span>
            </div>
            <h3 className="quiz-q">{q.q}</h3>
            <div className="opts">
              {q.options.map((opt, i) => {
                let cls = 'opt'
                if (picked !== null) {
                  if (i === q.answer) cls += ' correct'
                  else if (i === picked) cls += ' wrong'
                  else cls += ' faded'
                }
                return (
                  <button key={i} className={cls} onClick={() => choose(i)}>
                    <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <div className="after">
                <p className="explain">
                  <b>{picked === q.answer ? '✦ Right!' : '✦ Not quite.'}</b> {q.explanation}
                </p>
                <button className="btn-gold" onClick={next}>
                  {qi < qs.length - 1 ? 'Next →' : 'See result'}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'result' && (
          <div className="result">
            <div className="result-stars">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`rstar ${i < score ? 'lit' : ''}`}
                  style={{ animationDelay: `${i * 0.18}s` }}
                >
                  ★
                </span>
              ))}
            </div>
            <h3>
              {score === 3
                ? 'Legendary!'
                : score === 2
                  ? 'Well played!'
                  : score === 1
                    ? 'The epic is long…'
                    : 'The dice betrayed you.'}
            </h3>
            <p>
              You answered {score} of 3 on <b>{card.title}</b>.
            </p>
            <div className="result-actions">
              <button className="btn-gold" onClick={begin}>
                {premium ? 'Draw 3 new questions' : 'Replay easy questions'}
              </button>
              <button className="btn-ghost" onClick={onClose}>
                Back to the deck
              </button>
            </div>
            {!premium && (
              <button className="reveal-upsell linklike" onClick={() => onUpgrade()}>
                <b>Go Premium</b> to unlock medium, hard &amp; a fresh draw every time →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
