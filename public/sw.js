/* Katha Cards service worker — offline PWA support.
 * Strategy:
 *   navigation/HTML  → network-first (fresh deploys win; cached shell offline)
 *   hashed assets    → cache-first  (immutable /assets/ + fonts)
 *   data + media     → stale-while-revalidate (cards, questions, art, covers)
 * Cross-origin (Google Fonts, Supabase, etc.) is left to the browser.
 * Registered on the WEB build only — never in the Capacitor native shell.
 * Bump VERSION to invalidate all caches on the next deploy.
 */
const VERSION = 'v1'
const CACHE = `katha-${VERSION}`

// Resolved relative to the SW's scope, so this works under /katha-cards/ too.
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './favicon-32.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './og-image.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Individual adds so one missing file doesn't abort the whole install.
      await Promise.allSettled(SHELL.map((url) => cache.add(url)))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

const isImmutableAsset = (url) =>
  url.pathname.includes('/assets/') || /\.(?:js|css|woff2?|ttf|otf)$/i.test(url.pathname)

const isDataOrMedia = (url) => /\.(?:webp|png|jpe?g|svg|gif|json)$/i.test(url.pathname)

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // let the browser handle cross-origin

  // App navigations: try the network, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch {
          const cache = await caches.open(CACHE)
          return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error()
        }
      })(),
    )
    return
  }

  // Immutable, content-hashed build assets & fonts: cache-first.
  if (isImmutableAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        const res = await fetch(request)
        if (res.ok) (await caches.open(CACHE)).put(request, res.clone())
        return res
      })(),
    )
    return
  }

  // Cards, questions, art, covers: stale-while-revalidate.
  if (isDataOrMedia(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE)
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone())
            return res
          })
          .catch(() => null)
        return cached || (await network) || Response.error()
      })(),
    )
  }
})
