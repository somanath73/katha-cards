// Tiny synthesized UI sound effects via the Web Audio API — no audio assets,
// works offline, deliberately subtle. Honors a persisted on/off toggle and only
// starts the audio context after a user gesture (browser autoplay policy), so
// timer-driven cues like the card auto-flip can still play once the user has
// interacted. Every sound is short and quiet; the master gain keeps it gentle.

const KEY = 'katha-sound-v1'

let muted = false
try {
  muted = localStorage.getItem(KEY) === 'off'
} catch {
  /* storage blocked — default to on */
}

let ctx = null
let master = null
let noiseBuf = null

function ensure() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    try {
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.26 // overall subtlety
      master.connect(ctx.destination)
      // short white-noise buffer reused for "whoosh" flip/nav sounds
      const len = Math.floor(ctx.sampleRate * 0.4)
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    } catch {
      ctx = null
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Unlock on the first gesture so the modal's auto-flip (a timer) can sound.
if (typeof window !== 'undefined') {
  const unlock = () => ensure()
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
}

function tone({ freq = 440, to = null, type = 'sine', t = 0, dur = 0.12, vol = 0.5, attack = 0.005 }) {
  const now = ctx.currentTime + t
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + dur)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.linearRampToValueAtTime(vol, now + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  osc.connect(g).connect(master)
  osc.start(now)
  osc.stop(now + dur + 0.03)
}

function whoosh({ t = 0, dur = 0.22, vol = 0.35, f0 = 300, f1 = 1600, q = 0.8 }) {
  const now = ctx.currentTime + t
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = q
  bp.frequency.setValueAtTime(f0, now)
  bp.frequency.exponentialRampToValueAtTime(f1, now + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.linearRampToValueAtTime(vol, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(bp).connect(g).connect(master)
  src.start(now)
  src.stop(now + dur + 0.03)
}

// Named cues. Keep them short and gentle.
const SFX = {
  flip: () => {
    whoosh({ dur: 0.26, vol: 0.42, f0: 480, f1: 2200, q: 0.7 })
    tone({ freq: 300, to: 520, type: 'triangle', dur: 0.12, vol: 0.1 })
  },
  open: () => tone({ freq: 540, to: 880, type: 'sine', dur: 0.12, vol: 0.3 }),
  nav: () => whoosh({ dur: 0.16, vol: 0.28, f0: 700, f1: 1900, q: 1 }),
  tap: () => tone({ freq: 1050, type: 'triangle', dur: 0.045, vol: 0.16 }),
  correct: () => {
    tone({ freq: 660, type: 'sine', dur: 0.12, vol: 0.3 })
    tone({ freq: 988, type: 'sine', t: 0.09, dur: 0.2, vol: 0.28 })
  },
  wrong: () => {
    tone({ freq: 220, to: 150, type: 'sawtooth', dur: 0.18, vol: 0.14 })
    tone({ freq: 200, to: 120, type: 'sine', dur: 0.22, vol: 0.16 })
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'triangle', t: i * 0.1, dur: 0.24, vol: 0.26 })),
  result: () => {
    tone({ freq: 523, type: 'sine', dur: 0.16, vol: 0.24 })
    tone({ freq: 784, type: 'sine', t: 0.1, dur: 0.22, vol: 0.2 })
  },
  locked: () => tone({ freq: 150, to: 92, type: 'sine', dur: 0.18, vol: 0.32 }),
  close: () => tone({ freq: 480, to: 300, type: 'sine', dur: 0.1, vol: 0.18 }),
}

export function sfx(name) {
  if (muted) return
  if (!ensure()) return
  try {
    ;(SFX[name] || (() => {}))()
  } catch {
    /* never let a sound break the UI */
  }
}

export function isMuted() {
  return muted
}

export function setMuted(v) {
  muted = !!v
  try {
    localStorage.setItem(KEY, muted ? 'off' : 'on')
  } catch {
    /* ignore */
  }
  if (!muted) sfx('tap') // brief confirmation when turning sound on
}

// Returns the new muted state.
export function toggleMuted() {
  setMuted(!muted)
  return muted
}
