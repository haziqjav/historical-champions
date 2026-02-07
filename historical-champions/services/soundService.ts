// Copy everything below this line
// A simple manager to handle sound triggers for combat impact and UI

// Updated to use the new permanent catbox assets provided
const SWORD_SOUND_URL = "https://files.catbox.moe/tj6g3b.mp3";
// const HIT_IMPACT_URL = "https://files.catbox.moe/tj6g3b.mp3"; // No longer directly used

class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  
  // Audio Pools for SFX
  private swordPool: HTMLAudioElement[] = [];
  private swordIdx = 0;

  // Track the current voice line (character or narrator HTMLAudioElement)
  private currentVoice: HTMLAudioElement | null = null;
  // Track the current voice line played via Web Audio API (for Gemini TTS)
  private currentGeneratedSourceNode: AudioBufferSourceNode | null = null; 

  private voiceCache: Map<string, HTMLAudioElement> = new Map();
  private narratorVoiceCache: Map<string, HTMLAudioElement> = new Map(); // New cache for narrator voices
  
  // Background Music (Web Audio API)
  private bgmBuffer: AudioBuffer | null = null;
  private bgmNode: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private currentBgmUrl: string | null = null;
  
  private _isMusicMuted: boolean = false;
  private readonly BGM_VOLUME = 0.4; // Increased volume for professional game feel

  private constructor() {
    this.swordPool = this.createPool(SWORD_SOUND_URL, 8, 1.0);
  }

  private createPool(url: string, size: number, volume: number): HTMLAudioElement[] {
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < size; i++) {
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.volume = volume;
      audio.preload = 'auto';
      pool.push(audio);
    }
    return pool;
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Expose AudioContext for external decoding
  getAudioContext(): AudioContext | null {
      return this.getContext();
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioContext = new AudioCtor({ latencyHint: 'playback' });
      } catch (e) {
        this.audioContext = new AudioCtor();
      }
    }
    return this.audioContext;
  }

  // Call this on first user interaction
  unlockAudio() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    // Warmup SFX
    const warmup = this.swordPool[0];
    if (warmup) {
        warmup.muted = true;
        warmup.play().then(() => {
            warmup.pause();
            warmup.currentTime = 0;
            warmup.muted = false;
        }).catch(() => {});
    }
    
    if (!this._isMusicMuted && this.currentBgmUrl && !this.bgmNode) {
        this.playTheme(this.currentBgmUrl);
    }
  }

  resumeContext() {
      if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
      }
  }

  private playSynth(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // console.warn("Audio play failed", e);
    }
  }

  stopVoice() {
      // Stop HTML5 Audio (for character and narrator voices)
      if (this.currentVoice) {
          try {
              this.currentVoice.pause();
              this.currentVoice.currentTime = 0;
              this.currentVoice.onended = null; 
          } catch(e) {}
          this.currentVoice = null;
      }
      // Stop Web Audio API (for generated TTS)
      if (this.currentGeneratedSourceNode) {
          try {
              this.currentGeneratedSourceNode.stop();
              this.currentGeneratedSourceNode.onended = null;
          } catch(e) {}
          this.currentGeneratedSourceNode = null;
      }
      // Stop Browser Speech Synthesis (just in case)
      if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // --- BACKGROUND MUSIC METHODS (WEB AUDIO API) ---
  
  get isMusicMuted() {
      return this._isMusicMuted;
  }

  toggleMusic() {
      this._isMusicMuted = !this._isMusicMuted;
      if (this._isMusicMuted) {
          this.stopTheme(0.1, false); 
      } else {
          if (this.currentBgmUrl) {
              this.playTheme(this.currentBgmUrl);
          }
      }
      return this._isMusicMuted;
  }

  async playTheme(url: string) {
      if (this._isMusicMuted) {
          this.currentBgmUrl = url;
          return;
      }

      if (this.currentBgmUrl === url && this.bgmNode) {
          return; 
      }

      const prevUrl = this.currentBgmUrl;
      this.currentBgmUrl = url;
      
      const ctx = this.getContext();

      try {
          if (!this.bgmBuffer || prevUrl !== url) {
              const response = await fetch(url);
              
              if (!response.ok) {
                  throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
              }

              const contentType = response.headers.get('content-type');
              if (contentType && !contentType.includes('audio') && !contentType.includes('octet-stream')) {
                  console.warn(`Warning: Music URL returned ${contentType}, might fail decoding.`);
              }

              const arrayBuffer = await response.arrayBuffer();
              
              try {
                  this.bgmBuffer = await ctx.decodeAudioData(arrayBuffer);
              } catch (decodeErr) {
                  throw new Error("Failed to decode audio data. URL might be an HTML page, not an audio file.");
              }
          }

          this.stopTheme(0.1, false);

          this.startBgmNode(ctx);

      } catch (e) {
          console.error("Failed to play BGM via WebAudio:", e);
          this.currentBgmUrl = null; 
      }
  }

  private startBgmNode(ctx: AudioContext) {
      if (!this.bgmBuffer) return;

      try {
          const source = ctx.createBufferSource();
          source.buffer = this.bgmBuffer;
          source.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(10000, ctx.currentTime); 
          filter.Q.value = 0.7; 

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0, ctx.currentTime); 
          gainNode.gain.linearRampToValueAtTime(this.BGM_VOLUME, ctx.currentTime + 1.0); 

          source.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          source.start(0);

          this.bgmNode = source;
          this.bgmGainNode = gainNode;
      } catch (e) {
          console.warn("Could not start BGM node", e);
      }
  }

  stopTheme(fadeDurationMs: number = 0, clearUrl: boolean = true) {
      if (clearUrl) {
        this.currentBgmUrl = null;
      }

      if (!this.bgmNode || !this.bgmGainNode) {
          this.bgmNode = null;
          this.bgmGainNode = null;
          return;
      }

      const ctx = this.getContext();
      const now = ctx.currentTime;
      const durationSec = fadeDurationMs / 1000;

      try {
          this.bgmGainNode.gain.cancelScheduledValues(now);
          this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, now);

          if (durationSec > 0) {
              this.bgmGainNode.gain.linearRampToValueAtTime(0, now + durationSec);
              this.bgmNode.stop(now + durationSec + 0.1); 
          } else {
              this.bgmGainNode.gain.setValueAtTime(0, now);
              this.bgmNode.stop(now);
          }
      } catch (e) {
          // Node might already be stopped
      }

      this.bgmNode = null;
      this.bgmGainNode = null;
  }

  // --- SFX METHODS ---

  playAttack() { 
    try {
        const sound = this.swordPool[this.swordIdx];
        if(sound) {
            sound.currentTime = 0; 
            sound.volume = 1.0; 
            sound.play().catch(() => { this.playSynth(150, 'square', 0.1); });
            this.swordIdx = (this.swordIdx + 1) % this.swordPool.length;
        }
    } catch (e) {
        this.playSynth(150, 'square', 0.1);
    }
  }

  preloadVoice(url: string) {
      if (!url || this.voiceCache.has(url)) return;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.preload = 'auto';
      this.voiceCache.set(url, audio);
  }

  playCharacterVoice(url: string) {
      if (!url || url.length < 5) return;
      this.stopVoice();

      try {
          let audio = this.voiceCache.get(url);
          
          if (!audio) {
              audio = new Audio(url);
              audio.crossOrigin = "anonymous";
              audio.volume = 1.0; 
              audio.preload = 'auto';
              this.voiceCache.set(url, audio);
          }
          
          audio.currentTime = 0;
          audio.volume = 1.0;
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              playPromise.catch(() => {
                  // console.warn("Autoplay of character voice prevented or URL invalid:", url);
              });
          }
          this.currentVoice = audio;
      } catch (e) {}
  }

  // --- NARRATOR VOICE METHODS (Pre-recorded) ---
  preloadNarratorVoices(urls: string[]) {
      urls.forEach(url => {
          if (!url || this.narratorVoiceCache.has(url)) return;
          const audio = new Audio(url);
          audio.crossOrigin = "anonymous";
          audio.preload = 'auto';
          this.narratorVoiceCache.set(url, audio);
      });
  }

  playNarratorVoice(url: string): HTMLAudioElement | null {
      if (!url || url.length < 5) return null;
      this.stopVoice();

      let audio = this.narratorVoiceCache.get(url);
      if (!audio) {
          audio = new Audio(url);
          audio.crossOrigin = "anonymous";
          audio.preload = 'auto';
          this.narratorVoiceCache.set(url, audio);
      }
      
      audio.currentTime = 0;
      audio.volume = 1.0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(() => {
              console.warn("Autoplay of narrator voice prevented or URL invalid:", url);
          });
      }
      this.currentVoice = audio;

      // Duck background music
      if (this.bgmGainNode && this.audioContext) {
          const ctx = this.audioContext;
          const now = ctx.currentTime;
          this.bgmGainNode.gain.cancelScheduledValues(now);
          this.bgmGainNode.gain.linearRampToValueAtTime(this.BGM_VOLUME * 0.4, now + 0.2);
          // Only ramp up if this voice is truly finished
          audio.onended = () => {
              if (this.currentVoice === audio && this.bgmGainNode && this.audioContext) {
                  this.bgmGainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
                  this.bgmGainNode.gain.linearRampToValueAtTime(this.BGM_VOLUME, this.audioContext.currentTime + 1.0);
              }
              audio.onended = null;
          };
      }
      return audio;
  }

  // --- NEW: Play Gemini Generated Audio (Web Audio API) ---
  playGeneratedAudio(buffer: AudioBuffer) {
      if (!buffer) return;
      this.stopVoice(); // Stop any other voices (HTMLAudioElement or previous generated)

      const ctx = this.getContext();
      if (!ctx) {
          console.error("AudioContext not available to play generated audio.");
          return;
      }

      try {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination); // Connect directly to destination for simplicity
          
          // Duck background music when generated audio speaks
          if (this.bgmGainNode) {
              const now = ctx.currentTime;
              this.bgmGainNode.gain.cancelScheduledValues(now);
              this.bgmGainNode.gain.linearRampToValueAtTime(this.BGM_VOLUME * 0.4, now + 0.2); // Fade to 40%
              source.onended = () => {
                  if (this.currentGeneratedSourceNode === source && this.bgmGainNode) { // Check if this specific source just ended
                      this.bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
                      this.bgmGainNode.gain.linearRampToValueAtTime(this.BGM_VOLUME, ctx.currentTime + 1.0); // Fade back up
                  }
                  source.onended = null;
              };
          }

          source.start(0);
          this.currentGeneratedSourceNode = source; // Track this node
      } catch (e) {
          console.error("Failed to play generated audio via Web Audio API:", e);
      }
  }


  playHit() { /* Sound is triggered by impact logic if needed, currently reusing attack pool or impact pool logic */ }
  playBlock() { this.playSynth(100, 'sawtooth', 0.1, 0.1); } 
  playSelect() { this.playSynth(800, 'sine', 0.05); }
  playSpecial() { this.playSynth(100, 'sawtooth', 0.8, 0.3); }
  playVictory() { this.playSynth(440, 'sine', 0.4, 0.5); }
}

export const soundManager = SoundManager.getInstance();
// Copy everything above this line