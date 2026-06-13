export const PALETTES = {
  royal:  { c1: '#241a5e', c2: '#0e0b2a', accent: '#e9c46a', glow: 'rgba(233, 196, 106, 0.35)' },
  flame:  { c1: '#5e1a1a', c2: '#1f0b0b', accent: '#ff9f43', glow: 'rgba(255, 159, 67, 0.35)' },
  forest: { c1: '#0f4d3a', c2: '#07221b', accent: '#9be564', glow: 'rgba(155, 229, 100, 0.30)' },
  ocean:  { c1: '#103d5e', c2: '#081726', accent: '#6fd6ff', glow: 'rgba(111, 214, 255, 0.30)' },
  dusk:   { c1: '#43195e', c2: '#170824', accent: '#f48fb1', glow: 'rgba(244, 143, 177, 0.32)' },
  dawn:   { c1: '#7a4a12', c2: '#2a1604', accent: '#ffd166', glow: 'rgba(255, 209, 102, 0.35)' },
}

export const paletteFor = (key) => PALETTES[key] || PALETTES.royal
