import React from 'react';
import { Shield, Zap, Sword, MoveLeft, MoveRight, ArrowUp } from 'lucide-react';
import { InputAction } from '../../game/engine';

interface Props {
  power: number;
  onInput: (a: InputAction, active: boolean) => void;
  onAttack: () => void;
  onSpecial: () => void;
}

/** Press-and-hold button that cannot get "stuck": pointer capture + cancel/lost-capture release. */
const Hold: React.FC<{ onChange: (active: boolean) => void; className: string; label: string; children: React.ReactNode }> = ({ onChange, className, label, children }) => (
  <button
    type="button" aria-label={label}
    className={`touch-none select-none ${className}`}
    onContextMenu={(e) => e.preventDefault()}
    onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } onChange(true); }}
    onPointerUp={(e) => { e.preventDefault(); onChange(false); }}
    onPointerCancel={() => onChange(false)}
    onLostPointerCapture={() => onChange(false)}
  >{children}</button>
);

export const TouchControls: React.FC<Props> = React.memo(({ power, onInput, onAttack, onSpecial }) => {
  const ready = power >= 100;
  return (
    <div
      className="absolute inset-0 z-40 pointer-events-none flex items-end justify-between"
      style={{
        // sizes derive from the SMALLER screen side; padding keeps clear of notches and gesture bars
        ['--btn' as string]: 'clamp(3rem, 13vmin, 6rem)',
        padding: `0 max(var(--sar), 3vmin) max(var(--sab), 3vmin) max(var(--sal), 3vmin)`,
      }}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-[1.5vmin]">
        <Hold label="Jump" onChange={(a) => onInput('jump', a)} className="w-[var(--btn)] h-[var(--btn)] rounded-full bg-slate-700/80 border-2 border-slate-500 flex items-center justify-center active:bg-slate-500 shadow-lg">
          <ArrowUp className="w-[45%] h-[45%] text-white" />
        </Hold>
        <div className="flex gap-[2vmin]">
          <Hold label="Move left" onChange={(a) => onInput('left', a)} className="w-[calc(var(--btn)*1.15)] h-[calc(var(--btn)*1.15)] rounded-full bg-slate-800/80 border-2 border-slate-500 flex items-center justify-center active:bg-slate-600 shadow-xl">
            <MoveLeft className="w-[45%] h-[45%] text-white" />
          </Hold>
          <Hold label="Move right" onChange={(a) => onInput('right', a)} className="w-[calc(var(--btn)*1.15)] h-[calc(var(--btn)*1.15)] rounded-full bg-slate-800/80 border-2 border-slate-500 flex items-center justify-center active:bg-slate-600 shadow-xl">
            <MoveRight className="w-[45%] h-[45%] text-white" />
          </Hold>
        </div>
      </div>

      <div className="pointer-events-auto flex items-end gap-[2.5vmin] relative">
        <Hold label="Block" onChange={(a) => onInput('block', a)} className="w-[var(--btn)] h-[var(--btn)] rounded-full bg-blue-900/80 border-2 border-blue-400 flex items-center justify-center active:bg-blue-700 mb-[1vmin] shadow-lg">
          <Shield className="w-[45%] h-[45%] text-white" />
        </Hold>
        <button type="button" aria-label="Attack" onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => { e.preventDefault(); onAttack(); }}
          className="touch-none select-none w-[calc(var(--btn)*1.5)] h-[calc(var(--btn)*1.5)] rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400 flex items-center justify-center active:scale-90 transition-transform shadow-2xl">
          <Sword className="w-[45%] h-[45%] text-white drop-shadow-md" />
        </button>
        <button type="button" aria-label={ready ? 'Special attack ready' : 'Special attack charging'} disabled={!ready}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => { e.preventDefault(); onSpecial(); }}
          className={`touch-none select-none absolute right-0 bottom-[calc(var(--btn)*1.5+2vmin)] w-[calc(var(--btn)*1.2)] h-[calc(var(--btn)*1.2)] rounded-full border-4 flex items-center justify-center transition-all
            ${ready ? 'bg-yellow-500 border-yellow-200 anim-ring scale-110' : 'bg-slate-800/80 border-slate-600 opacity-60'}`}
          style={!ready ? { background: `conic-gradient(rgba(250,204,21,.7) ${power * 3.6}deg, rgba(30,41,59,.85) 0)` } : undefined}>
          <Zap className="w-[45%] h-[45%] text-white fill-white" />
        </button>
      </div>
    </div>
  );
});
