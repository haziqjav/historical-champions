import React from 'react';

interface Props { current: number; max: number; isEnemy?: boolean; name: string; avatar: string; }

// React.memo: only re-renders when HP actually changes (HUD updates happen on hits, not per frame).
export const HealthBar: React.FC<Props> = React.memo(({ current, max, isEnemy = false, name, avatar }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const low = percent <= 30;
  return (
    <div className={`flex items-center gap-[1.2vmin] w-full min-w-0 ${isEnemy ? 'flex-row-reverse' : ''}`}>
      <div className="w-[clamp(2.4rem,8vmin,4rem)] h-[clamp(2.4rem,8vmin,4rem)] rounded-full border-2 border-yellow-500 overflow-hidden shrink-0 bg-slate-800 relative z-10 shadow-lg">
        <img src={avatar} alt={name} draggable={false} className="w-full h-full object-cover object-top" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className={`flex justify-between gap-2 text-[clamp(.55rem,1.9vmin,.8rem)] font-bold uppercase text-white tracking-wider ${isEnemy ? 'flex-row-reverse' : ''}`}>
          <span className="truncate">{name}</span>
          <span className="shrink-0 tabular-nums">{Math.ceil(current)}</span>
        </div>
        <div className="h-[clamp(.7rem,2.4vmin,1.1rem)] w-full bg-slate-900/80 rounded-sm skew-x-[-15deg] border border-slate-600 overflow-hidden relative">
          <div className="absolute top-0 bottom-0 bg-red-800 transition-[width] duration-500 ease-out" style={{ width: `${percent}%`, [isEnemy ? 'right' : 'left']: 0 }} />
          <div className={`absolute top-0 bottom-0 transition-[width] duration-200 ease-linear ${isEnemy ? 'bg-red-500' : low ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${percent}%`, [isEnemy ? 'right' : 'left']: 0 }} />
        </div>
      </div>
    </div>
  );
});
