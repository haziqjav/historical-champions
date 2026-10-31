import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpDown, Volume2, VolumeX, Settings, Swords, Keyboard, Zap, Shield } from 'lucide-react';
import { CharacterId } from '../types';
import { CHARACTERS } from '../constants';
import { CharacterCard } from '../components/CharacterCard';

interface Props {
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  onFight: () => void;
  onBack: () => void;
  onSettings: () => void;
  musicMuted: boolean;
  onToggleMusic: () => void;
  isTouch: boolean;
}

const Stat = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="bg-black/40 border border-slate-800 px-1.5 py-1 rounded-sm flex flex-col min-w-0">
    <span className="text-[clamp(.45rem,1.5vmin,.65rem)] text-slate-500 uppercase font-black tracking-tight truncate">{label}</span>
    <span className={`${color} font-black text-[clamp(.7rem,2.6vmin,1.1rem)] tabular-nums`}>{value}</span>
  </div>
);
const KeyCap = ({ children }: { children?: React.ReactNode }) => (
  <div className="h-6 min-w-[1.5rem] px-1 bg-slate-800 border-b-2 border-slate-950 rounded text-slate-200 font-mono font-bold text-[10px] flex items-center justify-center">{children}</div>
);

export const CharacterSelect: React.FC<Props> = ({ selectedId, onSelect, onFight, onBack, onSettings, musicMuted, onToggleMusic, isTouch }) => {
  const [sortBy, setSortBy] = useState<'rarity' | 'name'>('rarity');
  const list = useMemo(() => Object.values(CHARACTERS).sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name) : b.rarity !== a.rarity ? b.rarity - a.rarity : a.name.localeCompare(b.name)), [sortBy]);
  const sel = CHARACTERS[selectedId];

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === 'Enter') onFight(); else if (e.code === 'Escape') onBack(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onFight, onBack]);

  const iconBtn = 'p-[clamp(.35rem,1.2vmin,.7rem)] bg-black/40 hover:bg-black/60 rounded-sm border border-slate-700 transition-colors';
  return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col text-white anim-fade">
      <header className="shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-yellow-900/30 flex items-center justify-between z-20 shadow-2xl h-[clamp(2.75rem,9vmin,4.5rem)]"
        style={{ paddingLeft: 'max(var(--sal), .75rem)', paddingRight: 'max(var(--sar), .75rem)', paddingTop: 'var(--sat)', boxSizing: 'content-box' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back to main menu" className={`${iconBtn} bg-slate-800`}><ArrowLeft className="w-[clamp(1rem,3vmin,1.5rem)] h-[clamp(1rem,3vmin,1.5rem)]" /></button>
          <h2 className="text-[clamp(.85rem,3vmin,1.5rem)] font-black italic tracking-widest text-yellow-500 uppercase">Select Champion</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMusic} aria-label={musicMuted ? 'Unmute music' : 'Mute music'} className={iconBtn}>
            {musicMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-yellow-500" />}
          </button>
          <button onClick={onSettings} aria-label="Sound settings" className={iconBtn}><Settings className="w-5 h-5 text-yellow-500" /></button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex landscape:flex-row portrait:flex-col">
        {/* Hero panel */}
        <aside className="landscape:w-[38%] landscape:max-w-[34rem] portrait:h-[46%] shrink-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black landscape:border-r portrait:border-b border-yellow-900/20 flex flex-col min-h-0"
          style={{ paddingLeft: 'max(var(--sal), 0px)' }}>
          <div className="flex-1 min-h-0 relative flex flex-col items-center px-3 pt-2">
            <div className="text-center z-10 w-full shrink-0">
              <h3 className="text-[clamp(1rem,4.6vmin,2.8rem)] font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">{sel.name}</h3>
              <p className="text-yellow-500 font-serif italic text-[clamp(.65rem,2.2vmin,1.1rem)] truncate">{sel.title}</p>
            </div>
            <div className="flex-1 min-h-0 w-full flex items-end justify-center pb-1">
              <img key={sel.id} src={sel.imageSrc} alt={sel.name} draggable={false} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] anim-pop" />
            </div>
          </div>
          <div className="bg-slate-900/90 p-[clamp(.4rem,1.6vmin,1.5rem)] border-t border-slate-800 shrink-0" style={{ paddingBottom: 'max(var(--sab), .5rem)' }}>
            <div className="grid grid-cols-4 gap-1 mb-[clamp(.4rem,1.6vmin,1rem)]">
              <Stat label="Health" value={sel.baseStats.health} color="text-green-400" />
              <Stat label="Attack" value={sel.baseStats.attack} color="text-red-400" />
              <Stat label="Defense" value={sel.baseStats.defense} color="text-blue-400" />
              <Stat label="Crit" value={`${(sel.baseStats.critChance * 100).toFixed(0)}%`} color="text-yellow-400" />
            </div>
            <button onClick={onFight}
              className="w-full bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black py-[clamp(.5rem,1.8vmin,1.1rem)] rounded-sm text-[clamp(.85rem,2.8vmin,1.3rem)] uppercase tracking-widest shadow-[0_5px_15px_rgba(220,38,38,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2 border-b-4 border-red-950">
              <Swords className="w-[1.2em] h-[1.2em]" /> Fight
            </button>
          </div>
        </aside>

        {/* Roster */}
        <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-carbon" style={{ paddingRight: 'max(var(--sar), 0px)' }}>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-[clamp(.5rem,1.8vmin,2rem)]" style={{ touchAction: 'pan-y' }}>
            <div className="flex items-center justify-end gap-2 mb-[clamp(.4rem,1.6vmin,1.2rem)] bg-black/40 p-2 rounded-sm border border-slate-700">
              <ArrowUpDown size={12} className="text-yellow-500" />
              <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'rarity' | 'name')}
                className="bg-slate-900 border border-slate-600 text-white text-[10px] md:text-xs font-bold uppercase rounded px-2 py-1 focus:outline-none focus:border-yellow-500">
                <option value="rarity">Rarity</option><option value="name">Name</option>
              </select>
            </div>
            <div className="grid gap-[clamp(.4rem,1.4vmin,1rem)] pb-6 grid-cols-[repeat(auto-fill,minmax(clamp(5.5rem,17vmin,9.5rem),1fr))]">
              {list.map((c) => <CharacterCard key={c.id} character={c} isUnlocked isSelected={c.id === selectedId} onClick={() => onSelect(c.id)} />)}
            </div>
          </div>
          {!isTouch && (
            <div className="hidden md:flex shrink-0 bg-slate-900/90 border-t border-yellow-900/30 p-2 items-center justify-center gap-6 z-10">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-widest uppercase border-r border-slate-700 pr-4"><Keyboard size={16} /> Controls</div>
              <div className="flex items-center gap-2"><div className="flex gap-1"><KeyCap>A</KeyCap><KeyCap>W</KeyCap><KeyCap>D</KeyCap></div><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Move / Jump</span></div>
              <div className="flex items-center gap-2"><KeyCap>J</KeyCap><span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1"><Swords size={12} /> Attack</span></div>
              <div className="flex items-center gap-2"><KeyCap>K</KeyCap><span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1"><Zap size={12} className="fill-yellow-500" /> Special</span></div>
              <div className="flex items-center gap-2"><KeyCap>L</KeyCap><span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1"><Shield size={12} className="fill-blue-500" /> Block</span></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
