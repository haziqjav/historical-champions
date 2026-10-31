import { WORLD_H } from './engine';

/** The fight happens in a logical world that is WORLD_H tall and between these widths. */
export const MIN_WORLD_W = 1100; // ~11:8 - tablets in landscape / small windows
export const MAX_WORLD_W = 1800; // ~9:4  - ultra-wide phones; beyond this the stage is pillar-boxed

export interface Layout {
  cssW: number; cssH: number;  // canvas size in CSS pixels
  worldW: number;              // logical world width
  scale: number;               // world unit -> CSS px (uniform: sprites are never stretched)
  offX: number; offY: number;  // CSS-px offset of the world origin inside the canvas
}

/**
 * Uniform "contain" fit of the logical world into the canvas. The world width adapts to the
 * aspect ratio within [MIN_WORLD_W, MAX_WORLD_W]; outside that range the stage is centred and
 * the arena background (drawn "cover" over the whole canvas) extends past it. Characters are
 * therefore never stretched or squashed, whatever the screen shape.
 */
export function computeLayout(cssW: number, cssH: number): Layout {
  const w = Math.max(1, cssW), h = Math.max(1, cssH);
  const worldW = Math.min(MAX_WORLD_W, Math.max(MIN_WORLD_W, WORLD_H * (w / h)));
  const scale = Math.min(w / worldW, h / WORLD_H);
  return { cssW: w, cssH: h, worldW, scale, offX: (w - worldW * scale) / 2, offY: (h - WORLD_H * scale) / 2 };
}
