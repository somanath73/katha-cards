import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  // Web (GitHub Pages) serves from /katha-cards/. Dev and the native (Capacitor)
  // build both serve from root, because the native shell loads the bundled web
  // assets from the app package root, not a subpath.
  //   vite build                 → /katha-cards/  (GitHub Pages)
  //   vite build --mode native   → /             (Capacitor iOS/Android)
  //   vite (dev)                 → /
  base: command === 'build' && mode !== 'native' ? '/katha-cards/' : '/',
  server: { port: 5180 },
}))
