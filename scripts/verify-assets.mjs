// Verifies bundled assets and scans the production build. Exit code 1 on any problem.
//   npm run build && npm run verify:assets
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.cwd();
const m = JSON.parse(readFileSync(join(root, 'assets.manifest.json'), 'utf8'));
const errors = [], notes = [];
const need = (rel) => {
  for (const base of ['public/assets', 'dist/assets']) {
    if (base === 'dist/assets' && !existsSync(join(root, 'dist'))) continue;
    const p = join(root, base, rel);
    if (!existsSync(p)) errors.push(`missing ${base}/${rel}`); else if (statSync(p).size < 200) errors.push(`suspiciously small ${base}/${rel}`);
  }
};

const ids = Object.keys(m.characters).sort();
for (const c of Object.values(m.characters)) { need(c.idle); need(c.attack); need(c.voice); }
for (const a of Object.values(m.arenas)) need(a);
for (const a of Object.values(m.audio)) need(a);
const expectedPairs = []; for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) expectedPairs.push(`${ids[i]}-${ids[j]}`);
for (const k of expectedPairs) if (!m.matchups.includes(k)) errors.push(`manifest lacks matchup ${k}`);
for (const k of m.matchups) { if (!expectedPairs.includes(k)) errors.push(`manifest has unknown matchup ${k}`); need(`matchups/${k}.mp3`); }
notes.push(`${ids.length} characters, ${Object.keys(m.arenas).length} arenas, ${m.matchups.length}/${expectedPairs.length} matchup narrations checked`);

// Scan the production build for external hosts and leaked secrets.
const dist = join(root, 'dist');
if (existsSync(dist)) {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const bad = /(catbox\.moe|ibb\.co|cdn\.tailwindcss\.com|esm\.sh|transparenttextures\.com|googleapis\.com\/css)/i;
  const secret = /AIza[0-9A-Za-z_\-]{35}/;
  for (const f of walk(dist).filter((f) => ['.js', '.html', '.css', '.json'].includes(extname(f)))) {
    const t = readFileSync(f, 'utf8');
    if (bad.test(t)) errors.push(`external host referenced in ${f.replace(root, '.')}: ${t.match(bad)[0]}`);
    if (secret.test(t)) errors.push(`POSSIBLE API KEY in ${f.replace(root, '.')}`);
    if (/["'(]\/assets\//.test(t)) errors.push(`root-absolute /assets/ path in ${f.replace(root, '.')} (breaks in packaged app)`);
  }
  notes.push('dist/ scanned: no external CDN/asset hosts, no API-key pattern, no root-absolute asset paths');
} else notes.push('dist/ not found - run "npm run build" to include the bundle scan');

notes.forEach((n) => console.log('  ' + n));
if (errors.length) { console.error('\nFAILED:\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('verify-assets: OK');
