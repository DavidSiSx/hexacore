/**
 * Resuelve la URL del sprite de un Pokémon.
 * Prioridad: Showdown gen5 animated sprites.
 * Fallback: PokeAPI official artwork.
 */

// Mapa de excepciones de nombres que Showdown usa diferente
const SHOWDOWN_NAME_MAP: Record<string, string> = {
  "dudunsparce-three-segment": "dudunsparce-threesegment",
  "urshifu-rapid-strike-gmax": "urshifu-rapidstrike-gmax",
  "urshifu-rapid-strike": "urshifu-rapidstrike",
  "charizard-mega-x": "charizard-megax",
  "charizard-mega-y": "charizard-megay",
  "mewtwo-mega-x": "mewtwo-megax",
  "mewtwo-mega-y": "mewtwo-megay",
  "venusaur-gmax": "venusaur-gmax",
  "charizard-gmax": "charizard-gmax",
  "blastoise-gmax": "blastoise-gmax",
  "pikachu-gmax": "pikachu-gmax",
  "eevee-gmax": "eevee-gmax",
  "meowth-gmax": "meowth-gmax",
  "gengar-gmax": "gengar-gmax",
  "kingler-gmax": "kingler-gmax",
  "lapras-gmax": "lapras-gmax",
  "snorlax-gmax": "snorlax-gmax",
  "garbodor-gmax": "garbodor-gmax",
  "corviknight-gmax": "corviknight-gmax",
  "orbeetle-gmax": "orbeetle-gmax",
  "drednaw-gmax": "drednaw-gmax",
  "coalossal-gmax": "coalossal-gmax",
  "flapple-gmax": "flapple-gmax",
  "appletun-gmax": "appletun-gmax",
  "sandaconda-gmax": "sandaconda-gmax",
  "toxtricity-gmax": "toxtricity-gmax",
  "centiskorch-gmax": "centiskorch-gmax",
  "hatterene-gmax": "hatterene-gmax",
  "grimmsnarl-gmax": "grimmsnarl-gmax",
  "alcremie-gmax": "alcremie-gmax",
  "copperajah-gmax": "copperajah-gmax",
  "duraludon-gmax": "duraludon-gmax",
  "inteleon-gmax": "inteleon-gmax",
  "cinderace-gmax": "cinderace-gmax",
  "rillaboom-gmax": "rillaboom-gmax",
  "venusaur-gmax": "venusaur-gmax",
  "venusaurgmax": "venusaur-gmax",
  "charizard-gmax": "charizard-gmax",
  "charizardgmax": "charizard-gmax",
  "blastoise-gmax": "blastoise-gmax",
  "blastoisegmax": "blastoise-gmax",
};

// Pokémon cuyo sprite no existe en Showdown (fallback a PokeAPI por número)
const POKEAPI_FALLBACK: Record<string, number> = {
  "tauros-paldea-combat": 10250,
  "tauros-paldea-blaze": 10251,
  "tauros-paldea-aqua": 10252,
  "venusaur-gmax": 10195,
  "charizard-gmax": 10196,
  "blastoise-gmax": 10197,
  "pikachu-gmax": 10198,
  "eevee-gmax": 10199,
  "meowth-gmax": 10200,
  "gengar-gmax": 10201,
  "venusaur-mega": 10033,
  "charizard-mega-x": 10034,
  "charizard-mega-y": 10035,
  "blastoise-mega": 10036,
};

export function getShowdownSpriteUrl(species: string, shiny: boolean = false, animated: boolean = true): string {
  let cleaned = species
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Check if name needs remapping for Showdown
  if (SHOWDOWN_NAME_MAP[cleaned]) {
    cleaned = SHOWDOWN_NAME_MAP[cleaned];
  }

  // Check if this is a known fallback case (no showdown sprite)
  if (POKEAPI_FALLBACK[cleaned]) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? "shiny/" : ""}${POKEAPI_FALLBACK[cleaned]}.png`;
  }

  // Gmax and Mega forms usually only exist in the animated (ani) folder on Showdown
  const isSpecialForm = cleaned.includes("-gmax") || cleaned.includes("-mega");
  const forceAnimated = isSpecialForm ? true : animated;

  // Animated 3D (ani) or Static (dex)
  const path = forceAnimated 
    ? (shiny ? 'ani-shiny' : 'ani') 
    : (shiny ? 'dex-shiny' : 'dex');
  
  const ext = forceAnimated ? 'gif' : 'png';

  return `https://play.pokemonshowdown.com/sprites/${path}/${cleaned}.${ext}`;
}

/** CSS class for a Pokémon type badge */
export function getTypeClass(type: string): string {
  const map: Record<string, string> = {
    Normal: "type-normal", Fire: "type-fire", Water: "type-water",
    Grass: "type-grass", Electric: "type-electric", Ice: "type-ice",
    Fighting: "type-fighting", Poison: "type-poison", Ground: "type-ground",
    Flying: "type-flying", Psychic: "type-psychic", Bug: "type-bug",
    Rock: "type-rock", Ghost: "type-ghost", Dragon: "type-dragon",
    Dark: "type-dark", Steel: "type-steel", Fairy: "type-fairy",
    Stellar: "type-stellar",
  };
  return map[type] || "type-normal";
}

/** All 18 Pokémon types and their translations (Keys in lowercase for resilience) */
export const TYPE_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  normal: { es: "Normal", en: "Normal" },
  fire: { es: "Fuego", en: "Fire" },
  water: { es: "Agua", en: "Water" },
  grass: { es: "Planta", en: "Grass" },
  electric: { es: "Eléctrico", en: "Electric" },
  ice: { es: "Hielo", en: "Ice" },
  fighting: { es: "Lucha", en: "Fighting" },
  poison: { es: "Veneno", en: "Poison" },
  ground: { es: "Tierra", en: "Ground" },
  flying: { es: "Volador", en: "Flying" },
  psychic: { es: "Psíquico", en: "Psychic" },
  bug: { es: "Bicho", en: "Bug" },
  rock: { es: "Roca", en: "Rock" },
  ghost: { es: "Fantasma", en: "Ghost" },
  dragon: { es: "Dragón", en: "Dragon" },
  dark: { es: "Siniestro", en: "Dark" },
  steel: { es: "Acero", en: "Steel" },
  fairy: { es: "Hada", en: "Fairy" },
  stellar: { es: "Estelar", en: "Stellar" },
};

/** Translates a type name safely based on language */
export function translateType(type: string, lang: string): string {
  const normalized = type.toLowerCase();
  const entry = TYPE_TRANSLATIONS[normalized];
  if (!entry) return type;
  return lang === "es" ? entry.es : entry.en;
}

/** All 18 Pokémon types */
export const POKEMON_TYPES = Object.keys(TYPE_TRANSLATIONS).filter(t => t !== "Stellar");

/** All 25 Pokémon natures */
export const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
] as const;

/** Type Effectiveness Chart (Attacker vs Defender) */
export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getEffectiveness(moveType: string, targetTypes: string[]): number {
  let eff = 1;
  const mt = moveType.toLowerCase();
  for (const tt of targetTypes) {
    const t = tt.toLowerCase();
    const mod = TYPE_CHART[mt]?.[t];
    if (mod !== undefined) eff *= mod;
  }
  return eff;
}
