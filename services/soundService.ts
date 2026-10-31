import { SWORD_SFX } from '../constants';
import { getSettings, subscribeSettings, updateSettings } from './settingsService';
import { AudioSettings } from '../types';

// ---------------------------------------------------------------------------------------
// Audio for Historical Champions.
//  * Music  : streamed through one looping HTMLAudioElement (the original decoded the whole
//             181 s track into an AudioBuffer: ~64 MB of PCM, risky on low-RAM phones).
//  * SFX    : tiny sword clip decoded once and played via Web Audio (low latency, overlap OK);
//             synthesized fallbacks if it cannot load.
//  * Voices : ONE voice channel - character lines, narration and AI narration stop each other.
//  * A global first-gesture listener unlocks audio (browsers/WebViews block it until then).
// ---------------------------------------------------------------------------------------

const MUSIC_BASE = 0.8; // slider 0.5 (default) -> 0.4 = original BGM volume
const DUCK_LEVEL = 0.4;
const MAX_SFX_VOICES = 8;

export interface VoiceHandlers {
  onStart?: (durationSec: number) => void;
  onEnd?: () => void;
  /** Asset missing/undecodable or autoplay blocked: caller should fall back (e.g. timed text). */
  onError?: () => void;
  duck?: boolean;
}

const warned = new Set<string>();
const warnOnce = (key: string, ...args: unknown[]) => { if (!warned.has(key)) { warned.add(key); console.warn(...args); } };

class SoundManager {
  private static instance: SoundManager;

  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private swordBuf: AudioBuffer | null = null;
  private swordLoading: Promise<void> | null = null;
  private activeSfx = 0;

  private settings: AudioSettings = getSettings();
  private gestureSeen = false;

  private music: HTMLAudioElement | null = null;
  private musicUrl: string | null = null;
  private fadeLevel = 0;
  private duckLevel = 1;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private duckTimer: ReturnType<typeof setInterval> | null = null;
  private musicSuspended = false;

  private voiceToken = 0;
  private activeVoiceStop: (() => void) | null = null;
  private voiceEl: HTMLAudioElement | null = null;
  private charVoices = new Map<string, HTMLAudioElement>();

  private constructor() {
    subscribeSettings((s) => this.applySettings(s));
    if (typeof window !== 'undefined') {
      const handler = () => this.unlockAudio();
      for (const ev of ['pointerdown', 'touchend', 'keydown', 'click'] as const) {
        window.addEventListener(ev, handler, { passive: true, capture: true });
      }
    }
  }

  static getInstance(): SoundManager { return (SoundManager.instance ??= new SoundManager()); }

  // ---- context / unlock
  private getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try { this.ctx = new Ctor({ latencyHint: 'interactive' }); } catch { try { this.ctx = new Ctor(); } catch { return null; } }
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.settings.sfxVolume; this.sfxGain.connect(this.ctx.destination);
    this.voiceGain = this.ctx.createGain(); this.voiceGain.gain.value = this.settings.voiceVolume; this.voiceGain.connect(this.ctx.destination);
    return this.ctx;
  }

  getAudioContext(): AudioContext | null { return this.getContext(); }

  /** Idempotent; resumes the context and starts any pending music. */
  unlockAudio() {
    this.gestureSeen = true;
    const ctx = this.getContext();
    if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => undefined);
    void this.loadSword();
    if (this.musicUrl && this.settings.musicEnabled && !this.musicSuspended) this.ensureMusicPlaying();
  }

  // ---- settings
  private applySettings(s: AudioSettings) {
    const prev = this.settings;
    this.settings = s;
    if (this.sfxGain) this.sfxGain.gain.value = s.sfxVolume;
    if (this.voiceGain) this.voiceGain.gain.value = s.voiceVolume;
    if (this.voiceEl) this.voiceEl.volume = s.voiceVolume;
    this.charVoices.forEach((a) => { a.volume = s.voiceVolume; });
    if (prev.musicEnabled !== s.musicEnabled) {
      if (s.musicEnabled) { if (this.musicUrl && this.gestureSeen) this.ensureMusicPlaying(); }
      else this.rampFade(0, 150, () => this.music?.pause());
    }
    this.applyMusicVolume();
  }

  get isMusicMuted(): boolean { return !this.settings.musicEnabled; }

  /** Returns the new muted state. */
  toggleMusic(): boolean {
    updateSettings({ musicEnabled: !this.settings.musicEnabled });
    return !this.settings.musicEnabled;
  }

  // ---- music
  private applyMusicVolume() {
    if (!this.music) return;
    this.music.volume = Math.max(0, Math.min(1, this.settings.musicVolume * MUSIC_BASE * this.fadeLevel * this.duckLevel));
  }

  private rampFade(to: number, ms: number, done?: () => void) {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const from = this.fadeLevel; const t0 = performance.now();
    if (ms <= 0) { this.fadeLevel = to; this.applyMusicVolume(); this.fadeTimer = null; done?.(); return; }
    this.fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      this.fadeLevel = from + (to - from) * k; this.applyMusicVolume();
      if (k >= 1) { clearInterval(this.fadeTimer!); this.fadeTimer = null; done?.(); }
    }, 33);
  }

  private rampDuck(to: number, ms: number) {
    if (this.duckTimer) clearInterval(this.duckTimer);
    const from = this.duckLevel; const t0 = performance.now();
    this.duckTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      this.duckLevel = from + (to - from) * k; this.applyMusicVolume();
      if (k >= 1) { clearInterval(this.duckTimer!); this.duckTimer = null; }
    }, 33);
  }

  private ensureMusicPlaying() {
    if (!this.musicUrl || !this.settings.musicEnabled) return;
    if (!this.music) {
      this.music = new Audio();
      this.music.loop = true;
      this.music.preload = 'auto';
      this.music.addEventListener('error', () => warnOnce('music-error', 'Background music failed to load; continuing without it.'));
    }
    const m = this.music;
    if (m.dataset.url !== this.musicUrl) { m.src = this.musicUrl; m.dataset.url = this.musicUrl; }
    if (!m.paused) { this.rampFade(1, 600); return; }
    this.applyMusicVolume();
    const p = m.play();
    if (p) p.then(() => this.rampFade(1, 1000)).catch(() => { /* blocked until next gesture */ });
    else this.rampFade(1, 1000);
  }

  playTheme(url: string) {
    if (this.musicUrl !== url && this.music) { this.music.pause(); delete this.music.dataset.url; this.fadeLevel = 0; }
    this.musicUrl = url;
    if (this.gestureSeen && !this.musicSuspended) this.ensureMusicPlaying();
  }

  stopTheme(fadeMs = 0) {
    this.musicUrl = null;
    const m = this.music;
    if (!m) return;
    this.rampFade(0, fadeMs, () => { if (this.musicUrl === null) m.pause(); });
  }

  // ---- lifecycle
  suspendAll() {
    this.musicSuspended = true;
    this.music?.pause();
    this.voiceEl?.pause();
    this.charVoices.forEach((a) => a.pause());
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend().catch(() => undefined);
  }

  resumeAll() {
    this.musicSuspended = false;
    if (this.ctx && this.ctx.state !== 'running') void this.ctx.resume().catch(() => undefined);
    if (this.gestureSeen && this.musicUrl) this.ensureMusicPlaying();
  }

  // ---- voices (single channel)
  stopVoice() {
    this.voiceToken++;
    const stop = this.activeVoiceStop; this.activeVoiceStop = null;
    stop?.();
    this.rampDuck(1, 300);
  }

  private beginVoice(duck: boolean): number {
    this.stopVoice();
    if (duck) this.rampDuck(DUCK_LEVEL, 200);
    return this.voiceToken;
  }

  private playElement(el: HTMLAudioElement, h: VoiceHandlers): () => void {
    const token = this.beginVoice(h.duck ?? true);
    const ac = new AbortController();
    let finished = false;
    let guard: ReturnType<typeof setTimeout> | null = null;
    const finish = (kind: 'end' | 'error' | 'cancel') => {
      if (finished) return; finished = true;
      ac.abort(); if (guard) clearTimeout(guard);
      try { el.pause(); } catch { /* ignore */ }
      if (this.voiceToken === token) { this.activeVoiceStop = null; this.rampDuck(1, 600); }
      if (kind === 'end') h.onEnd?.(); else if (kind === 'error') h.onError?.();
    };
    this.activeVoiceStop = () => finish('cancel');

    el.volume = this.settings.voiceVolume;
    try { el.currentTime = 0; } catch { /* not seekable yet */ }
    el.addEventListener('playing', () => { if (guard) { clearTimeout(guard); guard = null; } h.onStart?.(el.duration); }, { signal: ac.signal, once: true });
    el.addEventListener('ended', () => finish('end'), { signal: ac.signal });
    el.addEventListener('error', () => { warnOnce('voice:' + el.src, 'Voice failed to load:', el.src); finish('error'); }, { signal: ac.signal });
    guard = setTimeout(() => finish('error'), 8000);

    const p = el.play();
    if (p) p.catch(() => finish('error'));
    return () => { if (this.voiceToken === token) this.stopVoice(); };
  }

  playCharacterVoice(url: string, h: VoiceHandlers = {}): () => void {
    if (!url) { h.onError?.(); return () => undefined; }
    let el = this.charVoices.get(url);
    if (!el) { el = new Audio(url); el.preload = 'auto'; this.charVoices.set(url, el); }
    return this.playElement(el, { duck: false, ...h });
  }

  preloadCharacterVoices(urls: string[]) {
    for (const url of urls) {
      if (!url || this.charVoices.has(url)) continue;
      const a = new Audio(); a.preload = 'auto'; a.src = url; this.charVoices.set(url, a);
    }
  }

  playNarratorVoice(url: string, h: VoiceHandlers = {}): () => void {
    if (!url) { h.onError?.(); return () => undefined; }
    if (!this.voiceEl) { this.voiceEl = new Audio(); this.voiceEl.preload = 'auto'; }
    const el = this.voiceEl;
    if (el.dataset.url !== url) { el.src = url; el.dataset.url = url; }
    return this.playElement(el, { duck: true, ...h });
  }

  playGeneratedAudio(buffer: AudioBuffer, h: VoiceHandlers = {}): () => void {
    const ctx = this.getContext();
    if (!ctx || !this.voiceGain) { h.onError?.(); return () => undefined; }
    const token = this.beginVoice(h.duck ?? true);
    let finished = false;
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.connect(this.voiceGain);
    const finish = (kind: 'end' | 'cancel') => {
      if (finished) return; finished = true;
      src.onended = null;
      try { src.stop(); } catch { /* already stopped */ }
      try { src.disconnect(); } catch { /* ignore */ }
      if (this.voiceToken === token) { this.activeVoiceStop = null; this.rampDuck(1, 600); }
      if (kind === 'end') h.onEnd?.();
    };
    src.onended = () => finish('end');
    this.activeVoiceStop = () => finish('cancel');
    try {
      if (ctx.state !== 'running') void ctx.resume().catch(() => undefined);
      src.start(0); h.onStart?.(buffer.duration);
    } catch { finish('cancel'); h.onError?.(); }
    return () => { if (this.voiceToken === token) this.stopVoice(); };
  }

  // ---- SFX
  private loadSword(): Promise<void> {
    if (this.swordBuf || this.swordLoading) return this.swordLoading ?? Promise.resolve();
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();
    this.swordLoading = fetch(SWORD_SFX)
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { this.swordBuf = buf; })
      .catch(() => { warnOnce('sword', 'Sword SFX failed to load; using synthesized fallback.'); this.swordLoading = null; });
    return this.swordLoading;
  }

  private tone(freq: number, type: OscillatorType, duration: number, vol = 0.1, slideTo?: number) {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain || ctx.state !== 'running') return;
    try {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      const t = ctx.currentTime;
      osc.type = type; osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(g); g.connect(this.sfxGain);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t); osc.stop(t + duration + 0.02);
    } catch { /* best-effort */ }
  }

  playAttack() {
    const ctx = this.getContext();
    if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => undefined);
    if (ctx && this.swordBuf && this.sfxGain && ctx.state === 'running' && this.activeSfx < MAX_SFX_VOICES) {
      try {
        const s = ctx.createBufferSource();
        s.buffer = this.swordBuf; s.playbackRate.value = 0.94 + Math.random() * 0.14;
        s.connect(this.sfxGain);
        this.activeSfx++;
        s.onended = () => { this.activeSfx = Math.max(0, this.activeSfx - 1); try { s.disconnect(); } catch { /* ignore */ } };
        s.start(0);
        return;
      } catch { /* fall through */ }
    }
    this.tone(150, 'square', 0.1);
  }

  playHit() { this.tone(110, 'triangle', 0.14, 0.22, 45); }
  playBlock() { this.tone(100, 'sawtooth', 0.1, 0.1); }
  playSelect() { this.tone(800, 'sine', 0.05); }
  playSpecial() { this.tone(100, 'sawtooth', 0.8, 0.3); }
  playVictory() { this.tone(440, 'sine', 0.4, 0.5); }
}

export const soundManager = SoundManager.getInstance();
