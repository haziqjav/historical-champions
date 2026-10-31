import React from 'react';

export const LoadingScreen: React.FC<{ progress?: number; label?: string }> = ({ progress, label = 'Loading' }) => (
  <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 text-white z-[100]" role="status" aria-live="polite">
    <div className="w-12 h-12 rounded-full border-4 border-yellow-600/30 border-t-yellow-500 anim-spin" />
    <p className="text-yellow-500 font-serif tracking-[0.3em] uppercase text-sm">{label}</p>
    {progress !== undefined && (
      <div className="w-[min(60vw,16rem)] h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    )}
  </div>
);
