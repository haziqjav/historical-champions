# Historical Champions — Final Roblox Build Audit

## Consolidated project

This branch combines the Roblox work into one installable Rojo project. The original React/TypeScript browser and Android edition remains separate and has not been modified by the Roblox build.

## Included systems

- Generated medieval desert fortress arena with opposing spawn pads.
- Eight champion profiles with stylized native-part armour, shields, swords and nameplates.
- Procedural R6/R15 combat poses, sword trails and client-side combat feedback.
- Server-owned light and heavy attacks, combo state, stamina, block, parry timing, dodge, signature strike and hit validation.
- 1v1 match queue, intermission, duel timer, elimination, results and rewards.
- Players beyond the first two wait in the server queue and cannot interfere with the active duel.
- Coins, Wins, XP and Level leaderboard values.
- DataStore profile saving for Coins, Wins, XP and selected champion.
- Field Guide with controls, champion summaries and historical timeline.

## Static checks completed

- The GitHub Actions packaging workflow completed successfully.
- The workflow parsed `default.project.json` as valid JSON.
- It checked for required Luau entry-point files and created a Roblox-only ZIP package.
- The generated ZIP was downloaded and its archive integrity was checked.

## Checks not completed

The project has not been executed in the user's Roblox Studio session. Static packaging is not proof that every Luau script, animation pose, device layout, physics interaction or multiplayer state works without a runtime issue. A two-player Studio test and a published private-server test remain necessary before public release.

## Art and historical scope

Fighters are stylized procedural builds assembled from Roblox parts and welds. They are not custom sculpted meshes or professionally authored animation clips. The Field Guide distinguishes documented people and events from the fictionalized arena-duel format. Specific equipment, colours, face designs and signature moves are artistic choices unless identified otherwise.

## Release requirements

- Open the project through Rojo in Roblox Studio.
- Complete the included two-player test checklist in the README.
- Publish a private test experience and enable the required API access before expecting DataStore persistence.
- Confirm rights to any external assets or audio before uploading or monetizing them.
