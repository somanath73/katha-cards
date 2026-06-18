# Store assets

## Screenshots — `screenshots/ios/` (5 × 1290×2796, iPhone 6.7")

Designed marketing screenshots: real card art in a phone frame on the brand
background, with a sample trivia question and a party/trivia-night caption.

| File | Caption | Card |
| --- | --- | --- |
| 01-trivia-night | "Trivia night, epic edition" | Bhishma (Mahabharat) |
| 02-six-decks | "600 cards. Six decks." | Shiva (Mythology) |
| 03-flip-argue | "Flip. Guess. Argue. Repeat." | Devika Rani (Cinema) |
| 04-who-knows | "Who really knows the epics?" | Vishnu (Mythology) |
| 05-myth-to-movies | "From myth to the movies." | Ganga (Mahabharat) |

Regenerate (after editing captions/cards in the script):
```
node scripts/gen-store-screenshots.mjs
```

### Sizes per store
- **App Store**: 1290×2796 satisfies the required 6.7"/6.9" iPhone set. Upload
  the same images; Apple scales down for smaller devices. (No iPad set needed
  unless you enable iPad support.)
- **Google Play**: phone screenshots must be **≤ 2:1 aspect ratio**. These are
  ~2.17:1, so Play will reject them as-is. Generate a Play-safe set (e.g.
  1242×2208) before uploading — ask and I'll add a Play variant to the script.

App icon (1024², opaque) is already baked into `ios/`/`android/` by
`npm run cap:assets`. Still to make for Play: a **1024×500 feature graphic**.
