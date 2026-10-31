import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScreenState, PlayerState, CharacterId, BattleStats, ArenaData } from './types';
import { loadGame, saveGame } from './services/gameService';
import { soundManager } from './services/soundService';
import { CHARACTERS, MUSIC_THEME, ARENAS, MATCHUP_INTRO_TEXTS, MATCHUP_INTRO_VOICES_URLS, matchupKey } from './constants';
import { preloadImages, releaseImages } from './services/assets';
import { Chronicle, generateChronicle } from './services/chronicleService';
import { subscribeLifecycle } from './services/platform';
import { useViewport } from './hooks/useViewport';
import { CombatScene } from './components/Combat/CombatScene';
import { MainMenu } from './screens/MainMenu';
import { CharacterSelect } from './screens/CharacterSelect';
import { NarrativeScreen } from './screens/NarrativeScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsPanel } from './components/ui/SettingsPanel';
import { RotateOverlay } from './components/ui/RotateOverlay';
import { LoadingScreen } from './components/ui/LoadingScreen';

const matchupData = (a: CharacterId, b: CharacterId) => {
  const key = matchupKey(a, b);
  return {
    text: MATCHUP_INTRO_TEXTS[key] || `A fierce battle is about to commence between ${CHARACTERS[a].name} and ${CHARACTERS[b].name}.`,
    voiceUrl: MATCHUP_INTRO_VOICES_URLS[key] || '',
  };
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.MAIN_MENU);
  const [player, setPlayer] = useState<PlayerState>(loadGame);
  const [enemyId, setEnemyId] = useState<CharacterId>(CharacterId.REYNALD);
  const [arena, setArena] = useState<ArenaData>(ARENAS[0]);
  const [musicMuted, setMusicMuted] = useState(soundManager.isMusicMuted);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [backgrounded, setBackgrounded] = useState(false);
  const [backSignal, setBackSignal] = useState(0);
  const [stats, setStats] = useState<BattleStats | null>(null);
  const [chronicle, setChronicle] = useState<Chronicle | null>(null);
  const [introText, setIntroText] = useState({ text: '', voiceUrl: '' });
  const viewport = useViewport();

  const lastOpponent = useRef<CharacterId | null>(null);
  const lastArena = useRef<string | null>(null);
  const chronicleAbort = useRef<AbortController | null>(null);
  const battleAssets = useRef<string[]>([]);

  // Persist progress (only when it changes).
  useEffect(() => { saveGame(player); }, [player]);

  // Boot: preload only what the menus need (8 portraits + menu backdrop), then show the game.
  useEffect(() => {
    const urls = [...Object.values(CHARACTERS).map((c) => c.portraitSrc), ARENAS[0].image];
    let alive = true;
    preloadImages(urls, (d, t) => alive && setBootProgress(d / t)).then(() => { if (alive) setBooted(true); });
    soundManager.playTheme(MUSIC_THEME); // starts after the first tap (browser/WebView autoplay rule)
    const idle = window.setTimeout(() => soundManager.preloadCharacterVoices(Object.values(CHARACTERS).map((c) => c.voiceSrc || '')), 600);
    return () => { alive = false; clearTimeout(idle); };
  }, []);

  // Back button + backgrounding. Handlers read the latest state through a ref.
  const stateRef = useRef({ screen, settingsOpen });
  stateRef.current = { screen, settingsOpen };
  const goSelect = useCallback((resumeTheme = true) => {
    chronicleAbort.current?.abort();
    soundManager.stopVoice();
    if (resumeTheme) soundManager.playTheme(MUSIC_THEME);
    setScreen(ScreenState.CHARACTER_SELECT);
  }, []);
  useEffect(() => subscribeLifecycle({
    onBack: () => {
      const { screen: s, settingsOpen: open } = stateRef.current;
      if (open) { setSettingsOpen(false); return true; }
      switch (s) {
        case ScreenState.COMBAT: setBackSignal((n) => n + 1); return true;
        case ScreenState.STORY_INTRO: case ScreenState.VICTORY: case ScreenState.DEFEAT: goSelect(); return true;
        case ScreenState.CHARACTER_SELECT: setScreen(ScreenState.MAIN_MENU); return true;
        default: return false; // main menu: let the platform exit the app
      }
    },
    onBackground: () => { setBackgrounded(true); soundManager.suspendAll(); },
    onForeground: () => { setBackgrounded(false); soundManager.resumeAll(); },
  }), [goSelect]);

  const toggleMusic = () => { setMusicMuted(soundManager.toggleMusic()); soundManager.playSelect(); };

  const handleSelect = (id: CharacterId) => {
    const c = CHARACTERS[id];
    if (c.voiceSrc) soundManager.playCharacterVoice(c.voiceSrc); else soundManager.playSelect();
    setPlayer((p) => (p.selectedCharacterId === id ? p : { ...p, selectedCharacterId: id }));
  };

  const startCombatSequence = (forcedEnemy?: CharacterId) => {
    soundManager.unlockAudio();
    soundManager.playSelect();
    soundManager.stopVoice();
    chronicleAbort.current?.abort();

    let next = forcedEnemy;
    if (!next) {
      const pool = Object.values(CHARACTERS).filter((c) => c.id !== player.selectedCharacterId);
      const fresh = pool.filter((c) => c.id !== lastOpponent.current);
      const from = fresh.length ? fresh : pool;
      next = from[Math.floor(Math.random() * from.length)].id;
    }
    const arenas = ARENAS.filter((a) => a.id !== lastArena.current);
    const nextArena = arenas[Math.floor(Math.random() * arenas.length)];
    lastOpponent.current = next; lastArena.current = nextArena.id;

    releaseImages(battleAssets.current);
    battleAssets.current = [CHARACTERS[player.selectedCharacterId].attackImageSrc, CHARACTERS[next].attackImageSrc, nextArena.image];

    setEnemyId(next); setArena(nextArena);
    setStats(null); setChronicle(null);
    setIntroText(matchupData(player.selectedCharacterId, next));
    setScreen(ScreenState.STORY_INTRO);
  };

  const handleIntroDone = useCallback((skipped: boolean) => {
    soundManager.stopTheme(skipped ? 500 : 1500);
    setScreen(ScreenState.COMBAT);
  }, []);

  const handleCombatEnd = useCallback((victory: boolean, s: BattleStats) => {
    soundManager.stopVoice();
    setStats(s);
    setChronicle(null);
    setScreen(victory ? ScreenState.VICTORY : ScreenState.DEFEAT);
    chronicleAbort.current?.abort();
    const ac = new AbortController(); chronicleAbort.current = ac;
    generateChronicle(s, ac.signal).then((c) => { if (!ac.signal.aborted) setChronicle(c); });
  }, []);

  const quitCombat = useCallback(() => { goSelect(); }, [goSelect]);

  if (!booted) return <LoadingScreen progress={bootProgress} label="Gathering the armies" />;

  const isPortrait = viewport.isPortrait;
  let view: React.ReactNode;
  switch (screen) {
    case ScreenState.MAIN_MENU:
      view = <MainMenu onStart={() => { soundManager.playSelect(); setScreen(ScreenState.CHARACTER_SELECT); }} onSettings={() => setSettingsOpen(true)} musicMuted={musicMuted} onToggleMusic={toggleMusic} />;
      break;
    case ScreenState.STORY_INTRO:
      view = <NarrativeScreen key={`${player.selectedCharacterId}-${enemyId}-${arena.id}`} player={CHARACTERS[player.selectedCharacterId]} enemy={CHARACTERS[enemyId]} arena={arena} text={introText.text} voiceUrl={introText.voiceUrl} onDone={handleIntroDone} />;
      break;
    case ScreenState.COMBAT:
      view = (
        <div className="fixed inset-0 overflow-hidden">
          <CombatScene key={`${player.selectedCharacterId}-${enemyId}-${arena.id}`} playerCharacterId={player.selectedCharacterId} enemyCharacterId={enemyId} arena={arena}
            forcePause={backgrounded || isPortrait} backSignal={backSignal} showTouchControls={viewport.isTouch}
            onBattleEnd={handleCombatEnd} onQuit={quitCombat} onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      );
      break;
    case ScreenState.VICTORY:
    case ScreenState.DEFEAT:
      view = <ResultScreen isWin={screen === ScreenState.VICTORY} stats={stats} chronicle={chronicle} onRematch={() => startCombatSequence(enemyId)} onRoster={() => goSelect()} />;
      break;
    default:
      view = <CharacterSelect selectedId={player.selectedCharacterId} onSelect={handleSelect} onFight={() => startCombatSequence()}
        onBack={() => setScreen(ScreenState.MAIN_MENU)} onSettings={() => setSettingsOpen(true)} musicMuted={musicMuted} onToggleMusic={toggleMusic} isTouch={viewport.isTouch} />;
  }

  return (
    <>
      {view}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {screen === ScreenState.COMBAT && isPortrait && <RotateOverlay />}
    </>
  );
};

export default App;
