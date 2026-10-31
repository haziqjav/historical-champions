import { ArenaData, CharacterData, CharacterId } from './types';
import manifest from './assets.manifest.json';

// ---------------------------------------------------------------------------------------
// All game art/audio is bundled with the app under public/assets and referenced through the
// manifest (assets.manifest.json). Nothing here depends on ibb.co / catbox.moe any more.
// BASE_URL is './' (see vite.config.ts) so URLs resolve identically in the Vite dev server,
// a deployed web build, and the packaged Capacitor app (https://localhost/).
// ---------------------------------------------------------------------------------------
export const assetUrl = (relPath: string): string => `${import.meta.env.BASE_URL}assets/${relPath}`;

const C = manifest.characters;
const art = (id: CharacterId) => ({
  imageSrc: assetUrl(C[id].idle),
  attackImageSrc: assetUrl(C[id].attack),
  portraitSrc: assetUrl(C[id].idle),
  voiceSrc: assetUrl(C[id].voice),
});

// --- MUSIC / SFX ---
export const MUSIC_THEME = assetUrl(manifest.audio.theme);
export const SWORD_SFX = assetUrl(manifest.audio.sword);

// --- MATCHUP SPECIFIC INTRO TEXTS (FOR DEDICATED NARRATION) ---
// Key format: "characterId1-characterId2" (sorted alphabetically)
export const MATCHUP_INTRO_TEXTS: Record<string, string> = {
  // Salahuddin Ayyubi matchups
  [`${CharacterId.BALDWIN_IV}-${CharacterId.SALAHUDDIN}`]: "The Lion of Islam, Salahuddin, meets the formidable Leper King, Baldwin IV, on the precipice of destiny. A clash of tactical brilliance and unyielding spirit awaits.",
  [`${CharacterId.REYNALD}-${CharacterId.SALAHUDDIN}`]: "Salahuddin, the Sultan of Egypt, faces the audacious Reynald of Châtillon, a provocateur whose actions threaten the very fabric of peace. This battle carries the weight of a generation's grievances.",
  [`${CharacterId.GUY}-${CharacterId.SALAHUDDIN}`]: "The esteemed Salahuddin confronts Guy de Lusignan, whose ambition and recklessness have ignited the flames of war. A decisive victory is paramount for the future of the Holy Land.",
  [`${CharacterId.BALIAN}-${CharacterId.SALAHUDDIN}`]: "Salahuddin, the unifier, meets Balian of Ibelin, the steadfast defender of Jerusalem. This duel is a test of honor and strategic mastery, echoing with the fate of a besieged city.",
  [`${CharacterId.NOORUDDIN}-${CharacterId.SALAHUDDIN}`]: "The legendary Salahuddin faces his revered mentor, Nooruddin Zangi, in a hypothetical clash of titans. Two generations of Islamic leadership meet, a contest of legacy and power.",
  [`${CharacterId.SALAHUDDIN}-${CharacterId.SHIRKUH}`]: "Sultan Salahuddin stands against his esteemed uncle, Shirkuh, the veteran general who paved his path to power. A battle born of alternate histories, where familial bonds are tested by steel.",
  [`${CharacterId.BORI}-${CharacterId.SALAHUDDIN}`]: "Salahuddin prepares to face Bori, the Atabeg of Damascus. A fundamental test of martial prowess, where the future of the Levant may be decided in a single, brutal exchange.",
  
  // Baldwin IV matchups
  [`${CharacterId.BALDWIN_IV}-${CharacterId.REYNALD}`]: "Baldwin IV, the unyielding King, confronts his audacious vassal, Reynald of Châtillon. Loyalty and defiance collide as the will of the crown is challenged by a ruthless knight.",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.GUY}`]: "The ailing King Baldwin IV faces Guy de Lusignan, his conniving brother-in-law. This confrontation is a struggle for the very soul of the Kingdom, pitting duty against ambition.",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.BALIAN}`]: "Baldwin IV, a king fighting against time, meets Balian of Ibelin, the pragmatic and loyal knight. Their combined strength once defended Jerusalem, now they clash in a duel of ideals.",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.NOORUDDIN}`]: "King Baldwin IV, a symbol of Christian resistance, challenges the powerful Nooruddin Zangi, the unifier of the Muslim lands. A clash of empires, where faith and fury ignite.",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.SHIRKUH}`]: "Baldwin IV, the Iron King, faces Shirkuh, the grizzled uncle of Salahuddin. A contest of experience and resolve, where both warriors embody the spirit of their respective eras.",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.BORI}`]: "The Leper King, Baldwin IV, prepares to confront Bori, a seasoned commander from Damascus. This battle is a stark demonstration of military discipline against unwavering courage.",
  
  // Reynald of Châtillon matchups
  [`${CharacterId.GUY}-${CharacterId.REYNALD}`]: "The ruthless Reynald of Châtillon and the ambitious Guy de Lusignan, two figures who shaped the crusader's fate, now turn their blades upon each other. An alliance undone by power.",
  [`${CharacterId.BALIAN}-${CharacterId.REYNALD}`]: "Reynald of Châtillon, the rogue lord, clashes with Balian of Ibelin, the honorable defender. A stark contrast in chivalry and pragmatism, whose outcome will speak volumes.",
  [`${CharacterId.NOORUDDIN}-${CharacterId.REYNALD}`]: "The treacherous Reynald of Châtillon dares to stand against Nooruddin Zangi, the revered champion of Islam. Justice and vengeance will be served in this brutal encounter.",
  [`${CharacterId.REYNALD}-${CharacterId.SHIRKUH}`]: "Reynald of Châtillon, the untamed aggressor, faces Shirkuh, the seasoned general. A battle where impulsive fury meets calculated might, under the scorching desert sun.",
  [`${CharacterId.BORI}-${CharacterId.REYNALD}`]: "The audacious Reynald of Châtillon prepares for combat against Bori, a seasoned commander from Damascus. A test of raw aggression versus disciplined defense, where only one will stand defiant.",

  // Guy de Lusignan matchups
  [`${CharacterId.BALIAN}-${CharacterId.GUY}`]: "Guy de Lusignan, driven by pride, clashes with Balian of Ibelin, driven by duty. A personal duel that reflects the internal struggles tearing apart the Kingdom of Jerusalem.",
  [`${CharacterId.GUY}-${CharacterId.NOORUDDIN}`]: "Guy de Lusignan, the ambitious King Consort, faces the strategic genius of Nooruddin Zangi. A perilous encounter where a kingdom's fate hangs in the balance.",
  [`${CharacterId.GUY}-${CharacterId.SHIRKUH}`]: "Guy de Lusignan, the impetuous leader, stands against Shirkuh, the wise veteran. A harsh lesson in battlefield command, where youth and experience will collide.",
  [`${CharacterId.BORI}-${CharacterId.GUY}`]: "Guy de Lusignan confronts Bori, a fighter representing the Damascus forces. A straightforward contest of strength, proving who holds true dominance.",

  // Balian of Ibelin matchups
  [`${CharacterId.BALIAN}-${CharacterId.NOORUDDIN}`]: "Balian of Ibelin, the honorable knight, stands against Nooruddin Zangi, the unifier. A battle of respect and martial skill, where both warriors fight for their people.",
  [`${CharacterId.BALIAN}-${CharacterId.SHIRKUH}`]: "Balian of Ibelin, the defender, meets Shirkuh, the conqueror. This duel is a clash of defensive fortitude against overwhelming offensive power, defining the limits of resistance.",
  [`${CharacterId.BALIAN}-${CharacterId.BORI}`]: "Balian of Ibelin, the pragmatic leader, prepares to face Bori. A measured encounter where skill and strategy will determine the victor on the open field.",

  // Nooruddin Zangi matchups
  [`${CharacterId.NOORUDDIN}-${CharacterId.SHIRKUH}`]: "Nooruddin Zangi, the revered sultan, faces his loyal general, Shirkuh. A powerful confrontation, showcasing the strength and dedication within the Zangid dynasty.",
  [`${CharacterId.BORI}-${CharacterId.NOORUDDIN}`]: "Nooruddin Zangi, the paragon of Islamic might, meets Bori, a stalwart commander from Damascus. A test of supreme leadership and unwavering courage.",

  // Shirkuh matchups
  [`${CharacterId.BORI}-${CharacterId.SHIRKUH}`]: "Shirkuh, the Lion of the Mountains, confronts Bori, a seasoned warrior. A foundational clash between two experienced generals, each vying for battlefield supremacy."
};

export const CHARACTERS: Record<CharacterId, CharacterData> = {
  [CharacterId.SALAHUDDIN]: {
    id: CharacterId.SALAHUDDIN,
    name: "Salahuddin Ayyubi",
    title: "Sultan of Egypt & Syria",
    description: "A legendary strategist known for his chivalry and tactical genius.",
    rarity: 5,
    price: 10000, 
    isPremium: true,
    baseStats: { health: 1500, attack: 180, defense: 120, speed: 1.2, critChance: 0.3 },
    ...art(CharacterId.SALAHUDDIN),
    scale: 0.85
  },
  [CharacterId.BALDWIN_IV]: {
    id: CharacterId.BALDWIN_IV,
    name: "Baldwin IV",
    title: "The Leper King",
    description: "Possessing an indomitable will, he commands respect despite his affliction.",
    rarity: 5,
    price: 8500, 
    isPremium: true,
    baseStats: { health: 1200, attack: 195, defense: 90, speed: 1.1, critChance: 0.35 },
    ...art(CharacterId.BALDWIN_IV),
    scale: 0.85
  },
  [CharacterId.NOORUDDIN]: {
    id: CharacterId.NOORUDDIN,
    name: "Nooruddin Zangi",
    title: "The Light of Faith",
    description: "A unifying force and mentor to Salahuddin.",
    rarity: 4,
    price: 5000,
    isPremium: false,
    baseStats: { health: 1300, attack: 150, defense: 110, speed: 1.1, critChance: 0.2 },
    ...art(CharacterId.NOORUDDIN),
    scale: 0.85
  },
  [CharacterId.BALIAN]: {
    id: CharacterId.BALIAN,
    name: "Balian of Ibelin",
    title: "Defender of Jerusalem",
    description: "A master of defensive siege tactics and negotiation.",
    rarity: 3,
    price: 3000,
    isPremium: false,
    baseStats: { health: 1400, attack: 130, defense: 150, speed: 0.95, critChance: 0.15 },
    ...art(CharacterId.BALIAN),
    scale: 0.85
  },
  [CharacterId.GUY]: {
    id: CharacterId.GUY,
    name: "Guy de Lusignan",
    title: "King Consort",
    description: "An aggressive knight with heavy strikes but reckless defense.",
    rarity: 3,
    price: 2500,
    isPremium: false,
    baseStats: { health: 1150, attack: 160, defense: 80, speed: 1.0, critChance: 0.25 },
    ...art(CharacterId.GUY),
    scale: 0.85
  },
  [CharacterId.REYNALD]: {
    id: CharacterId.REYNALD,
    name: "Reynald of Châtillon",
    title: "The Prince of Antioch",
    description: "Ruthless and unpredictable, a breaker of truces.",
    rarity: 2,
    price: 1500,
    isPremium: false,
    baseStats: { health: 1000, attack: 155, defense: 70, speed: 1.3, critChance: 0.4 },
    ...art(CharacterId.REYNALD),
    scale: 0.85
  },
  [CharacterId.SHIRKUH]: {
    id: CharacterId.SHIRKUH,
    name: "Asad ad-Din Shirkuh",
    title: "Lion of the Mountains",
    description: "A veteran general and uncle to Salahuddin.",
    rarity: 2,
    price: 1500,
    isPremium: false,
    baseStats: { health: 1400, attack: 120, defense: 130, speed: 0.85, critChance: 0.1 },
    ...art(CharacterId.SHIRKUH),
    scale: 0.85
  },
  [CharacterId.BORI]: {
    id: CharacterId.BORI,
    name: "Bori",
    title: "Atabeg of Damascus",
    description: "A balanced fighter adept at skirmishes.",
    rarity: 1,
    price: 0, 
    isPremium: false,
    baseStats: { health: 1000, attack: 100, defense: 100, speed: 1.0, critChance: 0.2 },
    ...art(CharacterId.BORI),
    scale: 0.85
  }
};

export const ARENAS: ArenaData[] = [
  { id: 'hattin', name: "Horns of Hattin (1187)", image: assetUrl(manifest.arenas.hattin), parallax: 0.5 },
  { id: 'kerak', name: "Kerak Castle (1183)", image: assetUrl(manifest.arenas.kerak), parallax: 0.3 },
  { id: 'marjayyun', name: "Marj Ayyun (1179)", image: assetUrl(manifest.arenas.marjayyun), parallax: 0.4 },
  { id: 'belvoir', name: "Belvoir Castle (1182)", image: assetUrl(manifest.arenas.belvoir), parallax: 0.2 },
  { id: 'montgisard', name: "Montgisard (1177)", image: assetUrl(manifest.arenas.montgisard), parallax: 0.6 }
];

// --- MATCHUP INTRO VOICES ---
// Key format: "characterId1-characterId2" (sorted alphabetically, same as MATCHUP_INTRO_TEXTS).
// Built from the manifest so the 28 recorded narrations stay in lock-step with the files on disk.
export const MATCHUP_INTRO_VOICES_URLS: Record<string, string> = Object.fromEntries(
  (manifest.matchups as string[]).map((key) => [key, assetUrl(`matchups/${key}.mp3`)])
);

export const matchupKey = (a: CharacterId, b: CharacterId): string => [a, b].sort().join('-');
