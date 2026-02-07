// Copy everything below this line
import { CharacterId, PlayerState, Stats } from '../types';
import { CHARACTERS } from '../constants';

const STORAGE_KEY = 'historical_champions_save_v2'; // Bumped version to reset save

const INITIAL_STATE: PlayerState = {
  coins: 99999, 
  unlockedCharacters: Object.values(CharacterId), // Unlock ALL characters immediately
  selectedCharacterId: CharacterId.SALAHUDDIN
};

export const loadGame = (): PlayerState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Force unlock all even on loaded saves
    return {
        ...parsed,
        unlockedCharacters: Object.values(CharacterId)
    };
  }
  return INITIAL_STATE;
};

export const saveGame = (state: PlayerState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const calculateDamage = (attackerStats: Stats, defenderStats: Stats, attackType: 'light' | 'medium' | 'heavy' | 'special', isBlocking: boolean): number => {
  let multiplier = 1;
  switch (attackType) {
    case 'light': multiplier = 0.8; break;
    case 'medium': multiplier = 1.0; break;
    case 'heavy': multiplier = 1.5; break;
    case 'special': multiplier = 2.5; break;
  }

  // Critical Hit Check
  const isCrit = Math.random() < attackerStats.critChance;
  if (isCrit) multiplier *= 1.5;

  let damage = (attackerStats.attack * multiplier) - (defenderStats.defense * 0.3);

  if (isBlocking) {
    damage *= 0.2; // Block reduces damage by 80%
  }

  return Math.max(Math.floor(damage), 1); // Minimum 1 damage
};
// Copy everything above this line