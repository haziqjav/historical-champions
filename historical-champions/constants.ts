// Copy everything below this line
import { CharacterData, CharacterId } from './types';

// --- CHARACTER ASSETS ---
const IMG_SALAHUDDIN = "https://i.ibb.co/DP96MYsD/Salahuddin.png";
const IMG_SALAHUDDIN_ATK = "https://i.ibb.co/99GW8rCN/salahudin-attack-removebg-preview.png";

const IMG_BALDWIN = "https://i.ibb.co/cXb9rcj4/BALDWIN.png";
const IMG_BALDWIN_ATK = "https://i.ibb.co/PvjMxtZG/baldwin-iv-attack-removebg-preview.png";

const IMG_NOORUDDIN = "https://i.ibb.co/KxrChBQF/NURUDDIN-ZANGI.png";
const IMG_NOORUDDIN_ATK = "https://i.ibb.co/JFw0Jxjm/NURUDDIN-ZANGI-ATTACK-removebg-preview.png";

const IMG_GUY = "https://i.ibb.co/ksnTPwTj/LORD-GUY.png";
const IMG_GUY_ATK = "https://i.ibb.co/QvTQSrmb/lord-guy-attack-removebg-preview.png";

const IMG_BALIAN = "https://i.ibb.co/Myxp9MYp/BALIAN.png";
const IMG_BALIAN_ATK = "https://i.ibb.co/Q7r6MZ9M/balian-attack-removebg-preview.png";

const IMG_REYNALD = "https://i.ibb.co/8CKBhRr/CHatillion.png";
const IMG_REYNALD_ATK = "https://i.ibb.co/JWBS1hZ2/CHATILLION-ATTACK-removebg-preview.png";

const IMG_SHIRKUH = "https://i.ibb.co/8n8qX3x5/SHIRKUH.png";
const IMG_SHIRKUH_ATK = "https://i.ibb.co/fzL4ghLk/shirkuh-attack-removebg-preview.png";

const IMG_BORI = "https://i.ibb.co/1fNMD5hy/BORU.png";
const IMG_BORI_ATK = "https://i.ibb.co/6JgXXx7G/boru-attack-removebg-preview.png";

// --- VOICE ASSETS ---
// Updated to new Catbox links
const VOICE_BALDWIN = "https://files.catbox.moe/mheo99.mp3"; 
const VOICE_SALAHUDDIN = "https://files.catbox.moe/7zr5eg.mp3";
const VOICE_BALIAN = "https://files.catbox.moe/pr7kxu.mp3";
const VOICE_NOORUDDIN = "https://files.catbox.moe/zkh2m2.mp3";
const VOICE_GUY = "https://files.catbox.moe/0vjozl.mp3";
const VOICE_REYNALD = "https://files.catbox.moe/on4ua3.mp3";
const VOICE_SHIRKUH = "https://files.catbox.moe/3sddl5.mp3";
const VOICE_BORI = "https://files.catbox.moe/n3x0zz.mp3";

// --- NARRATOR VOICE ASSETS (PRE-RECORDED FOR CONSISTENCY & NO QUOTAS) ---
// These are placeholder URLs for high-quality, pre-recorded narration.
// In a real production environment, these would be professional voice actor recordings.
export const NARRATOR_CHRONICLE_VOICES = [
  "https://files.catbox.moe/z4h3h8.mp3", // "And so, the victor claimed their rightful place in legend."
  "https://files.catbox.moe/m6f3z3.mp3", // "The echoes of this battle shall forever resonate through time."
  "https://files.catbox.moe/h7v1g1.mp3", // "A new chapter is written, etched in the annals of glory."
  "https://files.catbox.moe/osiqhj.mp3", // generic fallback, example of using intro voices as generic chronicle
  "https://files.catbox.moe/uqyoko.mp3",
  "https://files.catbox.moe/powrtm.mp3",
];

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

// --- MATCHUP INTRO VOICES (Explicitly Defined with provided URLs) ---
// Key format: "characterId1-characterId2" (sorted alphabetically to match MATCHUP_INTRO_TEXTS keys)
export const MATCHUP_INTRO_VOICES_URLS: Record<string, string> = {
  [`${CharacterId.NOORUDDIN}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/ia4va3.mp3",
  [`${CharacterId.BALIAN}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/79afzt.mp3",
  [`${CharacterId.REYNALD}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/uqyoko.mp3",
  [`${CharacterId.SALAHUDDIN}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/j2q9f1.mp3",
  [`${CharacterId.NOORUDDIN}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/6z3978.mp3",
  [`${CharacterId.GUY}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/powrtm.mp3",
  [`${CharacterId.BORI}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/orhjfc.mp3",
  [`${CharacterId.BALIAN}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/vp49jy.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.SALAHUDDIN}`]: "https://files.catbox.moe/osiqhj.mp3",
  [`${CharacterId.BORI}-${CharacterId.NOORUDDIN}`]: "https://files.catbox.moe/7c4egy.mp3", // Combined duplicate
  [`${CharacterId.GUY}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/g1d2gj.mp3",
  [`${CharacterId.GUY}-${CharacterId.NOORUDDIN}`]: "https://files.catbox.moe/lr9dvi.mp3",
  [`${CharacterId.BORI}-${CharacterId.GUY}`]: "https://files.catbox.moe/teqp0a.mp3",
  [`${CharacterId.BALIAN}-${CharacterId.GUY}`]: "https://files.catbox.moe/ggdeyb.mp3",
  [`${CharacterId.REYNALD}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/nyd9hs.mp3",
  [`${CharacterId.NOORUDDIN}-${CharacterId.REYNALD}`]: "https://files.catbox.moe/qzm2hx.mp3",
  [`${CharacterId.GUY}-${CharacterId.REYNALD}`]: "https://files.catbox.moe/jf7pzt.mp3",
  [`${CharacterId.BORI}-${CharacterId.REYNALD}`]: "https://files.catbox.moe/u6u32a.mp3",
  [`${CharacterId.BALIAN}-${CharacterId.REYNALD}`]: "https://files.catbox.moe/y4swha.mp3",
  [`${CharacterId.BORI}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/rpdgqh.mp3", // Combined duplicate
  [`${CharacterId.BALIAN}-${CharacterId.NOORUDDIN}`]: "https://files.catbox.moe/hubhti.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.SHIRKUH}`]: "https://files.catbox.moe/6mors6.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.NOORUDDIN}`]: "https://files.catbox.moe/g30yz5.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.GUY}`]: "https://files.catbox.moe/0x34rm.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.REYNALD}`]: "https://files.catbox.moe/5h135n.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.BORI}`]: "https://files.catbox.moe/e5qksm.mp3",
  [`${CharacterId.BALDWIN_IV}-${CharacterId.BALIAN}`]: "https://files.catbox.moe/rqs5sp.mp3",
  [`${CharacterId.BALIAN}-${CharacterId.BORI}`]: "https://files.catbox.moe/mpi5a4.mp3`,
};


// --- MUSIC ---
export const MUSIC_THEME = "https://files.catbox.moe/zrq7ys.mp3";

// --- ARENA BACKGROUNDS ---
const BG_HATTIN = "https://i.ibb.co/sdHvxJB9/Hattin.jpg";
const BG_KERAK = "https://i.ibb.co/SgTBgQq/Kerak-Castle.jpg";
const BG_MARJ = "https://i.ibb.co/mVNmN1GQ/Marj-Ayyun.jpg";
const BG_BELVOIR = "https://i.ibb.co/WWgHh2h5/Belvoir-Castle.jpg";
const BG_MONTGISARD = "https://i.ibb.co/3m62987Q/Montgisard.jpg";

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
    imageSrc: IMG_SALAHUDDIN, 
    attackImageSrc: IMG_SALAHUDDIN_ATK,
    portraitSrc: IMG_SALAHUDDIN,
    scale: 0.85,
    voiceSrc: VOICE_SALAHUDDIN
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
    imageSrc: IMG_BALDWIN,
    attackImageSrc: IMG_BALDWIN_ATK,
    portraitSrc: IMG_BALDWIN,
    scale: 0.85,
    voiceSrc: VOICE_BALDWIN
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
    imageSrc: IMG_NOORUDDIN,
    attackImageSrc: IMG_NOORUDDIN_ATK,
    portraitSrc: IMG_NOORUDDIN,
    scale: 0.85,
    voiceSrc: VOICE_NOORUDDIN
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
    imageSrc: IMG_BALIAN,
    attackImageSrc: IMG_BALIAN_ATK,
    portraitSrc: IMG_BALIAN,
    scale: 0.85,
    voiceSrc: VOICE_BALIAN
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
    imageSrc: IMG_GUY,
    attackImageSrc: IMG_GUY_ATK,
    portraitSrc: IMG_GUY,
    scale: 0.85,
    voiceSrc: VOICE_GUY
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
    imageSrc: IMG_REYNALD,
    attackImageSrc: IMG_REYNALD_ATK,
    portraitSrc: IMG_REYNALD,
    scale: 0.85,
    voiceSrc: VOICE_REYNALD
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
    imageSrc: IMG_SHIRKUH,
    attackImageSrc: IMG_SHIRKUH_ATK,
    portraitSrc: IMG_SHIRKUH,
    scale: 0.85,
    voiceSrc: VOICE_SHIRKUH
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
    imageSrc: IMG_BORI,
    attackImageSrc: IMG_BORI_ATK,
    portraitSrc: IMG_BORI,
    scale: 0.85,
    voiceSrc: VOICE_BORI
  }
};

export const ARENAS = [
  { id: 'hattin', name: "Horns of Hattin (1187)", image: BG_HATTIN, parallax: 0.5 },
  { id: 'kerak', name: "Kerak Castle (1183)", image: BG_KERAK, parallax: 0.3 },
  { id: 'marjayyun', name: "Marj Ayyun (1179)", image: BG_MARJ, parallax: 0.4 },
  { id: 'belvoir', name: "Belvoir Castle (1182)", image: BG_BELVOIR, parallax: 0.2 },
  { id: 'montgisard', name: "Montgisard (1177)", image: BG_MONTGISARD, parallax: 0.6 }
];
// Copy everything above this line