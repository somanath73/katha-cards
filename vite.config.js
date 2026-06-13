import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages serves the app from /katha-cards/, dev serves from /
  base: mode === 'production' ? '/katha-cards/' : '/',
  server: { port: 5180 },
}))
