// ---------------------------------------------------------------------------------------
// Combat simulation for Historical Champions.
//
// This is the original CombatScene gameplay logic, extracted into a pure module (no DOM,
// no React, no audio) so that it can be unit-tested and so that gameplay no longer depends
// on the display's refresh rate. All timers are counted in simulation TICKS and the world
// advances at exactly TICK_RATE ticks per second via FixedStepper.
//
// Constants, AI behaviour, damage formula and hit frames are unchanged from the original.
// What changed: (1) fixed timestep, (2) combo counter bug fixed (the original read a stale
// React closure so the combo never exceeded 1), (3) battle duration excludes paused time,
// (4) results/countdown are driven by ticks instead of setInterval/setTimeout.
// ---------------------------------------------------------------------------------------
import { BattleStats, CharacterId } from '../types';
import { CHARACTERS } from '../constants';

// --- PHYSICS CONSTANTS (unchanged; tuned per-tick at 60 ticks/second) ---
export const TICK_RATE = 60;
export const TICK_DT = 1 / TICK_RATE;
export const GRAVITY = 2.8;
export const FRICTION = 0.82;
export const MOVE_SPEED = 2.2;
export const JUMP_FORCE = -45;
export const GROUND_OFFSET = 120;
export const LUNGE_FORCE = 15;

/** Logical world height. World width varies with the screen aspect ratio (see layout.ts). */
export const WORLD_H = 800;
export const WALL_MARGIN = 50;
export const SPRITE_H = 400;

export const COUNTDOWN_STEP_TICKS = 60; // 3 .. 2 .. 1 .. FIGHT!  (1 s each, as before)
export const COUNTDOWN_TOTAL_TICKS = COUNTDOWN_STEP_TICKS * 4;
export const KO_DELAY_TICKS = 180; // 3 s on the result banner before the result screen

export type FighterState = 'IDLE' | 'WALK' | 'JUMP' | 'ATTACK' | 'BLOCK' | 'HIT' | 'SPECIAL';
export type Phase = 'countdown' | 'fight' | 'ko' | 'done';
export type InputAction = 'left' | 'right' | 'jump' | 'block';

export interface Fighter {
  x: number; y: number; vx: number; vy: number;
  hp: number; maxHp: number; power: number;
  state: FighterState;
  dir: 1 | -1;
  timer: number;
  scale: number;
  id: CharacterId;
  isEnemy: boolean;
  aiCooldown: number;
}

export interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
export interface Popup { x: number; y: number; text: string; life: number; color: string; big: boolean; }

export interface HudSnapshot {
  playerHp: number; playerMaxHp: number; playerPower: number;
  enemyHp: number; enemyMaxHp: number; combo: number;
}

export type CountdownValue = 3 | 2 | 1 | 'FIGHT' | null;

export interface BattleEvents {
  onHud?: (s: HudSnapshot) => void;
  onCountdown?: (v: CountdownValue) => void;
  onAttack?: (attacker: Fighter) => void;
  onSpecial?: (attacker: Fighter) => void;
  onHit?: (attacker: Fighter, defender: Fighter, special: boolean) => void;
  onBlock?: (attacker: Fighter, defender: Fighter) => void;
  onKO?: (victory: boolean) => void;
  onEnd?: (victory: boolean, stats: BattleStats) => void;
}

/** Runs the simulation at a fixed rate regardless of how often the screen refreshes. */
export class FixedStepper {
  private acc = 0;
  /** Cap on catch-up so a long stall (tab switch, GC) cannot cause a burst of simulation. */
  constructor(private readonly maxCatchUpSeconds = 0.1) {}
  /** Returns how many whole ticks to simulate for this frame's elapsed time. */
  consume(dtSeconds: number): number {
    if (!(dtSeconds > 0)) return 0;
    this.acc += Math.min(dtSeconds, this.maxCatchUpSeconds);
    let n = 0;
    while (this.acc >= TICK_DT - 1e-9) { this.acc -= TICK_DT; n++; }
    return n;
  }
  reset() { this.acc = 0; }
}

const makeFighter = (id: CharacterId, isEnemy: boolean): Fighter => {
  const data = CHARACTERS[id];
  return {
    x: 0, y: 0, vx: 0, vy: 0,
    hp: data.baseStats.health, maxHp: data.baseStats.health, power: 0,
    state: 'IDLE', dir: isEnemy ? -1 : 1, timer: 0,
    scale: data.scale ?? 1.0, id, isEnemy, aiCooldown: 0,
  };
};

export class Battle {
  readonly player: Fighter;
  readonly enemy: Fighter;
  readonly inputs: Record<InputAction, boolean> = { left: false, right: false, jump: false, block: false };
  particles: Particle[] = [];
  popups: Popup[] = [];

  phase: Phase = 'countdown';
  /** External pause (pause menu, app backgrounded, wrong orientation). Simulation is frozen while true. */
  suspended = false;
  shake = 0;
  hitStop = 0;
  combo = 0;
  maxCombo = 0;
  worldW = 1422;

  private tick = 0;       // ticks within the current phase
  private fightTicks = 0; // ticks spent in the fight phase (battle duration, pause-safe)
  private lastCountdown: CountdownValue | undefined = undefined;
  private result: { victory: boolean; stats: BattleStats } | null = null;

  constructor(
    playerId: CharacterId,
    enemyId: CharacterId,
    private readonly events: BattleEvents = {},
    private readonly rng: () => number = Math.random,
  ) {
    this.player = makeFighter(playerId, false);
    this.enemy = makeFighter(enemyId, true);
    this.layout(this.worldW, true);
  }

  get groundY() { return WORLD_H - GROUND_OFFSET; }

  /** Set world width. First call positions fighters; later calls keep them at the same relative spot. */
  layout(worldW: number, initial = false) {
    const prev = this.worldW;
    this.worldW = worldW;
    const gy = this.groundY;
    if (initial) {
      this.player.x = worldW * 0.2; this.enemy.x = worldW * 0.8;
      this.player.y = gy; this.enemy.y = gy;
    } else if (prev > 0 && prev !== worldW) {
      const k = worldW / prev;
      this.player.x *= k; this.enemy.x *= k;
      for (const p of this.particles) p.x *= k;
    }
    for (const f of [this.player, this.enemy]) {
      f.x = Math.min(Math.max(f.x, WALL_MARGIN), worldW - WALL_MARGIN);
      if (f.y > gy) f.y = gy;
    }
  }

  setInput(action: InputAction, active: boolean) { this.inputs[action] = active; }
  releaseAllInputs() { this.inputs.left = this.inputs.right = this.inputs.jump = this.inputs.block = false; }

  get isFighting() { return this.phase === 'fight' && !this.suspended; }

  attack() {
    if (!this.isFighting) return;
    const p = this.player;
    if (p.state !== 'ATTACK' && p.state !== 'HIT' && p.state !== 'BLOCK' && p.state !== 'SPECIAL') {
      p.state = 'ATTACK';
      p.timer = 12;
      const dist = Math.abs(p.x - this.enemy.x);
      p.vx = p.dir * (dist < 140 ? 2 : LUNGE_FORCE);
      this.events.onAttack?.(p);
    }
  }

  special() {
    if (!this.isFighting) return;
    const p = this.player;
    if (p.power >= 100 && p.state !== 'ATTACK' && p.state !== 'HIT' && p.state !== 'BLOCK') {
      p.state = 'SPECIAL';
      p.timer = 40;
      p.power = 0;
      p.vx = p.dir * 45;
      this.shake = 20;
      this.events.onSpecial?.(p);
      this.emitHud();
    }
  }

  snapshot(): HudSnapshot {
    return {
      playerHp: this.player.hp, playerMaxHp: this.player.maxHp, playerPower: this.player.power,
      enemyHp: this.enemy.hp, enemyMaxHp: this.enemy.maxHp, combo: this.combo,
    };
  }
  private emitHud() { this.events.onHud?.(this.snapshot()); }

  /** Advance exactly one simulation tick. */
  step() {
    if (this.suspended || this.phase === 'done') return;

    // Visual-only systems keep animating in every phase (particles, popups, shake decay).
    this.updateFx();

    if (this.phase === 'countdown') {
      const step = Math.floor(this.tick / COUNTDOWN_STEP_TICKS);
      const value: CountdownValue = step === 0 ? 3 : step === 1 ? 2 : step === 2 ? 1 : 'FIGHT';
      if (value !== this.lastCountdown) { this.lastCountdown = value; this.events.onCountdown?.(value); }
      this.tick++;
      if (this.tick >= COUNTDOWN_TOTAL_TICKS) {
        this.phase = 'fight'; this.tick = 0;
        this.lastCountdown = null; this.events.onCountdown?.(null);
        this.emitHud();
      }
      return;
    }

    if (this.phase === 'ko') {
      this.tick++;
      if (this.tick >= KO_DELAY_TICKS && this.result) {
        this.phase = 'done';
        this.events.onEnd?.(this.result.victory, this.result.stats);
      }
      return;
    }

    // ---- FIGHT ----
    if (this.hitStop > 0) { this.hitStop--; return; }
    this.fightTicks++;
    const { player: p1, enemy: p2 } = this;
    const groundY = this.groundY;
    const width = this.worldW;

    // PLAYER INPUT -> STATE
    if (p1.state !== 'HIT' && p1.state !== 'ATTACK' && p1.state !== 'SPECIAL') {
      if (this.inputs.block) {
        p1.state = 'BLOCK';
        p1.vx *= 0.8;
      } else {
        if (p1.state === 'BLOCK') p1.state = 'IDLE';
        if (this.inputs.left) { p1.vx -= MOVE_SPEED; p1.dir = -1; p1.state = 'WALK'; }
        else if (this.inputs.right) { p1.vx += MOVE_SPEED; p1.dir = 1; p1.state = 'WALK'; }
        else if (p1.state === 'WALK') p1.state = 'IDLE';
        if (this.inputs.jump && p1.y >= groundY) { p1.vy = JUMP_FORCE; p1.state = 'JUMP'; }
      }
    }

    // ENEMY AI (unchanged)
    const dist = Math.abs(p1.x - p2.x);
    const isBerserk = p2.hp < p2.maxHp * 0.3;
    if (p2.state !== 'HIT' && p2.state !== 'ATTACK' && p2.state !== 'SPECIAL' && p2.state !== 'BLOCK') {
      if (p2.aiCooldown > 0) p2.aiCooldown--;
      if (p2.aiCooldown <= 0) {
        if (p2.power >= 100 && (dist < 500 || isBerserk)) {
          p2.state = 'SPECIAL'; p2.timer = 40; p2.power = 0; p2.vx = p2.dir * 45;
          this.shake = 20;
          this.events.onSpecial?.(p2);
        } else if (dist < 320) {
          const roll = this.rng();
          if (p1.state === 'ATTACK') {
            if (isBerserk && roll < 0.4) {
              p2.state = 'ATTACK'; p2.timer = 12; p2.vx = p2.dir * (dist < 140 ? 2 : LUNGE_FORCE);
              this.events.onAttack?.(p2);
            } else if (roll < 0.95) {
              p2.state = 'BLOCK'; p2.timer = 20; p2.aiCooldown = 1;
            }
          } else {
            p2.state = 'ATTACK'; p2.timer = 12; p2.vx = p2.dir * (dist < 140 ? 2 : LUNGE_FORCE);
            this.events.onAttack?.(p2);
            p2.aiCooldown = isBerserk ? 2 : 5 + this.rng() * 8;
          }
        } else {
          const chase = MOVE_SPEED * (isBerserk ? 1.8 : 1.5);
          if (p1.x > p2.x) { p2.vx += chase; p2.dir = 1; } else { p2.vx -= chase; p2.dir = -1; }
          p2.state = 'WALK';
          p2.aiCooldown = 2;
        }
      }
      if (p2.state !== 'ATTACK' && p2.state !== 'SPECIAL') p2.dir = p1.x > p2.x ? 1 : -1;
    } else if (p2.state === 'BLOCK') {
      p2.timer--;
      if (p2.timer <= 0) p2.state = 'IDLE';
      p2.vx *= 0.5;
    }

    // PHYSICS & BOUNDS
    for (const c of [p1, p2]) {
      c.vy += GRAVITY;
      c.vx *= FRICTION;
      c.x += c.vx;
      c.y += c.vy;
      if (c.y > groundY) { c.y = groundY; c.vy = 0; if (c.state === 'JUMP') c.state = 'IDLE'; }
      if (c.x < WALL_MARGIN) { c.x = WALL_MARGIN; c.vx = 0; }
      if (c.x > width - WALL_MARGIN) { c.x = width - WALL_MARGIN; c.vx = 0; }
    }

    // BODY COLLISION
    const dx = p1.x - p2.x;
    const bodyW = 140;
    if (Math.abs(p1.y - p2.y) < 100 && Math.abs(dx) < bodyW) {
      const center = (p1.x + p2.x) / 2;
      const push = bodyW / 2;
      if (p1.x < p2.x) { p1.x = center - push; p2.x = center + push; if (p1.vx > 0) p1.vx = 0; if (p2.vx < 0) p2.vx = 0; }
      else { p1.x = center + push; p2.x = center - push; if (p1.vx < 0) p1.vx = 0; if (p2.vx > 0) p2.vx = 0; }
      // The separation push can shove a fighter past the wall; keep both inside the arena (original let them leave it).
      for (const c of [p1, p2]) c.x = Math.min(Math.max(c.x, WALL_MARGIN), width - WALL_MARGIN);
    }

    // HIT DETECTION
    const fighters: [Fighter, Fighter][] = [[p1, p2], [p2, p1]];
    for (const [attacker, defender] of fighters) {
      if (attacker.state === 'ATTACK' || attacker.state === 'SPECIAL') {
        attacker.timer--;
        if (attacker.timer === 0) attacker.state = 'IDLE';
        const impactFrame = attacker.state === 'SPECIAL' ? 20 : 8;
        if (attacker.timer === impactFrame) this.resolveStrike(attacker, defender);
      } else if (attacker.state === 'HIT') {
        attacker.timer--;
        if (attacker.timer <= 0) {
          attacker.state = 'IDLE';
          if (attacker.isEnemy) attacker.aiCooldown = this.rng() < 0.5 ? 0 : 5;
        }
      }
    }

    // KO
    if (p1.hp <= 0 || p2.hp <= 0) {
      const victory = p2.hp <= 0;
      this.releaseAllInputs();
      this.phase = 'ko'; this.tick = 0;
      this.result = {
        victory,
        stats: {
          winnerId: victory ? p1.id : p2.id,
          loserId: victory ? p2.id : p1.id,
          remainingHpPercentage: Math.floor(((victory ? p1.hp : p2.hp) / (victory ? p1.maxHp : p2.maxHp)) * 100),
          maxCombo: this.maxCombo,
          durationSeconds: Math.floor(this.fightTicks / TICK_RATE),
        },
      };
      this.events.onKO?.(victory);
    }
  }

  private resolveStrike(attacker: Fighter, defender: Fighter) {
    const range = Math.abs(attacker.x - defender.x);
    if (!(range < 330 && Math.abs(attacker.y - defender.y) < 150)) return;
    const facing = (attacker.dir === 1 && defender.x > attacker.x) || (attacker.dir === -1 && defender.x < attacker.x);
    if (!facing) return;
    const special = attacker.state === 'SPECIAL';
    const attackerIsPlayer = !attacker.isEnemy;

    if (defender.state === 'BLOCK' && !special) {
      defender.vx = attacker.dir * 12;
      this.hitStop = 4;
      this.spawnParticles((attacker.x + defender.x) / 2, defender.y - 50, true);
      this.addPopup(defender.x, defender.y - 260, 'BLOCKED', '#93c5fd', false);
      if (attackerIsPlayer) this.combo = 0;
      this.events.onBlock?.(attacker, defender);
      this.emitHud();
      return;
    }

    let mult = special ? 2.5 : 1.0;
    if (attacker.isEnemy) mult *= 1.2;
    const dmg = CHARACTERS[attacker.id].baseStats.attack * mult;
    defender.hp = Math.max(0, defender.hp - dmg);
    defender.state = 'HIT';
    defender.timer = 20;
    defender.vx = attacker.dir * (special ? 45 : 25);
    this.shake = special ? 35 : 15;
    this.hitStop = defender.hp <= 0 ? 15 : special ? 10 : 5;
    if (defender.hp <= 0) this.shake = 30;
    this.spawnParticles(defender.x, defender.y - 80, false);
    this.addPopup(defender.x, defender.y - 300, String(Math.round(dmg)), special ? '#facc15' : '#fecaca', special);
    attacker.power = Math.min(100, attacker.power + (special ? 0 : 20));
    defender.power = Math.min(100, defender.power + 10);

    if (attackerIsPlayer) {
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    } else {
      this.combo = 0;
    }
    this.events.onHit?.(attacker, defender, special);
    this.emitHud();
  }

  private spawnParticles(x: number, y: number, isBlock: boolean) {
    const count = isBlock ? 8 : 15;
    for (let i = 0; i < count; i++) {
      let color = isBlock ? '#60a5fa' : '#ef4444';
      if (isBlock && this.rng() > 0.4) color = '#fef08a';
      this.particles.push({
        x: x + (this.rng() - 0.5) * 40,
        y: y - 100 + (this.rng() - 0.5) * 40,
        vx: (this.rng() - 0.5) * (isBlock ? 35 : 20),
        vy: (this.rng() - 0.5) * (isBlock ? 35 : 20),
        life: 1.0,
        color,
        size: this.rng() * (isBlock ? 3 : 6) + 2,
      });
    }
    // Hard cap keeps a button-masher from growing the array on slow phones.
    if (this.particles.length > 160) this.particles.splice(0, this.particles.length - 160);
  }

  private addPopup(x: number, y: number, text: string, color: string, big: boolean) {
    this.popups.push({ x, y, text, life: 1, color, big });
    if (this.popups.length > 12) this.popups.shift();
  }

  private updateFx() {
    if (this.shake > 0) { this.shake *= 0.9; if (this.shake < 0.5) this.shake = 0; }
    const ps = this.particles;
    let w = 0;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.05;
      if (p.life > 0) ps[w++] = p;
    }
    ps.length = w;
    const pp = this.popups;
    let w2 = 0;
    for (let i = 0; i < pp.length; i++) {
      const q = pp[i];
      q.y -= 1.4; q.life -= 0.018;
      if (q.life > 0) pp[w2++] = q;
    }
    pp.length = w2;
  }
}
