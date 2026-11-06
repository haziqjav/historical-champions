# Historical Champions — Roblox Edition

This is a **native Roblox/Luau rebuild** of the original Historical Champions concept. The existing React/TypeScript browser and Android game remains untouched.

## Development status

- [x] Phase 1 repository scaffold and server-authoritative combat foundation
- [x] Phase 2 first generated medieval desert arena and opposing spawn locations
- [ ] Custom 3D champion rigs, animations and selection
- [ ] Client combat feedback, HUD and main menu
- [ ] Matchmaking / round lifecycle
- [ ] Additional arenas and game modes
- [ ] DataStore persistence (after schema and abuse review)
- [ ] Cosmetics and ethical monetization (after retention testing)

## Install and sync

1. Install Roblox Studio and Rojo 7.x.
2. Download the repository branch `roblox/phase-2-arena` as a ZIP and extract it.
3. Open the extracted `roblox` folder in PowerShell.
4. Run `rojo serve default.project.json`.
5. Open a Baseplate place in Roblox Studio, install/enable the Rojo plugin, and connect to `localhost:34872`.
6. Press Play. The server creates a folder named `HistoricalChampionsArena` in Workspace.

Keep the PowerShell Rojo window open while Studio is connected. Stop it with Ctrl+C after testing.

## Arena contents

The first arena is a code-generated greybox: desert foundation, raised circular stone fighting floor, fortress walls and corner towers, south gate, two opposing spawn locations, banners, torches, and warm desert lighting. It uses native Roblox Parts and built-in materials; no external models or packages are downloaded.

The arena is a first visual foundation, not a finished art pass. The spawn locations are neutral so Studio multiplayer tests can use them; team assignment and round flow are future work.

## Controls from Phase 1 prototype

- Z: light attack
- X: heavy attack
- C: dodge
- Hold V: block

These controls are prototype combat requests; polished animations, hit reactions and a full HUD are not included in this arena phase.

## Security and release notes

- The server owns health, damage, cooldowns, block state, and currency.
- Clients may request actions; they never submit damage values or target instances.
- Validate distance, alive state, cooldowns, and request rate on the server.
- Do not ship API keys or private credentials in client code.
- Historical depictions and all supplied art/audio must be checked for factual care, respectful presentation, and commercial-use rights before release. 2D sprites do not automatically become usable 3D avatars.

## Test checklist

- [ ] Rojo connects without parse or sync errors.
- [ ] Output prints `[HistoricalChampions] Medieval desert arena generated.`
- [ ] Workspace contains `HistoricalChampionsArena`.
- [ ] Both spawn locations are visible in Explorer under that folder.
- [ ] Two local test clients can spawn on opposite pads (verify actual spawn distribution; neutral spawns may not guarantee one player per side).
- [ ] Existing combat prototype still runs without server errors.
