import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Keyboard } from 'lucide-react';
import { ArenaData, BattleStats, CharacterId } from '../../types';
import { CHARACTERS } from '../../constants';
import { soundManager } from '../../services/soundService';
import { loadImage } from '../../services/assets';
import { Battle, CountdownValue, FixedStepper, HudSnapshot, InputAction } from '../../game/engine';
import { computeLayout, Layout } from '../../game/layout';
import { buildFighterSprites, renderBattle, RenderAssets } from '../../game/renderer';
import { HealthBar } from './HealthBar';
import { TouchControls } from './TouchControls';
import { PauseOverlay } from './PauseOverlay';

interface Props {
  playerCharacterId: CharacterId;
  enemyCharacterId: CharacterId;
  arena: ArenaData;
  /** true while the app is backgrounded or the screen is in portrait: fight freezes and a pause menu waits. */
  forcePause: boolean;
  /** Incremented by the app on Android back / Escape: toggles the pause menu. */
  backSignal: number;
  showTouchControls: boolean;
  onBattleEnd: (victory: boolean, stats: BattleStats) => void;
  onQuit: () => void;
  onOpenSettings: () => void;
}

const MAX_DPR = 2; // 3x/4x phone screens would cost 2-4x the fill rate for no visible gain on this art

export const CombatScene: React.FC<Props> = ({ playerCharacterId, enemyCharacterId, arena, forcePause, backSignal, showTouchControls, onBattleEnd, onQuit, onOpenSettings }) => {
  const p = CHARACTERS[playerCharacterId], e = CHARACTERS[enemyCharacterId];
  const [hud, setHud] = useState<HudSnapshot>({ playerHp: p.baseStats.health, playerMaxHp: p.baseStats.health, playerPower: 0, enemyHp: e.baseStats.health, enemyMaxHp: e.baseStats.health, combo: 0 });
  const [countdown, setCountdown] = useState<CountdownValue>(3);
  const [result, setResult] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pauseTitle, setPauseTitle] = useState('Paused');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const battleRef = useRef<Battle | null>(null);
  const dirtyRef = useRef(true);
  const onEndRef = useRef(onBattleEnd); onEndRef.current = onBattleEnd;
  const menuRef = useRef(menuOpen); menuRef.current = menuOpen;
  const forceRef = useRef(forcePause); forceRef.current = forcePause;

  const applySuspend = useCallback(() => {
    const b = battleRef.current; if (!b) return;
    b.suspended = menuRef.current || forceRef.current;
    if (b.suspended) b.releaseAllInputs();
    dirtyRef.current = true;
  }, []);

  // ---------------------------------------------------------------- engine + render loop
  useEffect(() => {
    soundManager.unlockAudio();
    const canvas = canvasRef.current!, host = hostRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const battle = new Battle(playerCharacterId, enemyCharacterId, {
      onHud: setHud,
      onCountdown: (v) => { setCountdown(v); if (v === 2 || v === 1) soundManager.playSelect(); else if (v === 'FIGHT') soundManager.playSpecial(); },
      onAttack: () => soundManager.playAttack(),
      onSpecial: () => soundManager.playSpecial(),
      onHit: () => soundManager.playHit(),
      onBlock: () => soundManager.playBlock(),
      onKO: (victory) => { setResult(victory ? 'VICTORY' : 'DEFEAT'); soundManager.playVictory(); },
      onEnd: (victory, stats) => onEndRef.current(victory, stats),
    });
    battle.suspended = true; // frozen until art is ready (then applySuspend)
    battleRef.current = battle;
    // Dev-only hook for the automated browser tests (tree-shaken out of production builds).
    if (import.meta.env.DEV) (window as unknown as { __hc?: unknown }).__hc = { battle };

    const assets: RenderAssets = { arena: null, arenaParallax: arena.parallax, player: null, enemy: null };
    let layout: Layout = computeLayout(host.clientWidth, host.clientHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let disposed = false;

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w < 2 || h < 2) return; // hidden/collapsing container: keep last good layout
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      layout = computeLayout(w, h);
      const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      battle.layout(layout.worldW);
      dirtyRef.current = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener('orientationchange', resize);
    resize();

    Promise.allSettled([loadImage(p.imageSrc), loadImage(p.attackImageSrc), loadImage(e.imageSrc), loadImage(e.attackImageSrc), loadImage(arena.image)]).then((r) => {
      if (disposed) return;
      const ok = (i: number) => (r[i].status === 'fulfilled' ? (r[i] as PromiseFulfilledResult<HTMLImageElement>).value : null);
      if (ok(0) && ok(1)) assets.player = buildFighterSprites(ok(0)!, ok(1)!, false);
      if (ok(2) && ok(3)) assets.enemy = buildFighterSprites(ok(2)!, ok(3)!, true);
      assets.arena = ok(4);
      applySuspend();
    });

    const stepper = new FixedStepper();
    let raf = 0, last = performance.now();
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (t - last) / 1000; last = t;
      if (battle.suspended) { if (dirtyRef.current) { dirtyRef.current = false; renderBattle(ctx, dpr, layout, battle, assets, t); } stepper.reset(); return; }
      const n = stepper.consume(dt);
      for (let i = 0; i < n; i++) battle.step();
      renderBattle(ctx, dpr, layout, battle, assets, t);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('orientationchange', resize);
      battle.releaseAllInputs();
      battleRef.current = null;
      soundManager.stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- pause plumbing
  useEffect(() => { applySuspend(); }, [menuOpen, forcePause, applySuspend]);
  useEffect(() => {
    if (forcePause) { setPauseTitle('Paused'); if (battleRef.current && battleRef.current.phase !== 'done') setMenuOpen(true); }
  }, [forcePause]);
  const lastBack = useRef(backSignal);
  useEffect(() => {
    if (lastBack.current === backSignal) return; // only react to a *change* (safe under StrictMode double-effects)
    lastBack.current = backSignal;
    setPauseTitle('Paused');
    setMenuOpen((o) => (battleRef.current?.phase === 'ko' || battleRef.current?.phase === 'done' ? o : !o));
  }, [backSignal]);

  // ---------------------------------------------------------------- inputs
  const setInput = useCallback((a: InputAction, v: boolean) => battleRef.current?.setInput(a, v), []);
  const attack = useCallback(() => battleRef.current?.attack(), []);
  const special = useCallback(() => battleRef.current?.special(), []);

  useEffect(() => {
    const down = (ev: KeyboardEvent) => {
      if (ev.code === 'Escape' || ev.code === 'KeyP') { ev.preventDefault(); if (!ev.repeat) setMenuOpen((o) => !o); return; }
      switch (ev.code) {
        case 'KeyA': case 'ArrowLeft': ev.preventDefault(); setInput('left', true); break;
        case 'KeyD': case 'ArrowRight': ev.preventDefault(); setInput('right', true); break;
        case 'KeyW': case 'ArrowUp': case 'Space': ev.preventDefault(); setInput('jump', true); break;
        case 'KeyL': case 'ArrowDown': ev.preventDefault(); setInput('block', true); break;
        case 'KeyJ': ev.preventDefault(); if (!ev.repeat) attack(); break;
        case 'KeyK': ev.preventDefault(); if (!ev.repeat) special(); break;
      }
    };
    const up = (ev: KeyboardEvent) => {
      switch (ev.code) {
        case 'KeyA': case 'ArrowLeft': setInput('left', false); break;
        case 'KeyD': case 'ArrowRight': setInput('right', false); break;
        case 'KeyW': case 'ArrowUp': case 'Space': setInput('jump', false); break;
        case 'KeyL': case 'ArrowDown': setInput('block', false); break;
      }
    };
    const release = () => battleRef.current?.releaseAllInputs();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', release);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', release); };
  }, [setInput, attack, special]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none touch-none" onContextMenu={(ev) => ev.preventDefault()}>
      <div ref={hostRef} className="absolute inset-0"><canvas ref={canvasRef} className="block w-full h-full" /></div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-[2vmin] pointer-events-none"
        style={{ padding: `max(var(--sat), 2vmin) max(var(--sar), 3vmin) 0 max(var(--sal), 3vmin)` }}>
        <div className="min-w-0 max-w-md flex flex-col gap-[.8vmin]">
          <HealthBar current={hud.playerHp} max={hud.playerMaxHp} name={p.name} avatar={p.portraitSrc} />
          <div className="ml-[clamp(2.4rem,8vmin,4rem)] pl-[1.2vmin] flex items-center gap-2" aria-label={`Special power ${Math.round(hud.playerPower)} percent`}>
            <div className={`h-[clamp(.4rem,1.3vmin,.6rem)] w-[min(30vw,14rem)] rounded-full bg-slate-900/80 border overflow-hidden ${hud.playerPower >= 100 ? 'border-yellow-300 shadow-[0_0_10px_gold]' : 'border-slate-700'}`}>
              <div className="h-full bg-yellow-400 transition-[width] duration-300" style={{ width: `${hud.playerPower}%` }} />
            </div>
            {hud.playerPower >= 100 && <span className="text-yellow-300 font-black text-[clamp(.5rem,1.6vmin,.7rem)] uppercase tracking-widest anim-pop">Special ready</span>}
          </div>
        </div>
        <button aria-label="Pause" onClick={() => { setPauseTitle('Paused'); setMenuOpen(true); }}
          className="pointer-events-auto w-[clamp(2.2rem,7vmin,3.2rem)] h-[clamp(2.2rem,7vmin,3.2rem)] rounded bg-slate-900/80 border border-yellow-600 flex items-center justify-center text-yellow-500 active:scale-90 transition-transform">
          <Pause size={20} />
        </button>
        <div className="min-w-0 max-w-md justify-self-end w-full"><HealthBar current={hud.enemyHp} max={hud.enemyMaxHp} isEnemy name={e.name} avatar={e.portraitSrc} /></div>
      </div>

      {hud.combo > 1 && (
        <div key={hud.combo} className="absolute z-10 pointer-events-none anim-pop" style={{ top: 'calc(max(var(--sat), 2vmin) + 17vmin)', left: 'max(var(--sal), 3vmin)' }}>
          <span className="text-[clamp(2rem,9vmin,4.5rem)] font-black text-yellow-400 italic text-stroke">{hud.combo}</span>
          <span className="block text-[clamp(.7rem,2.6vmin,1.2rem)] font-bold text-white uppercase -mt-1">Hits</span>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] pointer-events-none">
          <div key={String(countdown)} className="anim-count">
            {typeof countdown === 'number'
              ? <span className="text-[clamp(5rem,32vmin,12rem)] font-black text-white italic drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] text-stroke">{countdown}</span>
              : <span className="text-[clamp(3rem,22vmin,9rem)] font-black text-red-600 italic uppercase tracking-tighter drop-shadow-[0_0_80px_rgba(220,38,38,1)] text-stroke">FIGHT!</span>}
          </div>
        </div>
      )}

      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm anim-pop pointer-events-none">
          <h1 className={`text-[clamp(3rem,18vmin,8rem)] font-black italic uppercase tracking-tighter ${result === 'VICTORY' ? 'text-yellow-400' : 'text-red-600'}`}>{result}</h1>
        </div>
      )}

      {showTouchControls && !result && countdown === null && <TouchControls power={hud.playerPower} onInput={setInput} onAttack={attack} onSpecial={special} />}

      {!showTouchControls && (
        <div className="absolute z-10 hidden md:flex flex-col items-end gap-1 pointer-events-none opacity-60" style={{ bottom: 'max(var(--sab), 1rem)', right: 'max(var(--sar), 1rem)' }}>
          <div className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2"><Keyboard size={14} /> Controls</div>
          <div className="bg-black/80 p-2 rounded border border-white/20 text-[10px] text-white font-mono leading-tight text-right">
            <p><span className="text-yellow-400">W A D</span> - MOVE / JUMP</p>
            <p><span className="text-yellow-400">J</span> - ATTACK &nbsp; <span className="text-yellow-400">K</span> - SPECIAL</p>
            <p><span className="text-yellow-400">L</span> - BLOCK &nbsp; <span className="text-yellow-400">Esc</span> - PAUSE</p>
          </div>
        </div>
      )}

      {menuOpen && !result && (
        <PauseOverlay title={pauseTitle} onResume={() => { if (!forcePause) setMenuOpen(false); }} onSettings={onOpenSettings} onQuit={onQuit} />
      )}
    </div>
  );
};
