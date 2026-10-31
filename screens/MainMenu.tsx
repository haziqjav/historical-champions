import React from 'react';
import { Youtube, Volume2, VolumeX, Settings } from 'lucide-react';
import { assetUrl } from '../constants';
import manifest from '../assets.manifest.json';

interface Props { onStart: () => void; onSettings: () => void; musicMuted: boolean; onToggleMusic: () => void; }

const BG = assetUrl(manifest.arenas.hattin);

export const MainMenu: React.FC<Props> = ({ onStart, onSettings, musicMuted, onToggleMusic }) => (
  <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden anim-fade">
    <div className="absolute inset-0 bg-cover bg-center opacity-25 scale-110 blur-sm" style={{ backgroundImage: `url(${BG})` }} />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

    <div className="absolute flex gap-2 z-20" style={{ top: 'max(var(--sat), 1rem)', right: 'max(var(--sar), 1rem)' }}>
      <button onClick={onToggleMusic} aria-label={musicMuted ? 'Unmute music' : 'Mute music'} className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-slate-700 transition-colors">
        {musicMuted ? <VolumeX size={20} className="text-slate-400" /> : <Volume2 size={20} className="text-yellow-500" />}
      </button>
      <button onClick={onSettings} aria-label="Sound settings" className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-slate-700 transition-colors">
        <Settings size={20} className="text-yellow-500" />
      </button>
    </div>

    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4" style={{ paddingTop: 'var(--sat)', paddingBottom: 'calc(var(--sab) + 4rem)' }}>
      <h1 className="anim-rise text-[clamp(2.2rem,13vmin,8rem)] md:text-[clamp(2.2rem,14vmin,9rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-600 to-yellow-900 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] leading-[.95] italic">
        HISTORICAL<br />CHAMPIONS
      </h1>
      <p className="text-yellow-500 font-serif text-[clamp(.7rem,2.6vmin,1.5rem)] tracking-[0.3em] md:tracking-[0.5em] mt-[1.5vmin] mb-[4vmin] uppercase italic">Legacy of the Crusades</p>
      <button onClick={onStart}
        className="px-[min(12vmin,4rem)] py-[min(2.4vmin,1.2rem)] bg-red-700 hover:bg-red-600 text-[clamp(1.1rem,4.2vmin,1.9rem)] font-black rounded-sm border-b-4 border-red-900 shadow-[0_0_30px_rgba(185,28,28,0.5)] hover:scale-105 active:scale-95 transition-transform uppercase tracking-widest">
        Battle Now
      </button>
    </div>

    <div className="absolute left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4" style={{ bottom: 'max(var(--sab), .75rem)' }}>
      <span className="text-slate-400 font-bold tracking-widest text-[10px] md:text-xs">© 2026 GAME BUILD BY</span>
      <a href="https://www.youtube.com/@Tube_HJ" target="_blank" rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-900/50 px-3 py-1.5 rounded-full transition-colors">
        <span className="bg-red-600 text-white p-1 rounded-sm group-hover:bg-red-500 transition-colors"><Youtube size={14} fill="currentColor" /></span>
        <span className="font-bold text-red-100 text-xs tracking-wider">@Tube_HJ</span>
      </a>
      <span className="text-slate-600 font-mono text-[10px] tracking-widest">V{__APP_VERSION__}</span>
    </div>
  </div>
);
