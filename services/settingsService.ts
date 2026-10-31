import { AudioSettings } from '../types';
import { safeGet, safeSet } from './storage';

const KEY = 'historical_champions_settings_v1';
export const DEFAULT_SETTINGS: AudioSettings = { musicEnabled: true, musicVolume: 0.5, voiceVolume: 1, sfxVolume: 1 };

const clamp01 = (n: unknown, d: number) => (typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : d);

export const sanitizeSettings = (raw: unknown): AudioSettings => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    musicEnabled: typeof r.musicEnabled === 'boolean' ? r.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
    musicVolume: clamp01(r.musicVolume, DEFAULT_SETTINGS.musicVolume),
    voiceVolume: clamp01(r.voiceVolume, DEFAULT_SETTINGS.voiceVolume),
    sfxVolume: clamp01(r.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
  };
};

let current: AudioSettings = (() => {
  const s = safeGet(KEY);
  if (!s) return { ...DEFAULT_SETTINGS };
  try { return sanitizeSettings(JSON.parse(s)); } catch { return { ...DEFAULT_SETTINGS }; }
})();
const listeners = new Set<(s: AudioSettings) => void>();

export const getSettings = (): AudioSettings => current;
export const updateSettings = (patch: Partial<AudioSettings>) => {
  current = sanitizeSettings({ ...current, ...patch });
  safeSet(KEY, JSON.stringify(current));
  listeners.forEach((l) => l(current));
};
export const subscribeSettings = (fn: (s: AudioSettings) => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
