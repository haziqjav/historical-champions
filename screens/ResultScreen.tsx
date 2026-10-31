import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Skull, Scroll, Sparkles, Volume2, Square, RotateCcw, Users } from 'lucide-react';
import { BattleStats } from '../types';
import { CHARACTERS } from '../constants';
import { Chronicle } from '../services/chronicleService';
import { soundManager } from '../services/soundService';

interface Props {
  isWin: boolean; stats: BattleStats | null;
  chronicle: Chronicle | null; // null = still loading
  onRematch: () => void; onRoster: () => void;
}

const Pill = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-black/50 border border-slate-700 rounded px-3 py-1.5 text-center min-w-[5.5rem]">
    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</div>
    <div className="text-yellow-400 font-black tabular-nums text-[clamp(.9rem,3vmin,1.3rem)]">{value}</div>
  </div>
);

export const ResultScreen: React.FC<Props> = ({ isWin, stats, chronicle, onRematch, onRoster }) => {
  const [speaking, setSpeaking] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { stopRef.current?.(); }, []);

  const toggleNarration = () => {
    if (speaking) { stopRef.current?.(); setSpeaking(false); return; }
    if (!chronicle?.audio) return;
    stopRef.current = soundManager.playGeneratedAudio(chronicle.audio, { onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
    setSpeaking(true);
  };
  const leave = (fn: () => void) => () => { stopRef.current?.(); soundManager.stopVoice(); fn(); };
  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto anim-fade" style={{ padding: 'max(var(--sat), 1rem) max(var(--sar), 1rem) max(var(--sab), 1rem) max(var(--sal), 1rem)' }}>
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center gap-[2.5vmin] max-w-2xl mx-auto">
        <div className="flex items-center gap-4 anim-pop">
          {isWin ? <Trophy className="text-yellow-400 w-[clamp(2.5rem,12vmin,5rem)] h-[clamp(2.5rem,12vmin,5rem)]" /> : <Skull className="text-red-600 w-[clamp(2.5rem,12vmin,5rem)] h-[clamp(2.5rem,12vmin,5rem)]" />}
          <h2 className={`text-[clamp(2.4rem,14vmin,6rem)] font-black italic uppercase drop-shadow-lg ${isWin ? 'text-yellow-500' : 'text-slate-500'}`}>{isWin ? 'Victory' : 'Defeated'}</h2>
        </div>

        {stats && (
          <div className="flex flex-wrap justify-center gap-2 anim-rise">
            <Pill label="Time" value={mm(stats.durationSeconds)} />
            <Pill label="Best combo" value={String(stats.maxCombo)} />
            <Pill label={`${CHARACTERS[stats.winnerId].name.split(' ')[0]} HP`} value={`${stats.remainingHpPercentage}%`} />
          </div>
        )}

        <div className="w-full bg-black/60 border-y-2 border-yellow-600/30 p-[clamp(.75rem,3vmin,1.5rem)] backdrop-blur-sm rounded-lg min-h-[5.5rem] flex flex-col items-center justify-center anim-rise">
          <div className="flex items-center gap-2 text-yellow-500 mb-2 opacity-80">
            <Scroll size={16} />
            <span className="text-xs uppercase tracking-[0.3em]">War Chronicle{chronicle?.source === 'ai' ? ' · AI' : ''}</span>
          </div>
          {!chronicle ? (
            <div className="flex items-center gap-2 text-slate-400 animate-pulse"><Sparkles size={16} /><span className="text-sm font-mono uppercase">Writing the chronicle…</span></div>
          ) : (
            <p className="text-[clamp(.9rem,3vmin,1.5rem)] font-serif text-slate-200 text-center leading-relaxed italic">"{chronicle.text}"</p>
          )}
          {chronicle?.audio && (
            <button onClick={toggleNarration} className="mt-3 flex items-center gap-2 text-xs uppercase tracking-widest text-yellow-400 border border-yellow-700/60 rounded-full px-4 py-1.5 hover:bg-yellow-900/20">
              {speaking ? <><Square size={12} /> Stop narration</> : <><Volume2 size={14} /> Listen</>}
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 anim-rise">
          <button onClick={leave(onRematch)} className="px-[min(8vmin,2.5rem)] py-[min(2vmin,.9rem)] bg-red-700 hover:bg-red-600 border-b-4 border-red-900 rounded font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform text-[clamp(.85rem,2.8vmin,1.3rem)]"><RotateCcw size={18} /> Rematch</button>
          <button onClick={leave(onRoster)} className="px-[min(8vmin,2.5rem)] py-[min(2vmin,.9rem)] bg-slate-100 text-slate-900 hover:bg-white rounded font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform text-[clamp(.85rem,2.8vmin,1.3rem)]"><Users size={18} /> Roster</button>
        </div>
      </div>
    </div>
  );
};
