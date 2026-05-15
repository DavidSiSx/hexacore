/**
 * Contrato para la estructura de un set de Smogon.
 */
export interface SmogonSet {
  items?: string[];
  movesets?: string[][];
  abilities?: string[];
  natures?: string[];
  evs?: Record<string, number>;
  ivs?: Record<string, number>;
}

/**
 * Servicio de utilidad para normalizar y formatear datos provenientes de Smogon.
 */
export class SmogonDataParser {
  /**
   * Genera una cadena descriptiva legible de los conjuntos competitivos.
   */
  public static formatSetsDetails(smogonSets: Record<string, Record<string, SmogonSet>>): string {
    let details = '';
    for (const [format, setsObj] of Object.entries(smogonSets)) {
      details += `Format ${format} sets: `;
      for (const [setName, setInfo] of Object.entries(setsObj)) {
        const itemNames = Array.isArray(setInfo.items) ? setInfo.items.join('/') : '';
        const moveNames = Array.isArray(setInfo.movesets) 
          ? setInfo.movesets.map(move => Array.isArray(move) ? move.join('/') : String(move)).join(', ') 
          : '';
        details += `[Set: ${setName}, Items: ${itemNames}, Moves: ${moveNames}] `;
      }
    }
    return details;
  }
}
