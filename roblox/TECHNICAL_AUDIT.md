# Technical audit — 2026-11-03

## Existing product
The default branch `main` is a React 19 + TypeScript + Vite 2.5D fighting game, with Canvas combat simulation, Web Audio and Capacitor Android packaging. It is not a Roblox Studio place/project. The existing engine uses a deterministic fixed timestep and its current flow includes character selection, narrative intro, combat, victory and defeat.

### Existing content inventory
- Eight fighters: Salahuddin, Baldwin IV, Reynald, Guy, Balian, Nooruddin, Shirkuh and Bori.
- Five arena references: Hattin, Kerak, Marj Ayyun, Belvoir Castle and Montgisard.
- Character idle/attack sprites, individual voice clips, 28 matchup narrations, theme music and sword SFX.
- Automated checks: TypeScript typecheck, Vitest combat/layout tests, production build and asset-manifest verification.

## Risks and findings
1. **Different runtime:** React/TypeScript/Canvas assets cannot become a working Roblox game by upload. Roblox needs Luau, Roblox character rigs, animations, physics, UI and a place file.
2. **Multiplayer authority:** the original single-player simulation cannot be trusted for multiplayer. Roblox server must own health, hit validation, cooldowns, rewards and match results.
3. **Asset conversion:** existing PNGs are 2D sprites, not 3D fighter rigs. They can inform portraits/UI or licensed decals; 3D models and animations need Roblox-compatible creation or licensing.
4. **Commercial rights:** the existing repository flags ownership/licences for art, voices, narrations, music and sword SFX as unverified. Do not monetize or upload questionable assets until rights are documented. A TV-series soundtrack in the supplied archive was intentionally excluded from the original game.
5. **Archive limitation:** the supplied RAR v5 file is present, but this environment has no RAR extraction utility. Its file listing was inspected; this stage does not claim to have extracted or imported its binary assets.
6. **Secrets:** never put API keys in Roblox client code. No AI service is needed for the first multiplayer slice.
7. **Persistence and purchases:** DataStore, matchmaking, paid products and ranked rewards are deferred until match lifecycle and exploit resistance are tested.

## Roblox phase 1 delivered on this branch
- Rojo project mapping and setup guide.
- Shared combat/progression constants and the original eight fighter identifiers.
- Server bootstrap, remotes, leaderstats, and server-authoritative prototype light/heavy attack, block and dodge handling.
- Client keyboard and mobile action bindings.

## Known limitations — not a release build
- No authored arena, custom fighter rigs, animations, combat HUD, character select, matchmaking, round state or DataStore persistence.
- No strict two-player lobby enforcement yet; combat currently targets the nearest other player. A match controller must enforce 1v1 before public testing.
- Roblox Studio execution and two-client playtest have not been run in this environment. Sync into Studio and test before calling this phase verified.
- Prototype hit detection uses distance/facing checks; add line-of-sight, wind-up/hit windows, spawn protection and match-state validation before release.

## Original edition protection
All Roblox work is isolated under `roblox/` on branch `roblox/phase-1-foundation`. No existing app files on `main` were edited.
