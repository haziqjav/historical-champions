import React from 'react';
import { Play, Volume2, LogOut } from 'lucide-react';

interface Props { title?: string; onResume: () => void; onSettings: () => void; onQuit: () => void; }

export const PauseOverlay: React.FC<Props> = ({ title = 'Paused', onResume, onSettings, onQuit }) => (
  <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center anim-fade" role="dialog" aria-label={title}>
    <div className="flex flex-col items-center gap-[2vmin] p-4">
      <h2 className="text-[clamp(1.5rem,6vmin,3rem)] font-black italic uppercase tracking-widest text-yellow-500">{title}</h2>
      <button onClick={onResume} className="w-[min(70vw,18rem)] py-[1.6vmin] px-6 bg-red-700 hover:bg-red-600 border-b-4 border-red-900 rounded-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform text-[clamp(.9rem,3vmin,1.25rem)]"><Play size={20} /> Resume</button>
      <button onClick={onSettings} className="w-[min(70vw,18rem)] py-[1.4vmin] px-6 bg-slate-700 hover:bg-slate-600 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform text-[clamp(.8rem,2.6vmin,1.1rem)]"><Volume2 size={18} /> Sound</button>
      <button onClick={onQuit} className="w-[min(70vw,18rem)] py-[1.4vmin] px-6 bg-slate-800 hover:bg-slate-700 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform text-slate-300 text-[clamp(.8rem,2.6vmin,1.1rem)]"><LogOut size={18} /> Quit to Roster</button>
    </div>
  </div>
);
