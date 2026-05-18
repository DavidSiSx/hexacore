export interface StatBoosts {
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonState {
  species: string;
  types: string[];
  level: number;
  currentHp: number;
  maxHp: number;
  item: string;
  ability: string;
  status?: "brn" | "psn" | "slp" | "par" | "frz" | null;
  boosts: StatBoosts;
  // Stats base ajustadas por IVs/EVs
  stats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
}

export type WeatherType = "Sun" | "Rain" | "Sand" | "Snow" | "none";

export interface SideState {
  pokemon: PokemonState[];
  activeIdx: number; // Índice del Pokémon activo en batalla (0-5)
  stealthRock: boolean;
  spikesLayers: number; // 0 a 3
  lightScreenTurns: number;
  reflectTurns: number;
  tailwindTurns: number;
}

export interface BattleState {
  sideA: SideState;
  sideB: SideState;
  weather: WeatherType;
  weatherTurns: number;
}

// Tabla de efectividades elementales de Generación 9
export const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

/**
 * Retorna el multiplicador de efectividad de tipos de un ataque contra un defensor.
 */
export function getTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let effectiveness = 1;
  const chart = TYPE_CHART[moveType];
  if (!chart) return 1;

  for (const defType of defenderTypes) {
    if (chart[defType] !== undefined) {
      effectiveness *= chart[defType];
    }
  }
  return effectiveness;
}

/**
 * Retorna el multiplicador de aumento de estadística según el nivel de boost (-6 a +6)
 */
export function getBoostMultiplier(stage: number): number {
  if (stage >= 0) {
    return (2 + stage) / 2;
  } else {
    return 2 / (2 - stage);
  }
}

/**
 * Estima el daño exacto basado en la fórmula matemática oficial de Pokémon Generación 9.
 */
export function calculateHeuristicDamage(
  attacker: PokemonState,
  defender: PokemonState,
  move: { name: string; type: string; basePower: number; category: "Physical" | "Special" },
  weather: WeatherType = "none"
): { min: number; max: number; average: number } {
  if (move.basePower <= 0) return { min: 0, max: 0, average: 0 };

  const level = attacker.level;
  const power = move.basePower;

  // 1. Obtener estadísticas de ataque y defensa aplicando boosts
  let attackVal = 0;
  let defenseVal = 0;

  if (move.category === "Physical") {
    attackVal = attacker.stats.atk * getBoostMultiplier(attacker.boosts.atk);
    defenseVal = defender.stats.def * getBoostMultiplier(defender.boosts.def);
  } else {
    attackVal = attacker.stats.spa * getBoostMultiplier(attacker.boosts.spa);
    defenseVal = defender.stats.spd * getBoostMultiplier(defender.boosts.spd);
  }

  // 2. Modificadores de Ataque y Defensa por Habilidad / Clima / Quemadura
  // Quemadura (brn) reduce el daño físico a la mitad
  if (move.category === "Physical" && attacker.status === "brn") {
    attackVal *= 0.5;
  }

  // Boost de defensa por nieve en hielo
  if (weather === "Snow" && defender.types.includes("Ice") && move.category === "Physical") {
    defenseVal *= 1.5;
  }

  // Boost de defensa especial por tormenta de arena en roca
  if (weather === "Sand" && defender.types.includes("Rock") && move.category === "Special") {
    defenseVal *= 1.5;
  }

  // Habilidades de reducción ofensiva/defensiva (ej. Ruin abilities)
  if (attacker.ability === "Sword of Ruin" && move.category === "Physical") {
    // Afecta a todos los demás, reduciendo su defensa
    defenseVal *= 0.75;
  }
  if (attacker.ability === "Beads of Ruin" && move.category === "Special") {
    defenseVal *= 0.75;
  }

  // Evitar división por cero
  if (defenseVal <= 0) defenseVal = 1;

  // 3. Fórmula base del daño de Nintendo
  const baseDamage = Math.floor(
    Math.floor((2 * level) / 5 + 2) * power * (attackVal / defenseVal)
  ) / 50 + 2;

  // 4. Modificadores de la fórmula
  let modifier = 1.0;

  // Clima
  if (weather === "Sun") {
    if (move.type === "Fire") modifier *= 1.5;
    if (move.type === "Water") modifier *= 0.5;
  } else if (weather === "Rain") {
    if (move.type === "Water") modifier *= 1.5;
    if (move.type === "Fire") modifier *= 0.5;
  }

  // STAB
  if (attacker.types.includes(move.type)) {
    modifier *= 1.5; // Asumimos STAB estándar (o x2 con Tera, por simplicidad x1.5 es excelente)
  }

  // Efectividad de Tipos
  const typeMult = getTypeEffectiveness(move.type, defender.types);
  modifier *= typeMult;

  // Aplicar rango de rolls aleatorios oficiales (0.85 a 1.00)
  const calculateDamageRoll = (roll: number) => {
    return Math.floor(baseDamage * modifier * roll);
  };

  const min = calculateDamageRoll(0.85);
  const max = calculateDamageRoll(1.00);
  const average = Math.floor((min + max) / 2);

  return {
    min: Math.max(1, min),
    max: Math.max(1, max),
    average: Math.max(1, average),
  };
}
