/**
 * Resuelve la URL del sprite de un Pokémon.
 * Prioridad: Showdown gen5 animated sprites.
 * Fallback: PokeAPI official artwork.
 */

// Mapa de excepciones de nombres que Showdown usa diferente
const SHOWDOWN_NAME_MAP: Record<string, string> = {
  "dudunsparce-three-segment": "dudunsparce-threesegment",
  "urshifu-rapid-strike-gmax": "urshifu-rapidstrike",
  "urshifu-rapid-strike": "urshifu-rapidstrike",
};

// Pokémon cuyo sprite no existe en Showdown (fallback a PokeAPI por número)
const POKEAPI_FALLBACK: Record<string, number> = {
  "tauros-paldea-combat": 10250,
  "tauros-paldea-blaze": 10251,
  "tauros-paldea-aqua": 10252,
};

export function getShowdownSpriteUrl(species: string): string {
  let cleaned = species
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/ /g, "-");

  // Check if this is a known fallback case (no showdown sprite)
  if (POKEAPI_FALLBACK[cleaned]) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${POKEAPI_FALLBACK[cleaned]}.png`;
  }

  // Check if name needs remapping for Showdown
  if (SHOWDOWN_NAME_MAP[cleaned]) {
    cleaned = SHOWDOWN_NAME_MAP[cleaned];
  }

  return `https://play.pokemonshowdown.com/sprites/gen5/${cleaned}.png`;
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

/** All 18 Pokémon types */
export const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
] as const;

/** All 25 Pokémon natures */
export const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
] as const;
