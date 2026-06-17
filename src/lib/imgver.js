// Cache-busting version for card art. Bump this whenever card image *content*
// changes at an existing path (filenames stay the same, so browsers/CDNs would
// otherwise serve stale copies). Appended as ?v=<IMG_V> to every card image URL.
export const IMG_V = 4

export const withV = (url) => (url ? `${url}?v=${IMG_V}` : url)
