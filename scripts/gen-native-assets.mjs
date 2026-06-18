// Generate the source images @capacitor/assets needs to produce native app
// icons + splash screens for iOS/Android. Run via: node scripts/gen-native-assets.mjs
// Then: npm run cap:assets  (writes into ios/ and android/).
//
// Source is public/icon-512.png. Drop in a higher-res master (≥1024) and rerun
// for crisper store icons — the App Store marketing icon is 1024×1024, opaque.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const BG = '#08081a' // brand background (must be opaque for the iOS marketing icon)
const SRC = 'public/icon-512.png'
await mkdir('assets', { recursive: true })

// 1024 app icon, flattened onto the brand background (no alpha allowed by Apple).
await sharp(SRC).resize(1024, 1024, { kernel: 'lanczos3' }).flatten({ background: BG }).png().toFile('assets/logo.png')

// Splash: brand background with the icon centered.
const iconBuf = await sharp(SRC).resize(1024, 1024, { kernel: 'lanczos3' }).png().toBuffer()
for (const name of ['splash.png', 'splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: BG } })
    .composite([{ input: iconBuf, gravity: 'centre' }])
    .png()
    .toFile(`assets/${name}`)
}

console.log('Wrote assets/logo.png, assets/splash.png, assets/splash-dark.png')
