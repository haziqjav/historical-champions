import { CharacterId, PlayerState, Stats } from '../types';
import { safeGet, safeSet } from './storage';

// Same key as before so existing players keep their saved progress.
const STORAGE_KEY = 'historical_champions_save_v2';

const ALL_IDS = Object.values(CharacterId) as CharacterId[];
const makeInitial = (): PlayerState => ({
  coins: 99999,
  unlockedCharacters: [...ALL_IDS], // all characters unlocked (unchanged design)
  selectedCharacterId: CharacterId.SALAHUDDIN,
});

/** Never throws: a missing, corrupt or hand-edited save falls back to defaults instead of a blank screen. */
export const loadGame = (): PlayerState => {
  const initial = makeInitial();
  const stored = safeGet(STORAGE_KEY);
  if (!stored) return initial;
  try {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return initial;
    const selected = ALL_IDS.includes(parsed.selectedCharacterId) ? parsed.selectedCharacterId : initial.selectedCharacterId;
    const coins = typeof parsed.coins === 'number' && Number.isFinite(parsed.coins) ? parsed.coins : initial.coins;
    return { coins, selectedCharacterId: selected, unlockedCharacters: [...ALL_IDS] };
  } catch {
    return initial;
  }
};

export const saveGame = (state: PlayerState): boolean => safeSet(STORAGE_KEY, JSON.stringify(state));

// Kept from the original API (the live combat uses its own per-attack damage values).
export const calculateDamage = (attackerStats: Stats, defenderStats: Stats, attackType: 'light' | 'medium' | 'heavy' | 'special', isBlocking: boolean): number => {
  let multiplier = 1;
  switch (attackType) {
    case 'light': multiplier = 0.8; break;
    case 'medium': multiplier = 1.0; break;
    case 'heavy': multiplier = 1.5; break;
    case 'special': multiplier = 2.5; break;
  }
  if (Math.random() < attackerStats.critChance) multiplier *= 1.5;
  let damage = attackerStats.attack * multiplier - defenderStats.defense * 0.3;
  if (isBlocking) damage *= 0.2;
  return Math.max(Math.floor(damage), 1);
};
