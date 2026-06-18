import { useCallback, useState } from 'react'
import Landing from './components/Landing'
import Deck from './components/Deck'
import Paywall from './components/Paywall'
import { useProgress } from './hooks/useProgress'
import { usePremium } from './lib/premium'

export default function App() {
  const [category, setCategory] = useState(null)
  const progress = useProgress()
  const { premium, justUpgraded, clearUpgraded, upgrade, restore } = usePremium()
  const [paywall, setPaywall] = useState(null) // null | reason string

  const requestUpgrade = useCallback(
    (reason) => setPaywall(reason || 'Unlock every difficulty and a fresh draw of questions every time.'),
    [],
  )

  return (
    <div className="app">
      <div className="bg-stars" aria-hidden="true" />
      {category ? (
        <Deck
          category={category}
          progress={progress}
          premium={premium}
          onUpgrade={requestUpgrade}
          onBack={() => setCategory(null)}
        />
      ) : (
        <Landing onEnter={setCategory} premium={premium} onUpgrade={requestUpgrade} />
      )}

      {paywall && (
        <Paywall
          reason={paywall}
          onUpgrade={upgrade}
          onRestore={restore}
          onClose={() => setPaywall(null)}
        />
      )}

      {justUpgraded && (
        <div className="toast" role="status" onAnimationEnd={clearUpgraded}>
          👑 Premium unlocked — every difficulty is yours.
        </div>
      )}
    </div>
  )
}
