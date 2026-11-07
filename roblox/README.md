# Historical Champions — Roblox Final Master Build

This is the consolidated Roblox edition of Historical Champions. It contains the arena, eight champion profiles, server-authoritative 1v1 combat, champion selection, rounds, rewards, persistent progression, combat feedback, and an in-game history/controls guide.

The original browser and Android project is kept separate. This Roblox package contains only the native Luau project under `roblox/`.

## What is included

- **Eight champions:** Salahuddin, Baldwin IV, Reynald, Guy, Balian, Nur ad-Din, Shirkuh and Tâcülmülûk Böri.
- **Medieval desert arena:** circular stone fighting floor, fortress walls, corner towers, gate, banners, braziers, spawn platforms and decorative floor inlays.
- **1v1 queue:** the first two players in a server duel; additional players wait as spectators for the next round.
- **Combat:** light combo chain, heavy strike, stamina, block, parry timing, dodge invulnerability, signature strike, hit feedback and server-side hit validation.
- **Round loop:** intermission, duel timer, elimination, winner/draw result, wins, coins and XP.
- **Progression:** player Coins, Wins, XP and Level. Profiles are saved with Roblox DataStores when the experience is published and API access is enabled.
- **Field Guide:** an in-game guide to controls, champion backgrounds and a short 12th-century timeline. It clearly identifies the arena duels as fictionalized gameplay rather than historical events.
- **Champion presentation:** stylized armour, headwear, shields, native-part swords, nameplates and procedural R6/R15 combat poses.

## Install and run locally

### 1. Download the one final package

Download the **HistoricalChampions-Roblox-Final** ZIP artifact from the latest successful GitHub Actions run for the `roblox/final-master-release` branch. Extract it once. You should have a single project folder containing:

- `default.project.json`
- `src\`
- `README.md`

Do not extract older Phase 1–5 folders or combine this folder with an older project.

### 2. Start Rojo

Open PowerShell inside the folder that contains `default.project.json`. Run:

```powershell
& "D:\historical-champions-roblox-phase-1-foundation\roblox\rojo.exe" serve default.project.json
```

Keep this PowerShell window open. Rojo listens on `localhost:34872`.

### 3. Connect Roblox Studio

1. Open the Roblox Studio place you use for Historical Champions (or a new Baseplate place for a clean test).
2. Open the Rojo plugin and connect to `localhost:34872`.
3. Wait for the Rojo sync to finish. The Output window should not show a project JSON parse error.
4. Press **Play**. The server generates the arena and initializes the game systems.

### 4. Test multiplayer

Use **Test → Start** with **2 Players** in Studio. A normal solo Play session will show the lobby and wait for another player. In a two-player test, the first two players enter the duel after the intermission countdown.

## Controls

| Action | Desktop |
|---|---|
| Move | WASD / arrow keys |
| Jump | Space |
| Light attack | Z / left mouse |
| Heavy attack | X / right mouse |
| Block / parry | Hold V or F |
| Dodge | C / Left Shift |
| Signature strike | R when Power reaches 100% |

Touch buttons are generated for supported mobile devices. Landscape orientation gives more room for the arena and combat controls.

## Persistent data before publishing

DataStore access may be unavailable in an unpublished local test. Before expecting saved Coins, Wins, XP, Level and champion selection:

1. Publish the Roblox experience from Studio.
2. Open **File → Experience Settings → Security**.
3. Enable **Enable Studio Access to API Services** only for a separate test experience.
4. Test by leaving and rejoining that published test server.

Studio uses the experience's live DataStores when this setting is enabled. Do not use a production experience for experimental save tests, because Studio writes can change real player data.

If DataStore access fails, the game continues with session-only stats and logs a warning; the combat round does not depend on profile storage.

## Release checklist

- Run a two-player Studio test and verify the countdown, opposing spawns, combat, elimination, results and next round.
- Test every combat action from both clients.
- Check the Field Guide and champion-selection panel on desktop and a phone/tablet aspect ratio.
- Publish a private test first, verify DataStore persistence, then open public access.
- Use only assets and audio for which you have upload and commercial-use rights.

## Art and historical accuracy limits

The current fighters are **stylized procedural Roblox builds** made from parts, welds and joint transforms. They are not bespoke sculpted 3D meshes or professionally authored animation clips. The armour palettes and some equipment are visual interpretations, not verified reconstructions of each person's exact kit. The Field Guide separates documented events from the fictional arena format. More detailed custom character models, researched clothing, recorded sound and hand-authored animations would require a dedicated asset/animation pass and Roblox asset uploads.

## Known external requirements

- Roblox Studio and the Rojo plugin are required to run and publish the experience.
- A Rojo executable is required for local sync.
- DataStore saving requires a published Roblox experience with appropriate API access.
- This repository branch has not been executed inside your local Roblox Studio session. Complete the two-player release checklist before calling the public release verified.
