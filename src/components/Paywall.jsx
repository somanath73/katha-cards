import { useState } from 'react'
import { BILLING, PLAN_COMPARE } from '../lib/premium'

// Mode-aware upgrade modal.
//  static   → Go Premium (Stripe/local) + "Restore by email" in the footer.
//  accounts → sign in first (magic link); signing in also restores.
export default function Paywall({ reason, mode, user, onUpgrade, onRestore, onSignIn, onSignOut, onClose }) {
  const accounts = mode === 'accounts'
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [showRestore, setShowRestore] = useState(false) // static: footer email form
  const [email, setEmail] = useState('')

  const finish = (msg) => {
    setNote(msg)
    setTimeout(onClose, 1200)
  }

  const go = async () => {
    setBusy(true)
    setNote('')
    try {
      const r = await onUpgrade()
      if (r?.redirected) return // leaving for Stripe
      if (r?.unlocked) finish('Premium unlocked on this device. Enjoy!')
    } catch {
      setNote('Could not start checkout — please try again.')
    } finally {
      setBusy(false)
    }
  }

  // Sign-in (accounts) or restore (static) — both submit an email.
  const submitEmail = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote('')
    try {
      if (accounts) {
        const r = await onSignIn(email)
        setNote(r?.ok ? 'Check your email for a sign-in link.' : 'Could not send the link — please try again.')
      } else {
        const ok = await onRestore(email)
        if (ok) finish('Welcome back — Premium restored!')
        else setNote('No active subscription found for that email.')
      }
    } catch {
      setNote('Something went wrong — please try again.')
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
        {BILLING.launchNote && <p className="paywall-launch">✦ {BILLING.launchNote}</p>}

        <div className="paywall-compare" role="table" aria-label="Free versus Premium">
          <div className="pc-row pc-head" role="row">
            <span role="columnheader" />
            <span role="columnheader">Free</span>
            <span role="columnheader" className="pc-prem">Premium</span>
          </div>
          {PLAN_COMPARE.map((r) => (
            <div className="pc-row" role="row" key={r.label}>
              <span className="pc-feat" role="cell">{r.label}</span>
              <span className={`pc-cell ${r.free ? 'yes' : 'no'}`} role="cell">{r.free ? '✓' : '—'}</span>
              <span className={`pc-cell pc-prem ${r.prem ? 'yes' : 'no'}`} role="cell">{r.prem ? '✓' : '—'}</span>
            </div>
          ))}
        </div>

        {/* primary action: sign-in form (accounts, signed out) OR the upgrade button */}
        {accounts && !user ? (
          <form className="restore-form paywall-cta" onSubmit={submitEmail}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email for your magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
              autoFocus
            />
            <button type="submit" className="btn-gold" disabled={busy}>
              {busy ? '…' : 'Send link'}
            </button>
          </form>
        ) : (
          <button className="btn-gold pulse paywall-cta" onClick={go} disabled={busy}>
            {busy ? 'One moment…' : `Go Premium · ${BILLING.price}/${BILLING.period} →`}
          </button>
        )}

        <button className="btn-ghost paywall-free" onClick={onClose} disabled={busy}>
          Continue free
        </button>

        {note && <p className="paywall-note">{note}</p>}

        <div className="paywall-foot">
          {accounts ? (
            user ? (
              <button className="linklike" onClick={onSignOut} disabled={busy}>
                Signed in as {user.email} · Sign out
              </button>
            ) : (
              <span className="paywall-fine">Signing in restores an existing subscription on any device.</span>
            )
          ) : showRestore ? (
            <form className="restore-form" onSubmit={submitEmail}>
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
            <button className="linklike" onClick={() => setShowRestore(true)} disabled={busy}>
              Already subscribed? Restore by email
            </button>
          )}
          <span className="paywall-fine">Cancel anytime · secure checkout via Stripe</span>
        </div>
      </div>
    </div>
  )
}
