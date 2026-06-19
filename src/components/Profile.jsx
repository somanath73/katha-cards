import { useState } from 'react'

// Account / profile dropdown opened from the top-right avatar.
//  accounts mode → real magic-link sign-in (signIn) + sign-out.
//  static mode   → "sign in" restores Premium by the checkout email (restore).
// The display name is a lightweight local profile (localStorage), no backend needed.
export default function Profile({ name, onName, premium, mode, user, overall, onUpgrade, onSignIn, onSignOut, onRestore, onClose }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const accounts = mode === 'accounts'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote('')
    try {
      if (accounts) {
        const r = await onSignIn(email)
        setNote(r?.ok ? 'Check your email for a sign-in link.' : 'Could not send the link — try again.')
      } else {
        const ok = await onRestore(email)
        setNote(ok ? 'Welcome back — Premium restored!' : 'No subscription found for that email.')
      }
    } catch {
      setNote('Something went wrong — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-menu" role="dialog" aria-label="Your profile">
      <div className="profile-head">
        <span className="profile-ava">{name ? name.trim()[0].toUpperCase() : '🪔'}</span>
        <div className="profile-id">
          <input
            className="profile-name"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            aria-label="Display name"
          />
          <span className="profile-status">{premium ? '👑 Premium member' : 'Free plan'}</span>
        </div>
      </div>

      <div className="profile-stats">
        <div><b>{overall.decksPlayed}</b><span>Decks</span></div>
        <div><b>{overall.quizzes}</b><span>Quizzes</span></div>
        <div><b>{overall.quizzes ? `${overall.accuracy}%` : '—'}</b><span>Accuracy</span></div>
        <div><b>{overall.streak}</b><span>Streak</span></div>
      </div>

      {!premium && (
        <button className="btn-gold profile-prem" onClick={() => { onClose(); onUpgrade() }}>♛ Go Premium</button>
      )}

      <div className="profile-acct">
        {accounts && user ? (
          <>
            <span className="profile-fine">Signed in as <b>{user.email}</b></span>
            <button className="btn-ghost" onClick={onSignOut}>Sign out</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <span className="profile-fine">{accounts ? 'Sign in with your email' : 'Sign in to restore your Premium'}</span>
            <div className="profile-row">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
              />
              <button className="btn-gold" type="submit" disabled={busy}>{busy ? '…' : accounts ? 'Send link' : 'Sign in'}</button>
            </div>
            {note && <span className="profile-note">{note}</span>}
          </form>
        )}
      </div>
    </div>
  )
}
