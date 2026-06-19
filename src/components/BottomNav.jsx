import { sfx } from '../lib/sound'

// Mobile-only bottom tab bar (the app-style nav from the design mockup).
// Tabs: Home · Decks · Daily Challenge (coming soon) · Premium. No leaderboard,
// no live counts. Hidden on desktop, where the top nav links are used instead.
const ICONS = {
  home: 'M3 10.8 12 3.8l9 7M5.6 9.3V20h12.8V9.3',
  decks: 'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z',
  daily: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM9 13l-2 7 5-3 5 3-2-7',
  premium: 'M12 3.6l2.5 5.7 6.2.5-4.7 4 1.4 6L12 16.6 6.6 20l1.4-6-4.7-4 6.2-.5z',
}

function Tab({ id, label, on, soon, onClick }) {
  return (
    <button
      type="button"
      className={`bnav-tab ${on ? 'on' : ''} ${soon ? 'soon' : ''}`}
      aria-current={on ? 'page' : undefined}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICONS[id]} />
      </svg>
      <span>{label}</span>
      {soon && <i className="bnav-soon">soon</i>}
    </button>
  )
}

export default function BottomNav({ active, premium, onHome, onDecks, onPremium }) {
  return (
    <nav className="bnav" aria-label="Primary">
      <Tab id="home" label="Home" on={active === 'home'} onClick={() => { sfx('nav'); onHome() }} />
      <Tab id="decks" label="Decks" on={active === 'decks'} onClick={() => { sfx('nav'); onDecks() }} />
      <Tab id="daily" label="Daily Challenge" soon onClick={() => sfx('locked')} />
      <Tab
        id="premium"
        label="Premium"
        on={premium}
        onClick={() => {
          if (premium) sfx('tap')
          else { sfx('open'); onPremium() }
        }}
      />
    </nav>
  )
}
