# Release-readiness checklist

## Do before anything else
- [ ] **Rotate your Gemini API key.** The ZIP you sent contained `.env.local` with a `GEMINI_API_KEY` entry, and the original `vite.config.ts` injected that value into the client JavaScript, so any web build you deployed exposed it. (It is not in the GitHub checkout I inspected, and it is not in this project.) Treat the old key as compromised.
- [ ] Decide the **application ID** (permanent after first upload) and **developer/brand name**.
- [ ] Create and back up the **upload keystore** (docs/ANDROID_BUILD.md §B).

## Build / technical
- [ ] `npm run check` passes; `npm run android:bundle` produces a **signed** `.aab`.
- [ ] Target API 36 confirmed against the current Play requirement; `HC_VERSION_CODE` bumped.
- [ ] Install the **release** build (not just debug) on at least: a small low-RAM phone, a large phone with a notch, a tablet, and a foldable if possible.
- [ ] Device checks that I could **not** run: real touch feel/latency, audio on Android WebView (music start after first tap, interruptions by calls/notifications, headphones unplug), back button, app switching/lock-screen resume, rotating both landscape directions, gesture-navigation edge swipes, safe areas on a real notch, thermals/battery, and FPS on low-end hardware (no frame-rate figure is claimed).
- [ ] Play Console **pre-launch report** reviewed; test via Internal testing before Production. (New personal developer accounts may have to run a closed test with a minimum number of testers/days first: check the current rule in Play Console.)

## Play Console forms
- [ ] **Privacy policy URL** (required). Must state what is/ isn't collected.
- [ ] **Data safety form.** The packaged game collects nothing itself. If AI narration is enabled, the app sends *character ids, remaining-HP %, best combo and fight duration* to **your** server (no account, no device id, no personal data), and your server/host will see IP addresses in logs: declare accordingly. If AI is off and you remove `INTERNET`, you can declare no data collected.
- [ ] **Content rating questionnaire** (cartoon violence between historical figures), target audience (not children-directed unless you intend it).
- [ ] **AI-generated content:** if the character art/voices/music were AI-generated, check Google Play's current AI-generated-content policy and disclose where required.
- [ ] Store listing: icon 512×512 (use `assets/icon-only.png` as a base), feature graphic 1024×500, **landscape** phone/tablet screenshots (see `e2e-shots` after running the suite).
- [ ] Sensitive-content review: the game depicts real religious/historical figures from the Crusades. Make sure depictions and voice lines are respectful and comply with Play's sensitive-events/hate-speech policies.

## Asset licensing: needs YOUR confirmation (I can't verify provenance)
- [ ] **`Game BG music.mp3`** (bundled as the theme): who composed it and under what licence?
- [ ] **`sword-sound-260274.mp3`** (bundled): the name looks like a stock-library file (e.g. Pixabay); confirm licence/attribution terms allow app distribution.
- [ ] **Character art, voices, 28 narrations:** confirm you own/are licensed to use them (and how they were produced).
- [ ] **`Kudüs Fatihi Selahaddin Eyyubi Müzikleri.mp3`** was deliberately **not** bundled: TV-series music is almost certainly copyrighted.
- [ ] Credit link to `@Tube_HJ` stays in the menu (opens the system browser).
- [ ] Spot-check by ear that each matchup narration says the right two names (I matched by file name and could not listen).
