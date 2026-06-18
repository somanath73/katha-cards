# Katha Cards — Native apps (App Store + Google Play)

The web app is wrapped with **Capacitor 8**. The same React/Vite codebase ships
three ways with no separate fork:

| Build | Command | Base path | Payments |
| --- | --- | --- | --- |
| Web (GitHub Pages) | `npm run build` | `/katha-cards/` | Stripe (web) |
| iOS / Android | `npm run cap:sync` | `/` | **RevenueCat → App Store / Play** |
| Dev | `npm run dev` | `/` | local test unlock |

Apple and Google **require** digital goods to use their in‑app purchase systems,
so the native builds sell Premium through **RevenueCat** (StoreKit / Play
Billing) instead of Stripe. The switch is automatic at runtime
(`Capacitor.isNativePlatform()` in `src/lib/iap.js` + `src/lib/premium.js`).

---

## What's already done (code side)

- `capacitor.config.json` — appId `com.kathacards.app`, dark splash.
- `ios/` and `android/` native projects generated, with all plugins linked
  (App, StatusBar, SplashScreen, RevenueCat).
- App icons + light/dark splash generated into both projects from
  `public/icon-512.png` (regenerate with `npm run cap:assets`).
- Native IAP flow (`src/lib/iap.js`) wired into `usePremium`; paywall shows a
  native **Restore purchases** button + auto‑renew disclosure + Terms/Privacy.
- `public/privacy.html` and `public/terms.html` (review before publishing).

Until a RevenueCat key is set, native **Upgrade** unlocks locally for testing
(same as the web test mode).

---

## 0. Prerequisites

- **Apple Developer Program** ($99/yr) — you have this. ✅
- **Google Play Developer** ($25 one‑time) — create at play.google.com/console.
- **iOS builds need macOS + Xcode.** You're on Windows, so use either:
  - a Mac (or rented cloud Mac), or
  - **[Codemagic](https://codemagic.io)** / Ionic Appflow CI — builds & signs
    iOS from this repo with no local Mac. Recommended for you.
- **Android builds** work on Windows: install **Android Studio** (gives the SDK
  + JDK), then `npm run cap:android`.

---

## 1. Confirm the bundle ID *before* creating store records

Default is `com.kathacards.app`. To change it, do it now (it's permanent once an
app record exists):

1. Edit `appId` in `capacitor.config.json`.
2. `rm -rf ios android` then `npx cap add ios && npx cap add android && npm run cap:sync`.

---

## 2. Daily build commands

```bash
npm run cap:sync       # build web (native mode) + copy into ios/ and android/
npm run cap:android    # sync, then open Android Studio
npm run cap:ios        # sync, then open Xcode   (Mac only)
npm run cap:assets     # regenerate icons/splash after changing assets/logo.png
```

Run `npm run cap:sync` after **every** web code change before building native.

---

## 3. Turn on real in‑app purchases (the important part)

### 3a. Create the subscription product

- **App Store Connect** → your app → Subscriptions → create an
  **auto‑renewable subscription**, e.g. product id `katha_premium_yearly`,
  price $0.99/yr. Add a localized display name + description.
- **Google Play Console** → Monetize → Subscriptions → create the matching
  subscription with the same idea.

### 3b. RevenueCat

1. Create a free [RevenueCat](https://www.revenuecat.com) account, add the app
   for both platforms.
2. Add the App Store & Play products to RevenueCat.
3. Create an **Entitlement** with identifier **`premium`** and attach the
   products to a **Current Offering**.
4. Copy the **public SDK keys** (Apple `appl_…`, Google `goog_…`).

### 3c. Paste the keys

In `src/lib/iap.js`:

```js
export const IAP = {
  iosApiKey: 'appl_xxxxxxxx',
  androidApiKey: 'goog_xxxxxxxx',
  entitlementId: 'premium', // must match the RevenueCat entitlement id
}
```

Then `npm run cap:sync` and rebuild. Native Upgrade now charges through the
store and the entitlement is verified on launch + restore. (If the entitlement
id is something other than `premium`, change it here too.)

> Tip: test purchases with a StoreKit sandbox tester (iOS) / license tester
> (Android) before submitting — real money is not charged in sandbox.

---

## 4. Store listing assets

- **iOS**: 1024×1024 marketing icon (auto‑generated, opaque ✅), screenshots for
  6.7" and 6.5" iPhones (and iPad if you enable it).
- **Android**: 512×512 icon ✅, **1024×500 feature graphic** (still to make),
  phone + tablet screenshots.
- Short + full description, keywords, category: Education / Trivia.
- Capture screenshots from your six live decks (the card flip + quiz reveal show
  well).

---

## 5. Compliance forms (block submission if missing)

- **Privacy Policy URL** — host `privacy.html`. Once pushed it's live at
  `https://somanath73.github.io/katha-cards/privacy.html`. Use that URL in both
  consoles. Terms: `…/terms.html`.
- **Apple privacy “nutrition” labels** — declare: email (optional, for
  restore/accounts), a device identifier, and purchase data. No tracking/ads.
- **Google Play Data safety** — same disclosures.
- **Age rating** — complete Apple's and Google's IARC questionnaires (this is a
  general‑audience educational trivia app).
- The paywall already shows price, auto‑renew terms, and Terms/Privacy links —
  Apple requires these on subscription screens.

## 6. Apple‑specific rules to know

- **Restore Purchases** button — present in the paywall (native mode). ✅
- **Sign in with Apple** — only required if you also offer a *social* login. The
  current email magic‑link (accounts mode, dormant) does not trigger this. If you
  enable Google/Facebook login later, you must add Sign in with Apple.
- **Account deletion in‑app** — required only if you ship accounts mode. The
  static/native build has no accounts, so this doesn't apply yet.
- **Guideline 4.2 (minimum functionality)** — a thin web wrapper gets rejected.
  This build uses native IAP, native splash/status bar, and ships offline static
  content, which satisfies it.

## 7. Test tracks before production

- **iOS** — upload a build to **TestFlight**, test the purchase + restore in
  sandbox, then submit for review (~1–3 days).
- **Android** — new personal developer accounts must run **closed testing with
  12+ testers for 14 days** before production is unlocked. Start this early.

---

## Gotchas

- Always `npm run cap:sync` after web changes — native uses a *copied* snapshot
  of `dist/`, not your live source.
- The web GitHub Pages deploy is unchanged (`npm run build` → `/katha-cards/`).
  Don't deploy a `dist/` left over from `build:native` (root paths); the CI
  rebuilds correctly, so this only matters for manual local deploys.
- iOS uses Swift Package Manager (no CocoaPods needed), so `cap add ios` works
  from Windows; you still need a Mac/CI to compile and sign.
- Commit `ios/` and `android/` to the repo so cloud CI (Codemagic) can build.
