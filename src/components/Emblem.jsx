// Hand-drawn line-art glyph library. Every card's artwork is built from one of
// these symbols + a palette, so the deck stays visually cohesive at any size.
const rays = (cx, cy, r1, r2, n, offsetDeg = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = (((360 / n) * i + offsetDeg) * Math.PI) / 180
    return (
      <line
        key={i}
        x1={(cx + r1 * Math.cos(a)).toFixed(1)}
        y1={(cy + r1 * Math.sin(a)).toFixed(1)}
        x2={(cx + r2 * Math.cos(a)).toFixed(1)}
        y2={(cy + r2 * Math.sin(a)).toFixed(1)}
      />
    )
  })

const dot = (cx, cy, r = 2.5) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />

const GLYPHS = {
  chakra: (
    <g>
      <circle cx="50" cy="50" r="30" />
      <circle cx="50" cy="50" r="9" />
      {rays(50, 50, 12, 27, 8)}
      {rays(50, 50, 33, 39, 16, 11.25)}
    </g>
  ),
  bow: (
    <g>
      <path d="M32 14 Q86 50 32 86" />
      <line x1="32" y1="14" x2="32" y2="86" />
      <line x1="20" y1="50" x2="74" y2="50" />
      <path d="M74 50 L62 43 M74 50 L62 57" />
    </g>
  ),
  arrow: (
    <g>
      <line x1="24" y1="76" x2="76" y2="24" />
      <path d="M76 24 L58 28 M76 24 L72 42" />
      <path d="M36 64 L24 60 M36 64 L40 76" />
      <path d="M30 70 L18 66 M30 70 L34 82" />
    </g>
  ),
  conch: (
    <g>
      <path d="M30 78 C18 64 22 42 40 32 C56 23 74 30 76 46 C78 60 66 70 54 66 C44 63 42 50 52 46 C58 44 64 48 62 54" />
      <path d="M30 78 L22 88" />
      <path d="M30 78 C38 82 50 82 58 76" />
    </g>
  ),
  mace: (
    <g>
      <circle cx="50" cy="32" r="17" />
      {rays(50, 32, 17, 22, 8, 22.5)}
      <line x1="50" y1="49" x2="50" y2="80" />
      <line x1="41" y1="80" x2="59" y2="80" />
      <line x1="44" y1="88" x2="56" y2="88" />
    </g>
  ),
  sword: (
    <g>
      <path d="M50 12 L56 22 L56 58 L50 66 L44 58 L44 22 Z" />
      <line x1="34" y1="66" x2="66" y2="66" />
      <line x1="50" y1="66" x2="50" y2="82" />
      <circle cx="50" cy="87" r="4" />
    </g>
  ),
  trident: (
    <g>
      <line x1="50" y1="88" x2="50" y2="14" />
      <path d="M50 40 C36 38 30 28 32 14" />
      <path d="M50 40 C64 38 70 28 68 14" />
      <line x1="38" y1="44" x2="62" y2="44" />
    </g>
  ),
  spear: (
    <g>
      <line x1="50" y1="88" x2="50" y2="36" />
      <path d="M50 10 L60 28 L50 36 L40 28 Z" />
      <line x1="42" y1="46" x2="58" y2="46" />
    </g>
  ),
  shield: (
    <g>
      <path d="M50 12 C62 18 72 20 82 22 C82 48 70 76 50 88 C30 76 18 48 18 22 C28 20 38 18 50 12 Z" />
      <circle cx="50" cy="46" r="10" />
      {dot(50, 46, 3)}
    </g>
  ),
  chariot: (
    <g>
      <path d="M30 56 L74 56 L70 36 L40 36 Z" />
      <circle cx="46" cy="70" r="12" />
      {rays(46, 70, 0, 10, 4, 45)}
      <line x1="74" y1="56" x2="86" y2="62" />
      <line x1="64" y1="36" x2="64" y2="16" />
      <path d="M64 16 L80 21 L64 27" />
    </g>
  ),
  crown: (
    <g>
      <path d="M22 66 L22 40 L36 52 L50 28 L64 52 L78 40 L78 66 Z" />
      <line x1="22" y1="74" x2="78" y2="74" />
      {dot(50, 22, 3.5)}
      {dot(22, 34, 3)}
      {dot(78, 34, 3)}
    </g>
  ),
  throne: (
    <g>
      <path d="M32 62 L32 22 Q50 10 68 22 L68 62" />
      <line x1="24" y1="62" x2="76" y2="62" />
      <line x1="30" y1="62" x2="30" y2="84" />
      <line x1="70" y1="62" x2="70" y2="84" />
      <line x1="38" y1="50" x2="62" y2="50" />
      <circle cx="50" cy="30" r="4" />
    </g>
  ),
  palace: (
    <g>
      <path d="M34 44 Q50 20 66 44" />
      <line x1="50" y1="22" x2="50" y2="12" />
      {dot(50, 10, 2.5)}
      <line x1="34" y1="44" x2="34" y2="76" />
      <line x1="66" y1="44" x2="66" y2="76" />
      <line x1="22" y1="76" x2="78" y2="76" />
      <line x1="22" y1="54" x2="22" y2="76" />
      <line x1="78" y1="54" x2="78" y2="76" />
      <path d="M18 54 Q22 46 26 54 M74 54 Q78 46 82 54" />
      <path d="M44 76 Q50 62 56 76" />
    </g>
  ),
  dice: (
    <g>
      <rect x="28" y="28" width="44" height="44" rx="9" />
      {dot(40, 40, 3.5)}
      {dot(60, 40, 3.5)}
      {dot(50, 50, 3.5)}
      {dot(40, 60, 3.5)}
      {dot(60, 60, 3.5)}
    </g>
  ),
  scroll: (
    <g>
      <path d="M30 22 C22 22 22 34 30 34 L70 34 L70 78 C78 78 78 66 70 66" />
      <path d="M30 22 L70 22 C78 22 78 34 70 34" />
      <path d="M30 34 L30 78 L70 78" />
      <line x1="40" y1="46" x2="60" y2="46" />
      <line x1="40" y1="56" x2="60" y2="56" />
      <line x1="40" y1="66" x2="56" y2="66" />
    </g>
  ),
  flute: (
    <g>
      <line x1="20" y1="74" x2="80" y2="26" />
      <line x1="24" y1="80" x2="84" y2="32" />
      <line x1="20" y1="74" x2="24" y2="80" />
      <line x1="80" y1="26" x2="84" y2="32" />
      {dot(44, 60, 2.2)}
      {dot(52, 54, 2.2)}
      {dot(60, 48, 2.2)}
      {dot(68, 42, 2.2)}
    </g>
  ),
  lotus: (
    <g>
      <path d="M50 26 C58 38 58 52 50 60 C42 52 42 38 50 26 Z" />
      <path d="M50 60 C58 54 62 44 60 32 C70 40 70 54 58 62" />
      <path d="M50 60 C42 54 38 44 40 32 C30 40 30 54 42 62" />
      <path d="M58 62 C70 58 76 50 78 42 C82 56 72 66 58 68" />
      <path d="M42 62 C30 58 24 50 22 42 C18 56 28 66 42 68" />
      <path d="M26 72 Q50 82 74 72" />
    </g>
  ),
  tree: (
    <g>
      <line x1="50" y1="84" x2="50" y2="52" />
      <path d="M30 54 C18 50 18 36 30 32 C30 20 46 16 52 24 C62 14 78 22 74 34 C84 38 82 52 70 54 Z" />
      <line x1="36" y1="54" x2="36" y2="68" />
      <line x1="64" y1="54" x2="64" y2="68" />
      <path d="M38 84 Q50 78 62 84" />
    </g>
  ),
  fire: (
    <g>
      <path d="M50 12 C58 26 68 32 68 50 C68 66 60 78 50 80 C40 78 32 66 32 50 C32 40 38 32 42 24 C44 32 50 34 50 26 Z" />
      <path d="M50 44 C55 52 57 58 53 66 C51 71 45 70 44 64 C43 57 46 50 50 44 Z" />
    </g>
  ),
  river: (
    <g>
      <path d="M16 34 C27 26 38 26 50 34 C62 42 73 42 84 34" />
      <path d="M16 52 C27 44 38 44 50 52 C62 60 73 60 84 52" />
      <path d="M16 70 C27 62 38 62 50 70 C62 78 73 78 84 70" />
    </g>
  ),
  mountain: (
    <g>
      <path d="M16 76 L42 30 L56 54 L68 36 L84 76 Z" />
      <path d="M36 41 L42 30 L48 41" />
      <line x1="14" y1="76" x2="86" y2="76" />
    </g>
  ),
  sun: (
    <g>
      <circle cx="50" cy="50" r="17" />
      {rays(50, 50, 23, 32, 12)}
    </g>
  ),
  moon: (
    <g>
      <path d="M63 16 A36 36 0 1 0 63 84 A28 28 0 1 1 63 16 Z" />
      {dot(70, 36, 2.5)}
      {dot(76, 56, 2)}
    </g>
  ),
  star: (
    <g>
      <path d="M50 14 L57 42 L86 50 L57 58 L50 86 L43 58 L14 50 L43 42 Z" />
      {dot(76, 24, 2.5)}
      {dot(22, 72, 2.5)}
    </g>
  ),
  serpent: (
    <g>
      <path d="M50 18 C68 18 78 32 72 46 C68 56 58 58 52 52" />
      <path d="M50 18 C32 18 22 32 28 46 C32 56 42 58 48 52" />
      <circle cx="50" cy="40" r="7" />
      <path d="M50 52 C50 64 38 62 38 72 C38 82 52 82 54 74" />
      {dot(47, 38, 1.8)}
      {dot(53, 38, 1.8)}
    </g>
  ),
  garuda: (
    <g>
      <path d="M50 62 C36 50 24 48 12 26 C28 34 40 32 50 42 C60 32 72 34 88 26 C76 48 64 50 50 62 Z" />
      <circle cx="50" cy="31" r="6" />
      <line x1="50" y1="25" x2="50" y2="17" />
      <path d="M44 66 L50 84 L56 66" />
    </g>
  ),
  elephant: (
    <g>
      <path d="M30 40 Q50 18 70 40" />
      <path d="M30 40 Q16 42 20 56 Q24 66 33 61" />
      <path d="M70 40 Q84 42 80 56 Q76 66 67 61" />
      <path d="M50 44 C50 54 52 60 46 68 C42 74 46 80 52 79" />
      {dot(41, 44, 2.2)}
      {dot(59, 44, 2.2)}
      <path d="M42 56 L38 64 M58 56 L62 64" />
    </g>
  ),
  horse: (
    <g>
      <path d="M34 82 C34 62 36 50 48 42 C52 39 54 30 58 22 C60 28 66 30 72 32 C68 38 66 42 66 48 C66 60 58 64 52 70 C48 74 46 78 46 82" />
      <path d="M48 42 C42 36 40 28 42 20 C46 26 52 26 56 24" />
      {dot(60, 32, 1.8)}
      <line x1="30" y1="82" x2="60" y2="82" />
    </g>
  ),
  eye: (
    <g>
      <path d="M14 50 Q50 22 86 50 Q50 78 14 50 Z" />
      <circle cx="50" cy="50" r="11" />
      {dot(50, 50, 4)}
      <path d="M50 16 L50 8 M28 24 L23 17 M72 24 L77 17" />
    </g>
  ),
  vessel: (
    <g>
      <path d="M38 42 C22 50 22 68 38 76 C45 79 55 79 62 76 C78 68 78 50 62 42" />
      <line x1="36" y1="42" x2="64" y2="42" />
      <line x1="40" y1="34" x2="60" y2="34" />
      <line x1="38" y1="42" x2="40" y2="34" />
      <line x1="62" y1="42" x2="60" y2="34" />
      <path d="M44 34 C40 24 46 20 50 26 C54 20 60 24 56 34" />
      <circle cx="50" cy="27" r="3" />
    </g>
  ),
}

export default function Emblem({ name, ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {GLYPHS[name] || GLYPHS.star}
    </svg>
  )
}
