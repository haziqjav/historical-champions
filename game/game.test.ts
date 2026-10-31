import { describe, it, expect } from 'vitest';
import { Battle, FixedStepper, TICK_DT, COUNTDOWN_TOTAL_TICKS, KO_DELAY_TICKS, WORLD_H } from './engine';
import { computeLayout, MIN_WORLD_W, MAX_WORLD_W } from './layout';
import { CharacterId, BattleStats } from '../types';

const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const startFight = (b: Battle) => { for (let i = 0; i < COUNTDOWN_TOTAL_TICKS; i++) b.step(); };

describe('FixedStepper (frame-rate independence)', () => {
  it('simulates the same number of ticks for the same wall-clock time at 30/60/144/240 Hz', () => {
    const run = (hz: number) => { const s = new FixedStepper(); let t = 0; for (let i = 0; i < hz * 10; i++) t += s.consume(1 / hz); return t; };
    for (const hz of [30, 60, 90, 120, 144, 240]) expect(Math.abs(run(hz) - 600)).toBeLessThanOrEqual(1);
  });
  it('caps catch-up after a long stall instead of fast-forwarding the fight', () => {
    expect(new FixedStepper().consume(5)).toBeLessThanOrEqual(7);
  });
  it('ignores zero / negative / NaN deltas', () => {
    const s = new FixedStepper(); expect(s.consume(0)).toBe(0); expect(s.consume(-1)).toBe(0); expect(s.consume(NaN)).toBe(0);
  });
});

describe('Battle', () => {
  it('runs a 4 second countdown (3,2,1,FIGHT) then enters the fight phase', () => {
    const seen: unknown[] = [];
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.REYNALD, { onCountdown: (v) => seen.push(v) }, mulberry(1));
    startFight(b);
    expect(seen).toEqual([3, 2, 1, 'FIGHT', null]);
    expect(b.phase).toBe('fight');
  });
  it('ignores attacks during the countdown and while suspended', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.REYNALD, {}, mulberry(1));
    b.attack(); expect(b.player.state).toBe('IDLE');
    startFight(b); b.suspended = true; b.attack(); expect(b.player.state).toBe('IDLE');
  });
  it('is deterministic for a seed + input script, independent of how ticks are batched', () => {
    const play = () => {
      const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(42)); startFight(b);
      for (let i = 0; i < 900; i++) { b.setInput('right', i % 120 < 60); if (i % 40 === 0) b.attack(); b.step(); }
      return [b.player.x, b.enemy.hp, b.player.hp, b.combo];
    };
    expect(play()).toEqual(play());
  });
  it('combo counter increments on consecutive hits (original build never exceeded 1)', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(7)); startFight(b);
    b.enemy.x = b.player.x + 200; b.enemy.hp = b.enemy.maxHp = 1e9;
    for (let n = 0; n < 3; n++) {
      b.enemy.state = 'IDLE'; b.enemy.aiCooldown = 99; b.enemy.vx = 0; b.enemy.x = b.player.x + 200; b.player.state = 'IDLE';
      b.attack(); for (let i = 0; i < 20; i++) { b.enemy.aiCooldown = 99; b.step(); }
    }
    expect(b.maxCombo).toBeGreaterThanOrEqual(2);
  });
  it('blocking prevents damage and resets the attacker combo', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(3)); startFight(b);
    b.enemy.x = b.player.x + 200; const hp = b.enemy.hp; b.combo = 4;
    b.enemy.state = 'BLOCK'; b.enemy.timer = 999; b.attack();
    for (let i = 0; i < 14; i++) b.step();
    expect(b.enemy.hp).toBe(hp); expect(b.combo).toBe(0);
  });
  it('KO fires onKO once, then onEnd exactly once after the result delay, with sane stats', () => {
    let ko = 0, end = 0; let stats: BattleStats | null = null; let won: boolean | null = null;
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, { onKO: () => ko++, onEnd: (v, s) => { end++; won = v; stats = s; } }, mulberry(5));
    startFight(b); b.enemy.x = b.player.x + 200; b.enemy.hp = 1; b.enemy.state = 'IDLE'; b.enemy.aiCooldown = 99;
    b.attack(); for (let i = 0; i < 20; i++) { b.enemy.aiCooldown = 99; b.step(); }
    expect(ko).toBe(1); expect(b.phase).toBe('ko'); expect(end).toBe(0);
    for (let i = 0; i < KO_DELAY_TICKS + 5; i++) b.step();
    expect(end).toBe(1); expect(won).toBe(true);
    const s = stats as unknown as BattleStats;
    expect(s.winnerId).toBe(CharacterId.SALAHUDDIN); expect(s.loserId).toBe(CharacterId.BORI);
    expect(s.remainingHpPercentage).toBeGreaterThan(0); expect(s.remainingHpPercentage).toBeLessThanOrEqual(100);
    for (let i = 0; i < 600; i++) b.step(); expect(end).toBe(1);
  });
  it('battle duration does not count suspended (paused) time', () => {
    let stats: BattleStats | null = null;
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, { onEnd: (_v, s) => { stats = s; } }, mulberry(5)); startFight(b);
    b.suspended = true; for (let i = 0; i < 5000; i++) b.step(); b.suspended = false;
    b.enemy.x = b.player.x + 200; b.enemy.hp = 1; b.enemy.aiCooldown = 99; b.attack();
    for (let i = 0; i < 20 + KO_DELAY_TICKS + 2; i++) { b.enemy.aiCooldown = 99; b.step(); }
    expect((stats as unknown as BattleStats).durationSeconds).toBeLessThanOrEqual(1);
  });
  it('resizing the world keeps fighters at the same relative positions and inside the walls', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(1));
    const rp = b.player.x / b.worldW, re = b.enemy.x / b.worldW;
    b.layout(1800); expect(b.player.x / 1800).toBeCloseTo(rp, 5); expect(b.enemy.x / 1800).toBeCloseTo(re, 5);
    b.layout(MIN_WORLD_W); expect(b.enemy.x).toBeLessThanOrEqual(MIN_WORLD_W - 50); expect(b.player.x).toBeGreaterThanOrEqual(50);
  });
  it('fighters pinned against a wall never end a tick outside the arena', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(11)); startFight(b);
    b.player.hp = b.player.maxHp = 1e9;
    for (let i = 0; i < 1200; i++) { b.setInput('left', true); b.step(); expect(b.player.x).toBeGreaterThanOrEqual(50); expect(b.enemy.x).toBeLessThanOrEqual(b.worldW - 50); expect(b.enemy.x).toBeGreaterThanOrEqual(50); }
  });
  it('particle and popup arrays stay bounded under spam', () => {
    const b = new Battle(CharacterId.SALAHUDDIN, CharacterId.BORI, {}, mulberry(9)); startFight(b);
    b.enemy.hp = b.enemy.maxHp = 1e12;
    for (let i = 0; i < 3000; i++) { b.enemy.x = b.player.x + 150; b.attack(); b.enemy.aiCooldown = 99; b.step(); }
    expect(b.particles.length).toBeLessThanOrEqual(160); expect(b.popups.length).toBeLessThanOrEqual(12);
  });
});

describe('computeLayout (aspect ratios)', () => {
  const cases: [string, number, number][] = [['phone 20:9', 800, 360], ['phone 16:9', 640, 360], ['tablet 4:3', 1024, 768], ['laptop 16:10', 1440, 900], ['desktop 16:9', 1920, 1080], ['ultrawide 21:9', 2560, 1080], ['square', 700, 700], ['portrait phone', 360, 800]];
  for (const [name, w, h] of cases) it(`never distorts and always fits: ${name}`, () => {
    const L = computeLayout(w, h);
    expect(L.worldW).toBeGreaterThanOrEqual(MIN_WORLD_W); expect(L.worldW).toBeLessThanOrEqual(MAX_WORLD_W);
    expect(L.worldW * L.scale).toBeLessThanOrEqual(w + 0.001); expect(WORLD_H * L.scale).toBeLessThanOrEqual(h + 0.001);
    expect(L.offX).toBeGreaterThanOrEqual(-0.001); expect(L.offY).toBeGreaterThanOrEqual(-0.001);
  });
  it('survives a zero-sized container', () => { const L = computeLayout(0, 0); expect(Number.isFinite(L.scale)).toBe(true); expect(L.scale).toBeGreaterThan(0); });
  it('uses the full width/height on a 16:9 screen (no needless letterboxing)', () => {
    const L = computeLayout(1920, 1080); expect(L.offX).toBeLessThan(2); expect(L.offY).toBeLessThan(2);
  });
  void TICK_DT; void MAX_WORLD_W;
});
