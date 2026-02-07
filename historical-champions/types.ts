// Copy everything below this line
export enum ScreenState {
  MAIN_MENU = 'MAIN_MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  STORY_INTRO = 'STORY_INTRO',
  COMBAT = 'COMBAT',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export enum CharacterId {
  SALAHUDDIN = 'salahuddin',
  BALDWIN_IV = 'baldwin_iv',
  REYNALD = 'reynald',
  GUY = 'guy',
  BALIAN = 'balian',
  NOORUDDIN = 'nooruddin',
  SHIRKUH = 'shirkuh',
  BORI = 'bori'
}

export enum CombatState {
  IDLE = 'idle',
  MOVING_FORWARD = 'moving_fwd',
  MOVING_BACK = 'moving_back',
  JUMPING = 'jumping',
  ATTACK_LIGHT = 'attack_light',
  ATTACK_MEDIUM = 'attack_medium',
  ATTACK_HEAVY = 'attack_heavy',
  BLOCKING = 'blocking',
  HIT_STUN = 'hit_stun',
  KNOCKBACK = 'knockback',
  SPECIAL = 'special',
  VICTORY = 'victory',
  DEFEAT = 'defeat'
}

export interface Stats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
}

export interface CharacterData {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  price: number;
  isPremium: boolean;
  baseStats: Stats;
  imageSrc: string; // Idle/Move sprite
  attackImageSrc: string; // Action sprite
  portraitSrc: string; // Icon
  scale?: number; 
  voiceSrc?: string; // Character voice line URL
}

export interface PlayerState {
  coins: number;
  unlockedCharacters: CharacterId[];
  selectedCharacterId: CharacterId;
}

export interface BattleStats {
  winnerId: CharacterId;
  loserId: CharacterId;
  remainingHpPercentage: number;
  maxCombo: number;
  durationSeconds: number;
}

export interface CombatEntity {
  id: string;
  characterId: CharacterId;
  currentHp: number;
  maxHp: number;
  power: number; // 0-100
  position: number; // 0-100% of screen width
  state: CombatState;
  direction: 1 | -1; // 1 = facing right, -1 = facing left
}
// Copy everything above this line