import { useState } from 'react'
import { BILLING, PREMIUM_PERKS } from '../lib/premium'

// The upgrade modal. `reason` tailors the headline (e.g. a locked difficulty).
// `onUpgrade`/`onRestore` come from usePremium(); onRestore(email) verifies an
// existing subscription so Premium follows the person across devices.
export default function Paywall({ reason, onUpgrade, onRestore, onClose }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [email, setEmail] = useState('')

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

  const submitRestore = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote('')
    try {
      const ok = await onRestore(email)
      if (ok) {
        setNote('Welcome back — Premium restored!')
        setTimeout(onClose, 1100)
      } else {
        setNote('No active subscription found for that email.')
      }
    } catch {
      setNote('Could not restore — please try again.')
    } finally {
      setBusy(false)
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
        <p className="paywall-reason">{reason || 'Unlock the full Katha Cards experience.'}</p>

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
          {restoring ? (
            <form className="restore-form" onSubmit={submitRestore}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Email used at checkout"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
                autoFocus
              />
              <button type="submit" className="btn-ghost" disabled={busy}>
                {busy ? '…' : 'Restore'}
              </button>
            </form>
          ) : (
            <button className="linklike" onClick={() => setRestoring(true)} disabled={busy}>
              Already subscribed? Restore by email
            </button>
          )}
          <span className="paywall-fine">Cancel anytime · secure checkout via Stripe</span>
        </div>
      </div>
    </div>
  )
}
