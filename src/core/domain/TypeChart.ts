/**
 * Perfil inmutable con el cálculo de resistencias, debilidades e inmunidades de un Pokémon.
 */
export interface DefensiveProfile {
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

/**
 * Servicio de dominio puro para resolver efectividades de tipos en el metajuego.
 * Lógica 100% libre de efectos secundarios y desacoplada de la capa de persistencia.
 */
export class TypeChartService {
  private static readonly TYPE_CHART: Record<string, Record<string, number>> = {
    Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
    Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground:   { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying:   { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
    Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
    Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
    Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
    Fairy:    { Fire: 0.5, Poison: 0.5, Fighting: 2, Dragon: 2, Dark: 2, Steel: 0.5 },
  };

  private static readonly ALL_TYPES: string[] = Object.keys(TypeChartService.TYPE_CHART);

  /**
   * Calcula el multiplicador defensivo total contra todos los tipos posibles.
   * Utiliza cláusulas de guarda y variables fuertemente tipadas.
   * 
   * @param types Tipos elementales del Pokémon defensor
   * @returns Perfil con las listas de debilidades (>=2), resistencias (<1) e inmunidades (==0)
   */
  public static calculateDefensiveProfile(types: string[]): DefensiveProfile {
    const weaknesses: string[] = [];
    const resistances: string[] = [];
    const immunities: string[] = [];

    if (!types || types.length === 0) {
      return { weaknesses, resistances, immunities };
    }

    for (const atkType of TypeChartService.ALL_TYPES) {
      let multiplier = 1;

      for (const defType of types) {
        const chart = TypeChartService.TYPE_CHART[atkType];
        if (chart && chart[defType] !== undefined) {
          multiplier *= chart[defType];
        }
      }

      if (multiplier === 0) {
        immunities.push(atkType);
      } else if (multiplier >= 2) {
        weaknesses.push(atkType);
      } else if (multiplier < 1) {
        resistances.push(atkType);
      }
    }

    return { weaknesses, resistances, immunities };
  }
}
