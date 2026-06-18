# Katha Cards

A tarot-style trivia app for Indian epics and history. Flip a card, face 3 random
questions drawn from that card's question bank, earn stars, master the deck.

## Run it

```bash
npm install
npm run dev      # opens on http://localhost:5180
```

## How content is organized

Everything is data-driven — no code changes needed to add content.

```
public/data/<categoryId>/
  cards.json                 # deck metadata + 100 cards (art spec per card)
  questions/<cardId>.json    # question bank for one card
src/data/categories.js       # category registry (set live: true to publish)
```

### cards.json

```json
{
  "category": "mahabharat",
  "name": "Mahabharat",
  "questionsPerCard": 30,
  "cards": [
    {
      "id": "arjuna",
      "order": 2,
      "title": "Arjuna",
      "subtitle": "The Peerless Archer",
      "type": "character",        // character | event | place | artifact | concept
      "emblem": "bow",            // one of 30 glyph keys in src/components/Emblem.jsx
      "palette": "royal",         // royal | flame | forest | ocean | dusk | dawn
      "description": "..."
    }
  ]
}
```

Card artwork is generated, not stored: each card renders as an SVG tarot frame
(emblem glyph + palette + roman numeral), so the whole deck weighs a few KB and
stays visually consistent. To use real illustrations later, add an `image` field
per card and render it in `src/components/TarotCard.jsx`.

### questions/<cardId>.json

```json
{
  "cardId": "arjuna",
  "questions": [
    {
      "id": "arjuna-q01",
      "difficulty": "easy",       // easy | medium | hard
      "q": "…?",
      "options": ["A", "B", "C", "D"],
      "answer": 2,                // index of correct option
      "explanation": "one sentence"
    }
  ]
}
```

The app draws 3 random questions per flip, preferring ones the player hasn't
seen (tracked in localStorage). Banks can grow to 100+ questions per card with
no code changes — just append to the array.

## Adding a category

1. Add an entry in `src/data/categories.js` with `live: true`.
2. Create `public/data/<id>/cards.json` and `public/data/<id>/questions/*.json`.

## Player progress

Stored in localStorage under `katha-progress-v1`: per-card plays, best score
(0–3 stars), and seen question ids. Clear site data to reset.

## Free vs Premium

Every question already carries a `difficulty` of `easy` / `medium` / `hard`.

- **Free** — only the **easy** questions, and the *same* fixed set each time.
- **Premium** ($0.99/year) — a difficulty picker (all / easy / medium / hard)
  and a fresh, randomised, unseen-preferring draw across the full bank.

Gating lives in `drawQuestions()` ([src/lib/random.js](src/lib/random.js)) and
the difficulty picker in the card reveal. Premium state is in
[src/lib/premium.js](src/lib/premium.js) (`katha-premium-v1`).

Billing is **Stripe**. Two deployment options, both optional (the app works
statically until you wire one up):

- **Accounts mode (recommended)** — [`supabase/`](supabase/): magic-link sign-in,
  server-verified entitlement, **content-protected** medium/hard questions (RLS),
  cross-device progress sync, and a daily free allowance. Turns on when the
  `VITE_SUPABASE_*` env vars are set (see [.env.example](.env.example) +
  [supabase/README](supabase/README.md)).
- **No-accounts mode** — [`worker/`](worker/): a small Cloudflare Worker for
  Checkout + webhook + device/email entitlement (no login). Set `BILLING.apiBase`.

Until either is configured, the Upgrade button unlocks locally for testing.

## Mobile / install (PWA)

Responsive for phones and installable to the home screen on iOS (Safari → Share
→ Add to Home Screen) and Android (Chrome → Install). Driven by
[`public/manifest.webmanifest`](public/manifest.webmanifest), the generated
chakra app icons, and the apple-mobile-web-app meta tags in `index.html`.
