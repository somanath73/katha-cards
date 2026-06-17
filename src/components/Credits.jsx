// Image-attribution modal. Lists the source/author/license for cards that use
// real freely-licensed photographs (e.g. Wikimedia Commons), satisfying the
// attribution terms of CC / GODL licenses. Illustrated cards need no credit.
export default function Credits({ credits, onClose }) {
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box credits-box" style={{ '--accent': '#6fd6ff', '--glow': 'rgba(111,214,255,0.3)' }}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h3 className="credits-title">Image credits</h3>
        <p className="credits-intro">
          Card photographs are sourced from Wikimedia Commons under free licenses
          (public domain / Creative Commons / GODL-India). Other cards use original
          illustrations. Thanks to the photographers and contributors below.
        </p>
        <ul className="credits-list">
          {credits.map((c) => (
            <li key={c.id}>
              <a href={c.source} target="_blank" rel="noopener noreferrer">
                {c.id.replace(/-/g, ' ')}
              </a>
              <span className="credits-meta">
                {c.artist && c.artist !== 'Unknown' ? `${c.artist} · ` : ''}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
