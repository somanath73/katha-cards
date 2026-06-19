import { useState } from 'react'
import { isMuted, toggleMuted } from '../lib/sound'

// Speaker on/off button. Reused in the home nav and the deck header; the
// preference is global and persisted by the sound lib.
export default function SoundToggle({ className = 'nav-icon' }) {
  const [on, setOn] = useState(!isMuted())
  return (
    <button
      type="button"
      className={className}
      aria-label={on ? 'Mute sounds' : 'Unmute sounds'}
      aria-pressed={on}
      title={on ? 'Sound on' : 'Sound off'}
      onClick={() => setOn(!toggleMuted())}
    >
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19.5 5a9 9 0 0 1 0 14" />
          </>
        ) : (
          <path d="m17 9 5 5m0-5-5 5" />
        )}
      </svg>
    </button>
  )
}
