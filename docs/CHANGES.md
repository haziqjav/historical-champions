# Audit findings and change log

## Problems found in the original project
| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | `vite.config.ts` injected `GEMINI_API_KEY` into the client bundle; real key sat in `.env.local` inside the zip | **Critical** | Key removed from client; optional server proxy; `.env.example`; build scan fails on key patterns |
| 2 | All art/audio loaded from ibb.co / Catbox (offline = no sprites, no sound); `/index.css` referenced but missing; Tailwind via CDN, React via esm.sh import map | High | All assets bundled + manifest; local Tailwind 3.4 build; Vite bundling; CDN/import map removed |
| 3 | Combat physics advanced **per rendered frame**: on 90/120/144 Hz screens the game ran 1.5–2.4× faster | High | Fixed 60 Hz timestep engine (tested at 30–240 Hz) |
| 4 | Fixed 400 px sprites / 120 px ground, background stretched to the window: on a 360 px-tall phone a fighter was taller than the screen; backgrounds distorted | High | Logical 800-unit world, uniform scaling, aspect-aware width, cover-fit backgrounds |
| 5 | 181 s music decoded fully into memory (~64 MB PCM) | High | Streamed via `HTMLAudioElement` |
| 6 | Menu music never played in browsers (AudioContext only resumed inside combat) | Medium | Global first-gesture unlock |
| 7 | `audio.duration` of an unloaded clip is `NaN` → intro timer fired immediately (intro skipped, narration cut) | Medium | Event-driven completion + timed fallback + hard cap |
| 8 | Combo counter read a stale React closure: never exceeded 1 (and "max combo" stat was always 1) | Medium | Combo tracked in the engine (regression-tested) |
| 9 | `ctx.filter` + `shadowBlur` every frame (slow on mid/low phones, unsupported on some WebViews) | Medium | Variants baked once into offscreen canvases |
| 10 | Timers not cleared on unmount; no pause on background; no `pointercancel` handling (stuck buttons); `loadGame` could throw on corrupt JSON → blank screen | Medium | Loop-driven timers, lifecycle pause, pointer capture, safe storage, ErrorBoundary |
| 11 | CSS-only portrait overlay hid the whole app (`#root{display:none}`) and collapsed the canvas to 0×0 | Medium | React overlay in combat only; battle pauses and keeps state |
| 12 | Post-battle "chronicle voices": 3 placeholder URLs, 3 reused unrelated intro recordings | Low | Not substituted; text + optional AI audio (see ASSET_MAP) |
| 13 | Fighters could be pushed past the arena wall by the collision resolver | Low | Re-clamp after separation (regression-tested) |
| 14 | Stale decorative "99" timer in HUD | Low | Replaced by a working pause button |

### Observations I deliberately did **not** change (gameplay is preserved)
* **Defense, Speed and Crit** stats are shown on the select screen but have no effect in combat (damage = Attack × multiplier). `calculateDamage` exists but is unused.
* The AI can re-hit a stunned fighter, so an **idle player dies in ~4–6 s** against every opponent (measured on the ported engine; Baldwin IV fastest). Winning needs pre-emptive attacks/blocks. Say the word if you want hit-stun protection or balance changes.
* There is no combat music (theme fades out when the fight starts), same as the original.

## File-by-file
| File | Change |
|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `vite-env.d.ts` | New toolchain: Vite 6, strict TS, local Tailwind 3.4, Vitest, Capacitor 8 scripts; no secret `define` |
| `index.html` | CDN/import map/portrait CSS removed; viewport-fit=cover, no-zoom meta |
| `index.css` (new) | Tailwind, safe-area variables, animations (replacing never-working `animate-in` classes), local carbon pattern |
| `index.tsx` | Imports CSS, ErrorBoundary |
| `App.tsx` | Rewritten as a shell: state machine, boot preload, back/background handling, rematch, chronicle flow |
| `constants.ts` | Asset URLs → manifest/local; **stats, names, descriptions, all 28 intro texts byte-identical** |
| `assets.manifest.json` (new) | Single source of truth for bundled paths |
| `types.ts` | + `AudioSettings` |
| `game/engine.ts` (new) | Combat logic extracted from `CombatScene`, fixed timestep, bug fixes |
| `game/layout.ts`, `game/renderer.ts` (new) | Responsive stage; baked sprite variants; damage popups |
| `game/game.test.ts` (new) | 23 tests (mutation-checked against the original combo and frame-rate bugs) |
| `components/Combat/CombatScene.tsx` | Canvas+HUD+pause host, ResizeObserver, rAF loop, keyboard |
| `components/Combat/TouchControls.tsx`, `PauseOverlay.tsx` (new) | Scaled, safe-area-aware pointer-captured controls; pause menu |
| `components/Combat/HealthBar.tsx`, `components/CharacterCard.tsx` | Responsive sizing, memoised, accessible |
| `components/ui/*` (new) | SettingsPanel, LoadingScreen, RotateOverlay, ErrorBoundary |
| `screens/*` (new) | MainMenu, CharacterSelect, NarrativeScreen, ResultScreen (stats, rematch) |
| `services/soundService.ts` | Rewritten (streamed BGM, single voice channel, SFX buffer, lifecycle, volumes) |
| `services/assets.ts`, `settingsService.ts`, `storage.ts`, `platform.ts`, `chronicleService.ts` (new) | Loader, persisted volumes, safe storage, Android lifecycle, optional AI client |
| `services/gameService.ts` | Same save key/format; never throws |
| `services/audioUtils.ts` | Alignment-safe PCM decode |
| `server/*` (new) | Optional Gemini proxy (validation, rate-limit, CORS allow-list) |
| `scripts/*` (new) | verify-assets, gradle launcher, e2e-smoke |
| `capacitor.config.ts`, `android/` (new) | Android project; manifest (sensorLandscape, game category, only INTERNET), themes, MainActivity immersive mode, signing/versioning in `app/build.gradle`, generated icons + splash |
| `assets/`, `public/assets/` (new) | Icon/splash sources (from your Salahuddin art); 59 bundled game assets (15.2 MB) |
