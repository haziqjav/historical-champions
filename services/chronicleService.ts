import { BattleStats } from '../types';
import { CHARACTERS } from '../constants';
import { decode, decodeAudioData } from './audioUtils';
import { soundManager } from './soundService';

// AI narration is OPTIONAL. The client never holds a Gemini key: it POSTs battle stats to your own
// proxy (server/chronicle-proxy.mjs) configured via VITE_CHRONICLE_ENDPOINT. Without it (or offline,
// or on error/timeout) the game shows a local chronicle and everything else works normally.

export interface Chronicle {
  text: string;
  source: 'ai' | 'local';
  audio: AudioBuffer | null;
}

export const isAiNarrationConfigured = (): boolean => !!import.meta.env.VITE_CHRONICLE_ENDPOINT;

export function localChronicle(stats: BattleStats): string {
  const w = CHARACTERS[stats.winnerId].name, l = CHARACTERS[stats.loserId].name;
  const pool = [
    `In a clash of steel and will, ${w} emerged victorious, proving their legendary strength against ${l}. The echoes of this battle shall forever resonate through time. Such valor etches their name firmly in history's grand tapestry.`,
    `The dust settles on the battlefield as ${w} stands triumphant, having bested ${l} in honorable combat. A new chapter is written, etched in the annals of glory, proclaiming their undeniable might.`,
    `History will forever remember this day, where ${w} overcame the might of ${l} through skill and determination. Such valor secures their place among the legends, inspiring all who hear their tale.`,
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function generateChronicle(stats: BattleStats, signal?: AbortSignal): Promise<Chronicle> {
  const local = (): Chronicle => ({ text: localChronicle(stats), source: 'local', audio: null });
  const endpoint = import.meta.env.VITE_CHRONICLE_ENDPOINT;
  if (!endpoint) return local();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return local();

  const ctl = new AbortController();
  const timeout = setTimeout(() => ctl.abort(), 15000);
  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
      signal: ctl.signal,
    });
    if (!res.ok) return local();
    const data = (await res.json()) as { text?: string; audioBase64?: string };
    const text = (data.text ?? '').trim();
    if (text.length < 40) return local();
    let audio: AudioBuffer | null = null;
    if (data.audioBase64) {
      const ctx = soundManager.getAudioContext();
      if (ctx) { try { audio = await decodeAudioData(decode(data.audioBase64), ctx, 24000, 1); } catch { audio = null; } }
    }
    return { text, source: 'ai', audio };
  } catch {
    return local();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}
