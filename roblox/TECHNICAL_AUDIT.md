# Technical audit — 2026-11-03

## Existing product

The default branch `main` is a React 19 + TypeScript + Vite 2.5D fighting game, with Canvas combat simulation, Web Audio, Capacitor Android packaging, and a Vitest test suite. It is not a Roblox place/project. Its combat engine is deterministic and fixed-timestep; its current game flow includes character select, narrative intro, combat, victory and defeat.

### Existing content inventory (from repository manifest/docs)

- Eight fighters: Salahuddin, Baldwin IV, Reynald, Guy, Balian, Nooruddin, Shirkuh and Bori.
- Five arena references: Hattin, Kerak, Marj Ayyun, Belvoir Castle and Montgisard.
- Character idle/attack sprites, individual voice clips, 28 matchup narrations, theme music and sword SFX.
- Existing automated checks: TypeScript typecheck, Vitest combat/layout tests, production build and asset-manifest verification.

## Risks / findings

1. **Different runtime:** React/TypeScript/Canvas assets cannot be imported as a working Roblox game. Roblox requires Luau scripts, Roblox character rigs, animations, physics, UI and a place file.
2. **Multiplayer authority:** the original single-player simulation must not be trusted for multiplayer. The Roblox server must own health, hit validation, cooldowns, rewards and match results.
3. **Assets:** existing PNGs are 2D sprites, not 3D character rigs. They can inform UI/portraits or be used as permitted decals, but 3D fighter models and animations need new Roblox-compatible assets.
4. **Commercial rights:** the repository itself flags that ownership/licences for art, voices, matchup narration, music and sword sound are unverified. Do not monetize or upload questionable assets until rights are documented. A TV-series soundtrack in the supplied archive was intentionally excluded from the original game.
5. **Archive limitation:** the supplied RAR v5 file is present, but this environment has no RAR extraction utility. Its archive listing was inspected in the earlier audit; this stage does not claim to have extracted or imported its binary assets.
6. **Security:** never put Gemini/API secrets in Roblox client code. Server secrets are not needed for the first multiplayer combat slice.
7. **Persistence and purchases:** DataStore persistence, matchmaking, paid products and ranked rewards are intentionally deferred until match lifecycle and exploit resistance are tested.

## Roblox phase 1 delivered on this branch

- Rojo project mapping and setup guide.
- Shared combat/progression constants and original eight-character roster identifiers.
- Server bootstrap, remotes, leaderstats, and server-authoritative light/heavy attack, block and dodge handling.
- Client keyboard/touch action bindings.

## Known limitations — not a release build

- No authored arena, custom fighter rigs, animations, combat HUD, character select, matchmaking, round state, or DataStore persistence yet.
- No hard two-player lobby enforcement yet; the first combat service currently selects the nearest other player. The match controller will enforce 1v1 before public testing.
- No Roblox Studio execution or two-client playtest can be performed from this GitHub-only environment. These scripts must be synced into Studio and tested there before the phase is marked verified.
- The combat prototype uses basic distance/facing checks and needs server-side line-of-sight, attack wind-up/hit windows, spawn protection, and robust match-state checks before release.

## Original edition protection

All Roblox work is isolated under `roblox/` on branch `roblox/phase-1-foundation`. No existing application files on `main` were edited.
