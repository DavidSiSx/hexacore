/**
 * Contrato estricto de entrada para los metadatos brutos de una especie.
 * Permite eliminar el uso de 'any' garantizando un tipado fuerte.
 */
export interface SpeciesMetadata {
  id: string;
  name: string;
  gen: number;
  tags?: string[];
  isNonstandard?: string | null;
  isMega?: boolean;
  isPrimal?: boolean;
  canGigantamax?: string | null;
  forme?: string | null;
  prevo?: string | null;
  evos?: string[];
}

/**
 * Servicio de dominio puro encargado de clasificar estructural y competitivamente
 * a los Pokémon según sus etiquetas oficiales y metadatos evolutivos.
 */
export class PokemonClassifierService {
  /**
   * Resuelve el listado completo de etiquetas (tags) competitivas aplicables.
   * Utiliza retornos claros y tipados fuertes.
   * 
   * @param species Objeto con los metadatos inmutables de la especie
   * @returns Array de etiquetas derivadas
   */
  public static classify(species: SpeciesMetadata): string[] {
    const tags: string[] = [];

    if (!species) {
      return tags;
    }

    // Clasificaciones de rareza / estatus
    if (species.tags?.includes('Sub-Legendary') || species.tags?.includes('Restricted Legendary')) {
      tags.push('legendary');
    }
    if (species.tags?.includes('Mythical')) {
      tags.push('mythical');
    }
    if (species.tags?.includes('Ultra Beast')) {
      tags.push('ultra_beast');
    }
    if (species.tags?.includes('Paradox')) {
      tags.push('paradox');
    }
    if (species.isNonstandard === 'CAP') {
      tags.push('cap');
    }

    // Formas de combate exóticas
    if (species.isMega) {
      tags.push('mega');
    }
    if (species.isPrimal) {
      tags.push('primal');
    }
    if (species.name.endsWith("-Gmax") || species.isNonstandard === "Gigantamax") {
      tags.push("gigantamax");
    }

    // Variantes regionales
    const forme = species.forme || '';
    const id = species.id || '';

    if (forme.includes('Alola') || id.includes('alola')) {
      tags.push('alolan');
    }
    if (forme.includes('Galar') || id.includes('galar')) {
      tags.push('galarian');
    }
    if (forme.includes('Hisui') || id.includes('hisui')) {
      tags.push('hisuian');
    }
    if (forme.includes('Paldea') || id.includes('paldea')) {
      tags.push('paldean');
    }
    if (forme) {
      tags.push('alternate_form');
    }

    // Etapas evolutivas
    const hasPrevo = !!species.prevo;
    const hasEvos = Array.isArray(species.evos) && species.evos.length > 0;

    if (!hasPrevo && !hasEvos) {
      tags.push('single_stage');
    } else if (!hasPrevo) {
      tags.push('basic');
    } else if (hasEvos) {
      tags.push('stage_1');
    } else {
      tags.push('fully_evolved');
    }

    // Generación
    if (typeof species.gen === 'number') {
      tags.push(`gen_${species.gen}`);
    }

    return tags;
  }
}
