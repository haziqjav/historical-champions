# Asset map: original code reference → supplied file → bundled path

Generated from the original `constants.ts` and the supplied RAR. Local files were used for **every** asset; Catbox/ibb.co were not contacted (they are unreachable from the build sandbox, and nothing was missing locally).

> Matching was done by file name (ibb/Catbox keep the original name or the upload list in `voices from haziqjav@gmail.com` names the voice). I could not download the remote files to byte-compare them, and I cannot listen to audio, so please spot-check by ear/eye (see RELEASE_CHECKLIST).

## Characters (sprites + voice)

| Character | Original remote constant | Local source file (RAR) | Bundled path |
|---|---|---|---|
| salahuddin (idle) | Salahuddin.png | `Salahuddin.png` | `public/assets/characters/salahuddin.png` |
| salahuddin (attack) | salahudin-attack-removebg-preview.png | `salahudin_attack-removebg-preview.png` | `public/assets/characters/salahuddin_attack.png` |
| salahuddin (voice) | 7zr5eg.mp3 | `SALAHUDDIN VOICE.mp3` | `public/assets/voices/salahuddin.mp3` |
| baldwin_iv (idle) | BALDWIN.png | `BALDWIN.png` | `public/assets/characters/baldwin_iv.png` |
| baldwin_iv (attack) | baldwin-iv-attack-removebg-preview.png | `baldwin_iv_attack-removebg-preview.png` | `public/assets/characters/baldwin_iv_attack.png` |
| baldwin_iv (voice) | mheo99.mp3 | `BALDWIN IV.mp3` | `public/assets/voices/baldwin_iv.mp3` |
| nooruddin (idle) | NURUDDIN-ZANGI.png | `NURUDDIN ZANGI.png` | `public/assets/characters/nooruddin.png` |
| nooruddin (attack) | NURUDDIN-ZANGI-ATTACK-removebg-preview.png | `NURUDDIN_ZANGI_ATTACK-removebg-preview.png` | `public/assets/characters/nooruddin_attack.png` |
| nooruddin (voice) | zkh2m2.mp3 | `Nuruddin Zangi voice.mp3` | `public/assets/voices/nooruddin.mp3` |
| guy (idle) | LORD-GUY.png | `LORD GUY.png` | `public/assets/characters/guy.png` |
| guy (attack) | lord-guy-attack-removebg-preview.png | `lord_guy_attack-removebg-preview.png` | `public/assets/characters/guy_attack.png` |
| guy (voice) | 0vjozl.mp3 | `Lord Guy.mp3` | `public/assets/voices/guy.mp3` |
| balian (idle) | BALIAN.png | `BALIAN.png` | `public/assets/characters/balian.png` |
| balian (attack) | balian-attack-removebg-preview.png | `balian_attack-removebg-preview.png` | `public/assets/characters/balian_attack.png` |
| balian (voice) | pr7kxu.mp3 | `BALIAN VOICE.mp3` | `public/assets/voices/balian.mp3` |
| reynald (idle) | CHatillion.png | `CHatillion.png` | `public/assets/characters/reynald.png` |
| reynald (attack) | CHATILLION-ATTACK-removebg-preview.png | `CHATILLION_ATTACK-removebg-preview.png` | `public/assets/characters/reynald_attack.png` |
| reynald (voice) | on4ua3.mp3 | `Chatilion VOICE.mp3` | `public/assets/voices/reynald.mp3` |
| shirkuh (idle) | SHIRKUH.png | `SHIRKUH.png` | `public/assets/characters/shirkuh.png` |
| shirkuh (attack) | shirkuh-attack-removebg-preview.png | `shirkuh_attack-removebg-preview.png` | `public/assets/characters/shirkuh_attack.png` |
| shirkuh (voice) | 3sddl5.mp3 | `SHIRKUH.mp3` | `public/assets/voices/shirkuh.mp3` |
| bori (idle) | BORU.png | `BORU.png` | `public/assets/characters/bori.png` |
| bori (attack) | boru-attack-removebg-preview.png | `boru_attack-removebg-preview.png` | `public/assets/characters/bori_attack.png` |
| bori (voice) | n3x0zz.mp3 | `BORU.mp3` | `public/assets/voices/bori.mp3` |

## Arenas

| Arena | Local source file | Bundled path | Source resolution |
|---|---|---|---|
| hattin | `Hattin.jpg` | `public/assets/arenas/hattin.jpg` | 330×213 |
| kerak | `Kerak Castle.jpg` | `public/assets/arenas/kerak.jpg` | 600×400 |
| marjayyun | `Marj Ayyun.jpg` | `public/assets/arenas/marjayyun.jpg` | 360×202 |
| belvoir | `Belvoir Castle.jpg` | `public/assets/arenas/belvoir.jpg` | 750×500 |
| montgisard | `Montgisard.jpg` | `public/assets/arenas/montgisard.jpg` | 1187×719 |

## Music / SFX

| Use | Local source file | Bundled path |
|---|---|---|
| theme | `Game BG music.mp3` | `public/assets/audio/theme.mp3` |
| sword | `sword-sound-260274.mp3` | `public/assets/audio/sword.mp3` |

## Matchup narration (28 of 28 pairs)

Key = the two character ids sorted alphabetically.

| Pair key | Original Catbox id | Local source file (`pRE TEXT VOICES/`) | Bundled path |
|---|---|---|---|
| baldwin_iv-balian | — | `BALDWIN IV VS BALIAN.mp3` | `public/assets/matchups/baldwin_iv-balian.mp3` |
| baldwin_iv-bori | — | `BALDWIN IV VS BORI.mp3` | `public/assets/matchups/baldwin_iv-bori.mp3` |
| baldwin_iv-guy | — | `BALDWIN IV VS GUY.mp3` | `public/assets/matchups/baldwin_iv-guy.mp3` |
| baldwin_iv-nooruddin | — | `BALDWIN IV VS NOORUDDIN ZANGI.mp3` | `public/assets/matchups/baldwin_iv-nooruddin.mp3` |
| baldwin_iv-reynald | — | `BALDWIN IV VS CHATILLION.mp3` | `public/assets/matchups/baldwin_iv-reynald.mp3` |
| baldwin_iv-salahuddin | — | `SALAHUDDIN VS BALDWN IV.mp3` | `public/assets/matchups/baldwin_iv-salahuddin.mp3` |
| baldwin_iv-shirkuh | — | `BALDWIN IV VS SHIRKUH.mp3` | `public/assets/matchups/baldwin_iv-shirkuh.mp3` |
| balian-bori | — | `BALIAN VS BORI.mp3` | `public/assets/matchups/balian-bori.mp3` |
| balian-guy | — | `GUY VS BALIAN.mp3` | `public/assets/matchups/balian-guy.mp3` |
| balian-nooruddin | — | `BALIAN VS NOORUDDIN ZANGI.mp3` | `public/assets/matchups/balian-nooruddin.mp3` |
| balian-reynald | — | `CHATILLION VS BALIAN.mp3` | `public/assets/matchups/balian-reynald.mp3` |
| balian-salahuddin | — | `SALAHUDDIN VS BALIAN.mp3` | `public/assets/matchups/balian-salahuddin.mp3` |
| balian-shirkuh | — | `shirkuh vs balian.mp3` | `public/assets/matchups/balian-shirkuh.mp3` |
| bori-guy | — | `GUY VS BORI.mp3` | `public/assets/matchups/bori-guy.mp3` |
| bori-nooruddin | — | `nooruddin vs bori.mp3` | `public/assets/matchups/bori-nooruddin.mp3` |
| bori-reynald | — | `CHATILLION VS BORI.mp3` | `public/assets/matchups/bori-reynald.mp3` |
| bori-salahuddin | — | `SALAHUDDIN VS Bori.mp3` | `public/assets/matchups/bori-salahuddin.mp3` |
| bori-shirkuh | — | `BORI VS SHIRKUH.mp3` | `public/assets/matchups/bori-shirkuh.mp3` |
| guy-nooruddin | — | `GUY VS NOORUDDIN ZANGI.mp3` | `public/assets/matchups/guy-nooruddin.mp3` |
| guy-reynald | — | `CHATILLION VS GUY.mp3` | `public/assets/matchups/guy-reynald.mp3` |
| guy-salahuddin | — | `salahuddin VS LORD GUY.mp3` | `public/assets/matchups/guy-salahuddin.mp3` |
| guy-shirkuh | — | `guy vs shirkuh.mp3` | `public/assets/matchups/guy-shirkuh.mp3` |
| nooruddin-reynald | — | `chatillion vs nooruddin.mp3` | `public/assets/matchups/nooruddin-reynald.mp3` |
| nooruddin-salahuddin | — | `SALAHUDDIN VS NOORUDIN ZANGI.mp3` | `public/assets/matchups/nooruddin-salahuddin.mp3` |
| nooruddin-shirkuh | — | `nooruddin zangi vs shirkuh.mp3` | `public/assets/matchups/nooruddin-shirkuh.mp3` |
| reynald-salahuddin | — | `SALAHUDDIN VS CHATILLION.mp3` | `public/assets/matchups/reynald-salahuddin.mp3` |
| reynald-shirkuh | — | `chatillion VS SHIRKUH.mp3` | `public/assets/matchups/reynald-shirkuh.mp3` |
| salahuddin-shirkuh | — | `SALAHUDDIN VS SHIRKUH.mp3` | `public/assets/matchups/salahuddin-shirkuh.mp3` |

## Not bundled / still open

- **Narrator “chronicle” voices (post-battle):** the original listed 6 Catbox URLs; 3 were admitted placeholders (`z4h3h8`, `m6f3z3`, `h7v1g1`) with no file in the RAR, and the other 3 were *pre-fight intro* recordings (Baldwin–Salahuddin, Reynald–Salahuddin, Guy–Salahuddin) that would play after unrelated fights. They were **not** substituted. The result screen now shows the chronicle as text, with optional spoken AI narration when the proxy is configured. If you have real post-battle recordings, add them under `public/assets/` and tell me/the manifest.
- **`Kudüs Fatihi Selahaddin Eyyubi Müzikleri…mp3`** (3.5 MB): not referenced by the code and not bundled. Its name indicates TV-series soundtrack music: do not ship it without a licence.
- **`Game BG music.mp3`** is bundled as the theme (the supplied upload list identifies the original `bg music` URL as the game background track, and this is the only file with that name). Confirm its origin/licence.
- **Non-`removebg` attack PNGs** (opaque backgrounds), `Jerusalem.jpg` (unreferenced), `HOMPAGE.jpg`, README screenshots: not bundled.
- **Low-resolution arena art:** Hattin (330×213), Marj Ayyun (360×202), Kerak (600×400) are smaller than a phone screen, so they look soft. They are scaled with *cover* (never stretched) but need higher-resolution replacements for a premium look.
- **Duplicate narration files in the RAR:** `BORI VS SHIRKUH` = `SHIRKUH VS BORI` and `nooruddin vs bori` = `nooruddin ZANGI VS BORI` (identical audio, same pair). One copy of each is bundled.
