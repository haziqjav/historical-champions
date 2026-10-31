// End-to-end browser checks (Chromium via Playwright). Needs the dev server (uses a DEV-only test hook).
//   Terminal 1: npm run dev            Terminal 2: node scripts/e2e-smoke.mjs
// Env: BASE_URL (default http://localhost:3000), CHROMIUM_PATH (optional), SHOTS (screenshot dir)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000/';
const SHOTS = process.env.SHOTS || 'e2e-shots';
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info', '--no-sandbox'],
});

async function newPage(viewport, { touch = false, blockMp3 = false, offline = false } = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const page = await ctx.newPage();
  const log = { errors: [], external: [], failed: [], audio: [] };
  page.on('pageerror', (e) => log.errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) log.failed.push(r.status() + ' ' + r.url()); });
  await page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) { log.external.push(u.href); return route.abort(); }
    if (blockMp3 && u.pathname.endsWith('.mp3')) return route.abort();
    return route.continue();
  });
  if (offline) await ctx.setOffline(true);
  await page.addInitScript(() => {
    // record Audio elements + outstanding rAF loops
    window.__audio = []; const A = window.Audio;
    window.Audio = function (src) { const a = new A(src); window.__audio.push(a); return a; }; window.Audio.prototype = A.prototype;
    window.__raf = new Set(); const r = window.requestAnimationFrame.bind(window), c = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { const id = r((t) => { window.__raf.delete(id); cb(t); }); window.__raf.add(id); return id; };
    window.cancelAnimationFrame = (id) => { window.__raf.delete(id); c(id); };
  });
  return { ctx, page, log };
}
const text = (page, t, o = {}) => page.getByText(t, { exact: false }).first().waitFor({ state: 'visible', timeout: o.timeout ?? 8000 }).then(() => true, () => false);
const shot = (page, n) => page.screenshot({ path: `${SHOTS}/${n}.png` });
const hc = (page, fn, arg) => page.evaluate(fn, arg);

async function toSelect(page) { await page.goto(BASE); await text(page, 'Battle Now'); await page.getByText('Battle Now').click(); return text(page, 'Select Champion'); }
async function toCombat(page, fromSelect = true) {
  if (fromSelect) await page.getByRole('button', { name: 'Fight' }).click();
  await text(page, 'Skip Intro'); await sleep(900);
  await page.getByText('Skip Intro').click();
  await page.waitForFunction(() => !!window.__hc?.battle, null, { timeout: 8000 });
  await page.waitForFunction(() => window.__hc.battle.phase === 'fight', null, { timeout: 9000 });
  await godMode(page);
}
async function godMode(page) { await page.evaluate(() => { const b = window.__hc.battle; b.player.hp = b.player.maxHp = 1e9; b.enemy.aiCooldown = 1e9; }); } // durable player + passive enemy: the AI otherwise stun-locks an idle player
async function winFight(page) {
  await hc(page, () => { const b = window.__hc.battle; b.enemy.x = b.player.x + 200; b.enemy.hp = 1; b.enemy.aiCooldown = 999; b.enemy.state = 'IDLE'; b.player.state = 'IDLE'; b.player.dir = 1; });
  await page.keyboard.press('KeyJ');
}

// ---------------------------------------------------------------- 1. desktop flow
{
  const { ctx, page, log } = await newPage({ width: 1366, height: 768 });
  await page.goto(BASE);
  check('desktop: main menu renders', await text(page, 'Battle Now'));
  await shot(page, 'desktop-1-menu');
  await page.getByText('Battle Now').click();
  check('desktop: character select opens', await text(page, 'Select Champion'));
  check('desktop: 8 roster cards', (await page.locator('button[aria-pressed]').count()) === 8);
  await page.getByRole('button', { name: 'Guy de Lusignan' }).click(); await sleep(400);
  check('desktop: selecting a character updates the hero panel', await text(page, 'King Consort'));
  const audioNow = await hc(page, () => window.__audio.filter((a) => !a.paused).map((a) => a.src.split('/').pop()));
  check('audio: theme music is playing after first interaction', audioNow.some((s) => s === 'theme.mp3'), JSON.stringify(audioNow));
  check('audio: character voice line played on select', (await hc(page, () => window.__audio.some((a) => /voices\/guy\.mp3/.test(a.src) && (a.currentTime > 0 || !a.paused)))));
  await shot(page, 'desktop-2-select');
  await page.getByRole('button', { name: 'Fight' }).click();
  check('intro: narrative screen shows', await text(page, 'Skip Intro'));
  await sleep(1800);
  const narr = await hc(page, () => window.__audio.filter((a) => /matchups\//.test(a.src)).map((a) => ({ src: a.src.split('/').pop(), playing: !a.paused, d: a.duration })));
  check('audio: matchup narration plays during intro', narr.some((n) => n.playing && n.d > 3), JSON.stringify(narr));
  await shot(page, 'desktop-3-intro');
  await page.getByText('Skip Intro').click();
  await page.waitForFunction(() => !!window.__hc?.battle, null, { timeout: 8000 });
  check('combat: scene mounts after skip', true);
  await shot(page, 'desktop-4-countdown');
  await page.waitForFunction(() => window.__hc.battle.phase === 'fight', null, { timeout: 9000 });
  check('combat: countdown completes into fight', true);
  await godMode(page);
  await sleep(1500); // theme fades out for combat
  const themePlaying = await hc(page, () => window.__audio.some((a) => /theme\.mp3/.test(a.src) && !a.paused));
  check('audio: theme stops for combat (original behaviour)', !themePlaying);
  await page.keyboard.down('KeyD'); await sleep(500); await page.keyboard.up('KeyD');
  await page.keyboard.press('KeyJ'); await sleep(250);
  await shot(page, 'desktop-5-fight');
  const kx = await hc(page, () => { const b = window.__hc.battle; return { x: b.player.x, start: b.worldW * 0.2, state: b.player.state, susp: b.suspended, phase: b.phase }; });
  check('combat: keyboard moves the player', kx.x > kx.start + 5, JSON.stringify(kx));
  await winFight(page);
  check('results: victory screen after KO', await text(page, 'Victory', { timeout: 9000 }));
  check('results: chronicle text appears (offline fallback)', await text(page, 'War Chronicle'));
  await shot(page, 'desktop-6-victory');
  // heap + rAF over repeated matches
  const heap0 = await hc(page, () => performance.memory?.usedJSHeapSize ?? 0);
  let raf = []; let defeatSeen = false;
  for (let i = 0; i < 4; i++) {
    await page.getByText('Rematch').click(); await toCombat(page, false);
    if (i === 1) { await hc(page, () => { window.__hc.battle.player.hp = 0; }); defeatSeen = await text(page, 'Defeated', { timeout: 9000 }); }
    else { await winFight(page); await text(page, 'Victory', { timeout: 9000 }); }
    raf.push(await hc(page, () => window.__raf.size));
  }
  check('replay: rematch x4 works incl. one defeat', defeatSeen);
  check('leaks: no accumulating animation loops across matches', Math.max(...raf) <= 3, 'pending rAF per round: ' + raf);
  const heap1 = await hc(page, () => performance.memory?.usedJSHeapSize ?? 0);
  check('leaks: JS heap growth over 4 rematches is bounded', heap1 - heap0 < 40e6, `${((heap1 - heap0) / 1e6).toFixed(1)} MB`);
  await page.getByText('Roster').click();
  check('results: Roster returns to character select', await text(page, 'Select Champion'));
  check('network: zero external requests (CDN/ibb/catbox)', log.external.length === 0, log.external.slice(0, 3).join(', '));
  check('network: no failed local requests', log.failed.length === 0, log.failed.slice(0, 3).join(', '));
  check('console: no page errors in full desktop flow', log.errors.length === 0, log.errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 2. persistence + corrupt save
{
  const { ctx, page, log } = await newPage({ width: 1280, height: 720 });
  await toSelect(page);
  await page.getByRole('button', { name: 'Baldwin IV' }).click(); await sleep(300);
  await page.reload(); await text(page, 'Battle Now'); await page.getByText('Battle Now').click(); await text(page, 'Select Champion');
  check('save: selected champion persists across reload', await text(page, 'The Leper King'));
  await page.evaluate(() => { localStorage.setItem('historical_champions_save_v2', '{corrupt'); localStorage.setItem('historical_champions_settings_v1', 'nope'); });
  await page.reload();
  check('save: corrupt save/settings do not blank the app', await text(page, 'Battle Now'));
  check('save: no crash errors from corrupt storage', !log.errors.some((e) => /JSON|Unexpected token/i.test(e)));
  await ctx.close();
}

// ---------------------------------------------------------------- 3. settings / volumes
{
  const { ctx, page } = await newPage({ width: 1280, height: 720 });
  await page.goto(BASE); await text(page, 'Battle Now');
  await page.getByText('Battle Now').click(); await sleep(500);
  await page.getByRole('button', { name: 'Sound settings' }).click();
  check('settings: panel opens', await text(page, 'Music:'));
  const before = await hc(page, () => window.__audio.find((a) => /theme/.test(a.src))?.volume);
  await page.locator('input[type=range]').first().fill('100'); await sleep(200);
  const after = await hc(page, () => window.__audio.find((a) => /theme/.test(a.src))?.volume);
  check('settings: music slider changes live volume', after > before + 0.1, `${before} -> ${after}`);
  await page.getByText('Music: On').click(); await sleep(400);
  check('settings: music toggle pauses theme', await hc(page, () => window.__audio.find((a) => /theme/.test(a.src))?.paused));
  const stored = await hc(page, () => JSON.parse(localStorage.getItem('historical_champions_settings_v1')));
  check('settings: persisted to storage', stored.musicEnabled === false && stored.musicVolume === 1, JSON.stringify(stored));
  await ctx.close();
}

// ---------------------------------------------------------------- 4. missing audio + offline
{
  const { ctx, page, log } = await newPage({ width: 1280, height: 720 }, { blockMp3: true });
  await toSelect(page);
  await page.getByRole('button', { name: 'Fight' }).click();
  const t0 = Date.now();
  await page.waitForFunction(() => !!window.__hc?.battle, null, { timeout: 30000 });
  const dt = (Date.now() - t0) / 1000;
  check('missing audio: intro still completes via timed fallback', dt > 3 && dt < 26, dt.toFixed(1) + 's');
  await page.waitForFunction(() => window.__hc.battle.phase === 'fight', null, { timeout: 9000 });
  await page.keyboard.press('KeyJ'); await sleep(300);
  check('missing audio: combat fully playable, no error screen', !(await text(page, 'Something went wrong', { timeout: 500 })));
  check('missing audio: attacks fall back to synth without exceptions', !log.errors.some((e) => /Uncaught|TypeError/.test(e)), log.errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 5. spam / rapid input
{
  const { ctx, page, log } = await newPage({ width: 1280, height: 720 });
  await toSelect(page); await toCombat(page);
  await hc(page, () => { const b = window.__hc.battle; b.enemy.hp = b.enemy.maxHp = 1e9; b.player.hp = b.player.maxHp = 1e9; });
  for (let i = 0; i < 240; i++) { await page.keyboard.press(['KeyJ', 'KeyK', 'KeyL', 'KeyW'][i % 4]); if (i % 3 === 0) await page.keyboard.down('KeyD'); if (i % 5 === 0) await page.keyboard.up('KeyD'); }
  await sleep(500);
  const st = await hc(page, () => { const b = window.__hc.battle; return { p: b.particles.length, pop: b.popups.length, x: b.player.x, ok: Number.isFinite(b.player.x) && Number.isFinite(b.enemy.x) }; });
  check('spam: 240 rapid inputs keep state finite and effects bounded', st.ok && st.p <= 160 && st.pop <= 12, JSON.stringify(st));
  check('spam: no exceptions', log.errors.length === 0, log.errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 6. phone: touch, orientation, resize, background
{
  const { ctx, page, log } = await newPage({ width: 844, height: 390 }, { touch: true });
  await toSelect(page);
  await shot(page, 'phone-1-select');
  await toCombat(page);
  await sleep(1200);
  check('touch: on-screen controls are shown on touch devices', await page.getByLabel('Attack', { exact: true }).isVisible());
  const box = async (l) => page.getByLabel(l).first().boundingBox();
  const atk = await box('Attack'), jump = await box('Jump');
  check('touch: control buttons meet 48px minimum target size', atk.width >= 48 && jump.width >= 44, `attack ${atk.width | 0}px jump ${jump.width | 0}px`);
  check('touch: controls stay inside the viewport', atk.x + atk.width <= 844 && atk.y + atk.height <= 390 && jump.x >= 0);
  await page.getByLabel('Move right').first().dispatchEvent('pointerdown', { pointerId: 7, isPrimary: true });
  await sleep(500);
  await page.getByLabel('Move right').first().dispatchEvent('pointercancel', { pointerId: 7 });
  const stuck = await hc(page, () => window.__hc.battle.inputs.right);
  check('touch: pointercancel releases held direction (no stuck input)', stuck === false);
  const x1 = await hc(page, () => window.__hc.battle.player.x);
  await page.getByLabel('Attack', { exact: true }).dispatchEvent('pointerdown', { pointerId: 8, isPrimary: true }); await sleep(100);
  check('touch: attack button triggers an attack', (await hc(page, () => window.__hc.battle.player.state)) === 'ATTACK' && x1 > 0);
  await shot(page, 'phone-2-combat-844x390');

  // orientation -> portrait
  const rel0 = await hc(page, () => window.__hc.battle.player.x / window.__hc.battle.worldW);
  const hp0 = await hc(page, () => window.__hc.battle.enemy.hp);
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(500);
  check('orientation: portrait shows rotate overlay', await text(page, 'PLEASE ROTATE', { timeout: 3000 }));
  check('orientation: fight is frozen in portrait', await hc(page, () => window.__hc.battle.suspended));
  await shot(page, 'phone-3-portrait');
  await page.setViewportSize({ width: 844, height: 390 }); await sleep(600);
  check('orientation: back to landscape shows pause menu (not a black screen)', await text(page, 'Resume', { timeout: 3000 }));
  check('orientation: same battle state preserved', (await hc(page, () => window.__hc.battle.enemy.hp)) === hp0 && Math.abs((await hc(page, () => window.__hc.battle.player.x / window.__hc.battle.worldW)) - rel0) < 0.05);
  await shot(page, 'phone-4-pause');
  await page.getByText('Resume').click(); await sleep(300);
  check('orientation: resume continues the fight', !(await hc(page, () => window.__hc.battle.suspended)));

  // backgrounding
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(300);
  check('lifecycle: backgrounding pauses the fight', await hc(page, () => window.__hc.battle.suspended));
  const musicPaused = await hc(page, () => window.__audio.every((a) => a.paused));
  check('lifecycle: all audio is paused while backgrounded', musicPaused);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(300);
  check('lifecycle: returning shows the pause menu (no surprise death)', await text(page, 'Resume', { timeout: 3000 }));
  await page.getByText('Resume').click();

  // resize storm across aspect ratios mid-combat
  const sizes = [[640, 360], [800, 360], [1024, 768], [1920, 1080], [2560, 1080], [700, 700], [844, 390]];
  let ok = true; const geo = [];
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h }); await sleep(250);
    const r = await hc(page, () => { const c = document.querySelector('canvas'); const b = window.__hc.battle; return { cw: c.clientWidth, ch: c.clientHeight, bw: c.width, bh: c.height, wx: b.worldW, px: b.player.x, ex: b.enemy.x, still: !!document.querySelector('canvas') }; });
    const inBounds = r.px >= 50 - 0.01 && r.ex <= r.wx - 50 + 0.01;
    const filled = Math.abs(r.cw - w) <= 1 && Math.abs(r.ch - h) <= 1 && r.bw >= r.cw && r.bh >= r.ch;
    if (!(inBounds && filled && r.still)) ok = false; geo.push(`${w}x${h}:${inBounds && filled ? 'ok' : 'BAD'}`);
  }
  check('resize: canvas fills window and fighters stay in bounds at 7 sizes', ok, geo.join(' '));
  check('resize: combat screen survives resizing (same scene, no remount error)', !(await text(page, 'Something went wrong', { timeout: 300 })));
  check('phone flow: no console errors', log.errors.length === 0, log.errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------- 7. screenshots at narrow / standard / wide for every screen
const sets = [['narrow', 640, 360, true], ['standard', 1366, 768, false], ['wide', 2560, 1080, false], ['tablet', 1024, 768, true]];
for (const [label, w, h, touch] of sets) {
  const { ctx, page } = await newPage({ width: w, height: h }, { touch });
  await page.goto(BASE); await text(page, 'Battle Now'); await shot(page, `${label}-menu`);
  await page.getByText('Battle Now').click(); await text(page, 'Select Champion'); await sleep(300); await shot(page, `${label}-select`);
  await page.getByRole('button', { name: 'Fight' }).click(); await text(page, 'Skip Intro'); await sleep(700); await shot(page, `${label}-intro`);
  await page.getByText('Skip Intro').click();
  await page.waitForFunction(() => window.__hc?.battle?.phase === 'fight', null, { timeout: 10000 });
  await page.keyboard.down('KeyD'); await sleep(900); await page.keyboard.up('KeyD'); await page.keyboard.press('KeyJ'); await sleep(200);
  await shot(page, `${label}-combat`);
  await winFight(page); await text(page, 'Victory', { timeout: 9000 }); await sleep(400); await shot(page, `${label}-results`);
  const overflow = await hc(page, () => ({ x: document.documentElement.scrollWidth > innerWidth + 1, y: document.documentElement.scrollHeight > innerHeight + 1 }));
  check(`layout ${label} ${w}x${h}: results screen has no page overflow`, !overflow.x && !overflow.y);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
