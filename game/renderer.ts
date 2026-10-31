import { Battle, Fighter, SPRITE_H, WORLD_H } from './engine';
import { Layout } from './layout';

// ---------------------------------------------------------------------------------------
// Canvas renderer. Tinted sprite variants (hit flash / block / special glow / enemy aura) are
// baked ONCE into offscreen canvases instead of using ctx.filter + shadowBlur every frame,
// which is slow on mid-range phones and unsupported in some WebViews.
// ---------------------------------------------------------------------------------------

const GLOW_PAD = 36;

export class Sprite {
  readonly iw: number; readonly ih: number;
  private readonly pad: number;
  private base: HTMLCanvasElement;
  private cache: { hit?: HTMLCanvasElement; dark?: HTMLCanvasElement; gold?: HTMLCanvasElement } = {};

  constructor(img: HTMLImageElement, glow: string | null) {
    this.iw = img.naturalWidth || img.width || 1;
    this.ih = img.naturalHeight || img.height || 1;
    this.pad = glow ? GLOW_PAD : 0;
    this.base = document.createElement('canvas');
    this.base.width = this.iw + this.pad * 2;
    this.base.height = this.ih + this.pad * 2;
    const c = this.base.getContext('2d')!;
    if (glow) { c.shadowColor = glow; c.shadowBlur = 20; }
    c.drawImage(img, this.pad, this.pad, this.iw, this.ih);
  }

  private tint(color: string, alpha: number): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = this.base.width; cv.height = this.base.height;
    const c = cv.getContext('2d')!;
    c.drawImage(this.base, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fillRect(0, 0, cv.width, cv.height);
    return cv;
  }

  /** Create every variant up-front (called during loading so the first hit never hitches). */
  prewarm() { this.get('hit'); this.get('dark'); this.get('gold'); }

  get(kind: 'normal' | 'hit' | 'dark' | 'gold'): HTMLCanvasElement {
    if (kind === 'normal') return this.base;
    return (this.cache[kind] ??=
      kind === 'hit' ? this.tint('#ff6a3d', 0.72) :
      kind === 'dark' ? this.tint('#000000', 0.5) :
      this.tint('#ffd23f', 0.9));
  }

  /** Draw with feet at (0,0), height SPRITE_H, horizontally centred (+ lunge offset). */
  draw(ctx: CanvasRenderingContext2D, kind: 'normal' | 'hit' | 'dark' | 'gold', lunge: number) {
    const k = SPRITE_H / this.ih;
    const cv = this.get(kind);
    const w = this.iw * k;
    ctx.drawImage(cv, -w / 2 + lunge - this.pad * k, -SPRITE_H - this.pad * k, cv.width * k, cv.height * k);
  }
}

export interface FighterSprites { idle: Sprite; atk: Sprite; }

export function buildFighterSprites(idle: HTMLImageElement, atk: HTMLImageElement, enemy: boolean): FighterSprites {
  const glow = enemy ? '#ef4444' : null;
  const s = { idle: new Sprite(idle, glow), atk: new Sprite(atk, glow) };
  s.idle.prewarm(); s.atk.prewarm();
  return s;
}

export interface RenderAssets {
  arena: HTMLImageElement | null;
  arenaParallax: number;
  player: FighterSprites | null;
  enemy: FighterSprites | null;
}

function drawBackground(ctx: CanvasRenderingContext2D, L: Layout, b: Battle, a: RenderAssets) {
  const img = a.arena;
  if (!img || !img.naturalWidth) { ctx.fillStyle = '#1b1b22'; ctx.fillRect(0, 0, L.cssW, L.cssH); return; }
  // "cover" fit (never stretched) with 12% bleed so the parallax shift has room.
  const s = Math.max(L.cssW / img.naturalWidth, L.cssH / img.naturalHeight) * 1.12;
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  const room = (dw - L.cssW) / 2;
  const focus = (b.player.x / b.worldW - 0.5) * 2; // -1..1
  const x = (L.cssW - dw) / 2 - focus * room * Math.min(1, a.arenaParallax * 1.6);
  ctx.drawImage(img, x, (L.cssH - dh) / 2, dw, dh);
  // Subtle vignette so the fighters read against any arena.
  const g = ctx.createLinearGradient(0, 0, 0, L.cssH);
  g.addColorStop(0, 'rgba(0,0,0,0.25)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, L.cssW, L.cssH);
}

function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter, spr: FighterSprites | null, groundY: number, now: number) {
  // Ground shadow shrinks while airborne.
  const air = Math.max(0, Math.min(1, (groundY - f.y) / 500));
  ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - air * 0.6)})`;
  ctx.beginPath(); ctx.ellipse(f.x, groundY, 60 * (1 - air * 0.4), 15 * (1 - air * 0.4), 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.dir * f.scale, f.scale);
  const attacking = f.state === 'ATTACK' || f.state === 'SPECIAL';
  if (spr) {
    const s = attacking ? spr.atk : spr.idle;
    const lunge = attacking ? 60 : 0;
    if (f.state === 'HIT') s.draw(ctx, 'hit', lunge);
    else if (f.state === 'BLOCK') s.draw(ctx, 'dark', lunge);
    else {
      s.draw(ctx, 'normal', lunge);
      if (f.state === 'SPECIAL') {
        const pulse = Math.abs(Math.sin(now / 150));
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.25 + pulse * 0.35;
        s.draw(ctx, 'gold', lunge);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
    }
  } else { // asset failed: visible placeholder rather than an invisible fighter
    ctx.fillStyle = f.isEnemy ? '#7f1d1d' : '#1e3a8a';
    ctx.fillRect(-50, -300, 100, 300);
  }
  if (f.state === 'BLOCK') {
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, -150, 80, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

export function renderBattle(ctx: CanvasRenderingContext2D, dpr: number, L: Layout, b: Battle, a: RenderAssets, now: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, L.cssW, L.cssH);
  drawBackground(ctx, L, b, a);

  // World space
  const sh = b.shake;
  const shx = sh > 0 ? (Math.random() - 0.5) * sh * L.scale : 0;
  const shy = sh > 0 ? (Math.random() - 0.5) * sh * L.scale : 0;
  ctx.setTransform(dpr * L.scale, 0, 0, dpr * L.scale, dpr * (L.offX + shx), dpr * (L.offY + shy));

  const groundY = b.groundY;
  drawFighter(ctx, b.player, a.player, groundY, now);
  drawFighter(ctx, b.enemy, a.enemy, groundY, now);

  for (const p of b.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating damage numbers
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (const q of b.popups) {
    ctx.globalAlpha = Math.min(1, q.life * 1.6);
    ctx.font = `900 ${q.big ? 64 : 44}px system-ui, sans-serif`;
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(q.text, q.x, q.y);
    ctx.fillStyle = q.color; ctx.fillText(q.text, q.x, q.y);
  }
  ctx.globalAlpha = 1;
  void WORLD_H;
}
