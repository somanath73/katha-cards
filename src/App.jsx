import { useCallback, useEffect, useState } from 'react'
import Landing from './components/Landing'
import Deck from './components/Deck'
import Paywall from './components/Paywall'
import BottomNav from './components/BottomNav'
import QuizModal from './components/QuizModal'
import { useProgress } from './hooks/useProgress'
import { usePremium } from './lib/premium'
import { pickDailyChallenge } from './lib/daily'
import * as account from './lib/account'

export default function App() {
  const [category, setCategory] = useState(null)
  const progress = useProgress()
  const { setSync, mergeRemote } = progress
  const { mode, premium, user, justUpgraded, clearUpgraded, upgrade, restore, signIn, signOut } = usePremium()
  const [paywall, setPaywall] = useState(null) // null | reason string
  const [daily, setDaily] = useState(null) // null | { categoryId, deckName, card, key }
  const [dailyLoading, setDailyLoading] = useState(false)

  const requestUpgrade = useCallback(
    (reason) => setPaywall(reason || 'Unlock every difficulty and a fresh draw of questions every time.'),
    [],
  )

  // Daily Challenge: a deterministic random card for today, played on Hard.
  const openDaily = useCallback(async () => {
    setDailyLoading(true)
    try {
      const d = await pickDailyChallenge(import.meta.env.BASE_URL)
      if (d) setDaily(d)
    } catch {
      /* daily data not ready yet */
    } finally {
      setDailyLoading(false)
    }
  }, [])

  // Bottom-nav (mobile) destinations.
  const goHome = () => {
    setCategory(null)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
  const goDecks = () => {
    const wasDeck = !!category
    setCategory(null)
    setTimeout(
      () => document.getElementById('decks')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      wasDeck ? 160 : 0,
    )
  }

  // accounts mode: push progress to the server as it's recorded…
  useEffect(() => {
    if (mode !== 'accounts') return
    setSync((deck, cardId, entry) => account.pushProgressRow(deck, cardId, entry))
    return () => setSync(null)
  }, [mode, setSync])

  // …and pull it back on sign-in so it follows the player across devices.
  useEffect(() => {
    if (mode !== 'accounts' || !user) return
    let dead = false
    account.loadRemoteProgress().then((rows) => {
      if (!dead) mergeRemote(rows)
    })
    return () => {
      dead = true
    }
  }, [mode, user, mergeRemote])

  return (
    <div className="app">
      <div className="bg-stars" aria-hidden="true" />

      {/* Floating premium control — only on the deck view; the home nav has its own. */}
      {category && (
        <button
          type="button"
          className={`premium-corner ${premium ? 'is-premium' : ''}`}
          onClick={() => {
            if (!premium) requestUpgrade()
          }}
          aria-disabled={premium}
          title={premium ? 'Premium unlocked' : 'Unlock all difficulties & fresh questions'}
        >
          {premium ? '👑 Premium' : '✦ Go Premium'}
        </button>
      )}

      {category ? (
        <Deck
          category={category}
          progress={progress}
          premium={premium}
          onUpgrade={requestUpgrade}
          onBack={() => setCategory(null)}
        />
      ) : (
        <Landing
          onEnter={setCategory}
          premium={premium}
          onUpgrade={requestUpgrade}
          onDaily={openDaily}
          progress={progress}
          mode={mode}
          user={user}
          signIn={signIn}
          signOut={signOut}
          restore={restore}
        />
      )}

      {paywall && (
        <Paywall
          reason={paywall}
          mode={mode}
          user={user}
          onUpgrade={upgrade}
          onRestore={restore}
          onSignIn={signIn}
          onSignOut={signOut}
          onClose={() => setPaywall(null)}
        />
      )}

      {justUpgraded && (
        <div className="toast" role="status" onAnimationEnd={clearUpgraded}>
          👑 Premium unlocked — every difficulty is yours.
        </div>
      )}

      {daily && (
        <QuizModal
          key={`daily-${daily.key}-${daily.card.id}`}
          card={daily.card}
          categoryId={daily.categoryId}
          deckName={daily.deckName}
          daily
          progress={progress}
          premium={premium}
          onUpgrade={requestUpgrade}
          onClose={() => setDaily(null)}
        />
      )}

      <BottomNav
        active={category ? 'decks' : 'home'}
        premium={premium}
        dailyLoading={dailyLoading}
        onHome={goHome}
        onDecks={goDecks}
        onDaily={openDaily}
        onPremium={() => requestUpgrade()}
      />
    </div>
  )
}
