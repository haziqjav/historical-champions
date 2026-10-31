import React, { useEffect, useState } from 'react';
import { X, Music, Mic, Swords } from 'lucide-react';
import { getSettings, subscribeSettings, updateSettings } from '../../services/settingsService';
import { soundManager } from '../../services/soundService';
import { AudioSettings } from '../../types';

const Slider: React.FC<{ label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void; onCommit?: () => void }> = ({ label, icon, value, onChange, onCommit }) => (
  <label className="flex items-center gap-3 w-full">
    <span className="text-yellow-500 shrink-0">{icon}</span>
    <span className="w-16 text-xs font-bold uppercase tracking-widest text-slate-300 shrink-0">{label}</span>
    <input type="range" min={0} max={100} value={Math.round(value * 100)} className="hc-range flex-1 min-w-0"
      onChange={(e) => onChange(Number(e.target.value) / 100)} onPointerUp={onCommit} onKeyUp={onCommit} />
    <span className="w-9 text-right text-xs tabular-nums text-slate-400">{Math.round(value * 100)}</span>
  </label>
);

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [s, setS] = useState<AudioSettings>(getSettings());
  useEffect(() => subscribeSettings(setS), []);
  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 anim-fade" onClick={onClose}>
      <div role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}
        className="w-[min(92vw,28rem)] max-h-[92%] overflow-y-auto bg-slate-900 border border-yellow-700/40 rounded-lg p-5 shadow-2xl anim-pop">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-yellow-500 font-black uppercase tracking-widest">Sound</h2>
          <button aria-label="Close settings" onClick={onClose} className="p-2 rounded bg-slate-800 hover:bg-slate-700"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => { soundManager.unlockAudio(); updateSettings({ musicEnabled: !s.musicEnabled }); }}
            className={`py-2 rounded font-black uppercase tracking-widest text-sm border ${s.musicEnabled ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
            Music: {s.musicEnabled ? 'On' : 'Off'}
          </button>
          <Slider label="Music" icon={<Music size={16} />} value={s.musicVolume} onChange={(v) => updateSettings({ musicVolume: v })} />
          <Slider label="Voices" icon={<Mic size={16} />} value={s.voiceVolume} onChange={(v) => updateSettings({ voiceVolume: v })} />
          <Slider label="Effects" icon={<Swords size={16} />} value={s.sfxVolume} onChange={(v) => updateSettings({ sfxVolume: v })} onCommit={() => { soundManager.unlockAudio(); soundManager.playAttack(); }} />
        </div>
      </div>
    </div>
  );
};
