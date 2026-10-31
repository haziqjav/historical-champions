import React, { useEffect, useRef, useState } from 'react';
import { Scroll, Sparkles } from 'lucide-react';
import { ArenaData, CharacterData } from '../types';
import { preloadImages } from '../services/assets';
import { soundManager } from '../services/soundService';

interface Props {
  player: CharacterData; enemy: CharacterData; arena: ArenaData;
  text: string; voiceUrl: string;
  onDone: (skipped: boolean) => void;
}

/**
 * Pre-fight screen. While the narrator speaks it loads exactly the art needed for this battle, so the
 * fight never starts on half-loaded sprites. It always finishes: narration end, narration error,
 * a text-length timer, or a hard cap - whichever comes first (no more NaN-duration instant skips).
 */
export const NarrativeScreen: React.FC<Props> = ({ player, enemy, arena, text, voiceUrl, onDone }) => {
  const [ready, setReady] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone); onDoneRef.current = onDone;

  const finish = (skipped: boolean) => {
    if (doneRef.current) return; doneRef.current = true;
    soundManager.stopVoice();
    onDoneRef.current(skipped);
  };

  useEffect(() => {
    let alive = true;
    preloadImages([player.imageSrc, player.attackImageSrc, enemy.imageSrc, enemy.attackImageSrc, arena.image])
      .then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [player, enemy, arena]);

  useEffect(() => {
    if (!ready) return;
    if (skipRequested) { finish(true); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const fallbackMs = Math.max(4500, text.length * 55);
    let fallbackSet = false;
    const armFallback = () => { if (!fallbackSet) { fallbackSet = true; timers.push(setTimeout(() => finish(false), fallbackMs)); } };
    const cancel = soundManager.playNarratorVoice(voiceUrl, {
      onEnd: () => timers.push(setTimeout(() => finish(false), 500)),
      onError: armFallback,
    });
    timers.push(setTimeout(() => finish(false), 25000)); // hard cap
    return () => { cancel(); timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, skipRequested]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden anim-fade">
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-blue-950/40 relative overflow-hidden border-r-4 border-yellow-500/50">
          <img src={player.imageSrc} alt="" draggable={false} className="absolute bottom-0 left-0 w-full h-[90%] object-contain object-left-bottom opacity-60 mix-blend-screen" />
        </div>
        <div className="w-1/2 bg-red-950/40 relative overflow-hidden">
          <img src={enemy.imageSrc} alt="" draggable={false} className="absolute bottom-0 right-0 w-full h-[90%] object-contain object-right-bottom opacity-60 mix-blend-screen scale-x-[-1]" />
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ top: 'calc(max(var(--sat), 1rem) + 8vmin)' }}>
        <span className="text-[clamp(3rem,20vmin,9rem)] font-black text-yellow-500 italic drop-shadow-[0_0_50px_rgba(234,179,8,0.8)] text-stroke anim-pop">VS</span>
      </div>
      <h2 className="absolute z-20 text-[clamp(1rem,5vmin,2.5rem)] font-black text-blue-200 uppercase italic anim-slide-l" style={{ top: 'max(var(--sat), 1rem)', left: 'max(var(--sal), 1.25rem)' }}>{player.name}</h2>
      <h2 className="absolute z-20 text-[clamp(1rem,5vmin,2.5rem)] font-black text-red-200 uppercase italic text-right anim-slide-r" style={{ top: 'max(var(--sat), 1rem)', right: 'max(var(--sar), 1.25rem)' }}>{enemy.name}</h2>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent px-4 pt-8 flex flex-col items-center justify-end z-30" style={{ paddingBottom: 'max(var(--sab), 1rem)' }}>
        <div className="max-w-4xl text-center">
          <Scroll className="mx-auto text-slate-500 mb-1 w-6 h-6 opacity-50" />
          <p className="font-serif text-[clamp(.85rem,3.2vmin,1.9rem)] text-yellow-100 leading-relaxed italic drop-shadow-md">"{text}"</p>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {!ready && <span className="flex items-center gap-2 text-yellow-500 text-xs uppercase tracking-widest animate-pulse"><Sparkles size={14} /> Preparing battle…</span>}
          <button onClick={() => (ready ? finish(true) : setSkipRequested(true))}
            className="text-slate-400 hover:text-white text-xs uppercase tracking-[0.2em] border border-slate-700 px-4 py-2 rounded-full hover:bg-slate-800 transition-colors">
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );
};
