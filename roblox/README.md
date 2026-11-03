# Historical Champions — Roblox Edition

This is a **native Roblox/Luau rebuild** of the original Historical Champions concept. The existing React/TypeScript browser and Android game remains untouched.

## Development status

- [x] Phase 1 repository scaffold and server-authoritative combat foundation
- [ ] Studio greybox arena and spawn locations
- [ ] Client combat controls and HUD
- [ ] Character selection and historical roster
- [ ] Matchmaking / round lifecycle
- [ ] DataStore persistence (after schema and abuse review)
- [ ] Cosmetics and ethical monetization (after retention testing)

## Tooling

Use Roblox Studio for place creation and testing. The repository uses [Rojo](https://rojo.space/) to sync source files into Studio.

1. Install Roblox Studio and Rojo.
2. From this `roblox/` directory run `rojo serve default.project.json`.
3. Connect the Rojo plugin in Studio.
4. Create a new Baseplate place and sync the project.
5. Press Play with two local test clients to validate server-side combat.

## First playable slice

The current server foundation creates remotes, initializes player combat attributes and leaderstats, and validates attack/block/dodge requests on the server. It intentionally does **not** claim to be a complete playable game yet: the arena, client controls, animations, UI, matchmaking and persistence are separate milestones.

## Security rules

- The server owns health, damage, cooldowns, block state, and currency.
- Clients may request actions; they never submit damage values or target instances.
- Validate distance, alive state, cooldowns, and request rate on the server.
- Never store paid-currency balances or purchase grants solely on the client.
- Do not ship API keys or private credentials in client code.

## Historical and asset notes

The original game roster includes Salahuddin, Baldwin IV, Reynald, Guy, Balian, Nooruddin, Shirkuh and Bori. Historical depictions and all supplied art/audio must be checked for factual care, respectful presentation, and commercial-use rights before release. Roblox-specific character rigs and animations may need to be recreated or licensed; 2D sprites do not automatically become usable 3D avatars.

## Test checklist

- [ ] Two players can join the same Studio server.
- [ ] Invalid action names and spammed requests are rejected.
- [ ] Damage and blocking are decided by the server.
- [ ] A player cannot attack while dead or outside cooldown.
- [ ] No persistent rewards are granted before a match result is validated.
