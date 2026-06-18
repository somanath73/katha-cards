// ---------------------------------------------------------------------------
// In-app purchases for the native (iOS/Android) builds, via RevenueCat.
//
// Apple and Google REQUIRE digital goods (our Premium unlock) to be sold through
// StoreKit / Play Billing — the web Stripe flow is not allowed inside the app and
// would be rejected at review. RevenueCat wraps both stores behind one SDK and
// handles receipt validation + entitlements.
//
// This module is a no-op on the web build: every entry point checks isNative()
// first, and the RevenueCat SDK is only dynamically imported on a real device.
//
// TO ACTIVATE (see MOBILE.md):
//   1. Create the $0.99/yr auto-renewing subscription in App Store Connect and
//      Google Play Console.
//   2. Add the app in RevenueCat, attach the product to an Offering, and define
//      an Entitlement (default id below: "premium").
//   3. Paste the RevenueCat *public SDK keys* below.
// Until keys are set, native "Upgrade" unlocks locally for testing (mirrors the
// web BILLING test mode).
// ---------------------------------------------------------------------------
import { Capacitor } from '@capacitor/core'

export const IAP = {
  iosApiKey: '', // RevenueCat public SDK key for Apple, e.g. 'appl_xxx'
  androidApiKey: '', // RevenueCat public SDK key for Google, e.g. 'goog_xxx'
  entitlementId: 'premium', // the Entitlement identifier you create in RevenueCat
}

export const isNative = () => Capacitor.isNativePlatform()
const platform = () => Capacitor.getPlatform() // 'ios' | 'android' | 'web'

const apiKey = () => (platform() === 'ios' ? IAP.iosApiKey : IAP.androidApiKey)

// True only when we're on a device AND a RevenueCat key is configured.
export const iapConfigured = () => isNative() && Boolean(apiKey())

let _Purchases = null
let _configured = false

async function sdk() {
  if (!_Purchases) {
    const mod = await import('@revenuecat/purchases-capacitor')
    _Purchases = mod.Purchases
  }
  return _Purchases
}

export async function configureIAP() {
  if (!iapConfigured() || _configured) return
  const Purchases = await sdk()
  await Purchases.configure({ apiKey: apiKey() })
  _configured = true
}

const hasEntitlement = (customerInfo) =>
  Boolean(customerInfo?.entitlements?.active?.[IAP.entitlementId])

// Current entitlement from the store. Returns null when IAP isn't configured so
// the caller can fall back to the local/test value.
export async function isPremiumNative() {
  if (!iapConfigured()) return null
  await configureIAP()
  const Purchases = await sdk()
  const { customerInfo } = await Purchases.getCustomerInfo()
  return hasEntitlement(customerInfo)
}

// Buy Premium through the App Store / Play. Throws on real errors; the caller
// distinguishes a user cancel via the thrown error's userCancelled flag.
export async function purchasePremiumNative() {
  await configureIAP()
  const Purchases = await sdk()
  const { offerings } = await Purchases.getOfferings()
  const pkg = offerings?.current?.availablePackages?.[0]
  if (!pkg) throw new Error('No RevenueCat offering/package available')
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
  return hasEntitlement(customerInfo)
}

// Restore a previous purchase from the signed-in App Store / Play account.
export async function restorePremiumNative() {
  await configureIAP()
  const Purchases = await sdk()
  const { customerInfo } = await Purchases.restorePurchases()
  return hasEntitlement(customerInfo)
}
