# Historical Champions

2.5D historical fighting game: React 19 + TypeScript + Vite, Canvas combat, Web Audio. Runs in the browser (desktop/tablet/phone)
and as an Android app (Capacitor 8). The browser version is unchanged in purpose and still the primary dev target.

## Run the web game (Windows / macOS / Linux)
Requires **Node.js 22+** (Capacitor 8 needs it).

```powershell
npm install
npm run dev            # http://localhost:3000
```
Everything (art, music, voices, 28 matchup narrations) is bundled in `public/assets`; no internet and no API key are needed to play.

## Checks
```powershell
npm run typecheck      # strict TypeScript
npm test               # 23 unit tests (combat engine, fixed timestep, layout)
npm run build          # production build into dist/
npm run verify:assets  # every manifest asset exists in public/ and dist/; bundle has no CDN hosts / API keys / absolute /assets paths
npm run check          # all of the above
```
Browser end-to-end suite (needs `npx playwright install chromium` once, and `npm run dev` running):
```powershell
node scripts/e2e-smoke.mjs
```

## Android
See **docs/ANDROID_BUILD.md** (debug APK, signed release APK, signed AAB for Google Play) and **docs/RELEASE_CHECKLIST.md**.

## Optional AI "War Chronicle"
Off by default. The game never holds a Gemini key. To enable: deploy `server/chronicle-proxy.mjs` (key stays in the server's
environment), then set `VITE_CHRONICLE_ENDPOINT` in `.env.local` (see `.env.example`) and rebuild. Without it, a local chronicle is shown.

## Project layout
```
game/        engine.ts (pure combat sim, fixed 60 Hz), layout.ts (aspect-aware viewport), renderer.ts (canvas), *.test.ts
components/  Combat/ (CombatScene, HUD, touch controls, pause), ui/ (settings, loading, error boundary, rotate overlay)
screens/     MainMenu, CharacterSelect, NarrativeScreen, ResultScreen
services/    soundService, assets, gameService (save), settingsService, chronicleService, platform (Android lifecycle)
public/assets/  characters, arenas, voices, matchups, audio   (listed in assets.manifest.json; see docs/ASSET_MAP.md)
android/     Capacitor Android project (generated, then customised)
server/      optional Gemini proxy
scripts/     verify-assets, gradle launcher, e2e-smoke
```
Controls: **A/D/←/→** move, **W/Space/↑** jump, **J** attack, **K** special, **L/↓** block, **Esc/P** pause. Touch: on-screen buttons.
