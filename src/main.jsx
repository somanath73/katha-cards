import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App'
import { configureIAP } from './lib/iap'
import './styles/global.css'
import './styles/dashboard.css'

// Native-only setup (no-ops on the web build). Plugins are dynamically imported
// so the web bundle never pulls in native code.
async function nativeBoot() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark }) // light text on our dark UI
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#08081a' })
    }
  } catch {
    /* status bar plugin not present */
  }
  try {
    await configureIAP()
  } catch {
    /* IAP not configured yet */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    /* splash plugin not present */
  }
}
nativeBoot()

// Offline PWA: register the service worker on the web build only — never in the
// Capacitor native shell, and not in dev (avoids stale-cache surprises while
// iterating). BASE_URL is '/katha-cards/' on the Pages build, '/' otherwise.
if (
  !Capacitor.isNativePlatform() &&
  import.meta.env.PROD &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* offline support is best-effort */
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
