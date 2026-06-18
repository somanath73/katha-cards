import { useState } from 'react'
import { BILLING, PREMIUM_PERKS } from '../lib/premium'

// The upgrade modal. `reason` lets callers tailor the headline (e.g. a locked
// difficulty). `onUpgrade`/`onRestore` come from usePremium().
export default function Paywall({ reason, onUpgrade, onRestore, onClose }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const go = async () => {
    setBusy(true)
    setNote('')
    try {
      const r = await onUpgrade()
      if (r?.redirected) return // leaving for Stripe
      if (r?.unlocked) {
        setNote('Premium unlocked on this device. Enjoy!')
        setTimeout(onClose, 1100)
      }
    } catch {
      setNote('Could not start checkout — please try again.')
    } finally {
      setBusy(false)
    }
  }

  const restore = async () => {
    setBusy(true)
    setNote('')
    const ok = await onRestore()
    setBusy(false)
    if (ok) {
      setNote('Welcome back — premium restored!')
      setTimeout(onClose, 1100)
    } else {
      setNote('No active subscription found for this device.')
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box paywall">
        <button className="modal-x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="paywall-crown">👑</div>
        <h3 className="paywall-title">Go Premium</h3>
        <p className="paywall-reason">
          {reason || 'Unlock the full Katha Cards experience.'}
        </p>

        <div className="paywall-price">
          <span className="paywall-amount">{BILLING.price}</span>
          <span className="paywall-per">/ {BILLING.period}</span>
        </div>

        <ul className="paywall-perks">
          {PREMIUM_PERKS.map((p) => (
            <li key={p}>
              <span className="tick">✦</span>
              {p}
            </li>
          ))}
        </ul>

        <button className="btn-gold pulse paywall-cta" onClick={go} disabled={busy}>
          {busy ? 'One moment…' : `Go Premium · ${BILLING.price}/${BILLING.period} →`}
        </button>

        {note && <p className="paywall-note">{note}</p>}

        <div className="paywall-foot">
          <button className="linklike" onClick={restore} disabled={busy}>
            Restore purchase
          </button>
          <span className="paywall-fine">Cancel anytime · secure checkout via Stripe</span>
        </div>
      </div>
    </div>
  )
}
