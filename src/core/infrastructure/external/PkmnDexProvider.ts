import { Dex } from '@pkmn/dex';
import { 
  ExternalDexProvider, 
  TranslationResult, 
  PokemonTranslationResult,
  RawItemData,
  RawAbilityData,
  RawMoveData,
  Logger
} from '../../application/ports/KnowledgeVaultPorts';

/**
 * Contrato de entrada para entidades de traducción de PokeAPI.
 */
interface PokeApiTranslationEntry {
  language?: { name: string };
  name?: string;
  flavor_text?: string;
  genus?: string;
}

/**
 * Respuesta tipada parcial de PokeAPI.
 */
interface PokeApiResponse {
  names?: PokeApiTranslationEntry[];
  flavor_text_entries?: PokeApiTranslationEntry[];
  genera?: PokeApiTranslationEntry[];
}

/**
 * Mapeo interno para metadatos de especies del motor @pkmn/dex.
 */
interface DexSpeciesNode {
  exists?: boolean;
  name?: string;
  prevo?: string;
  evos?: string[];
  [key: string]: unknown;
}

/**
 * Adaptador concreto para consultar el catálogo de @pkmn/dex,
 * realizar peticiones REST a PokeAPI y descargar metadatos de Smogon.
 */
export class PkmnDexProvider implements ExternalDexProvider {
  constructor(private readonly logger: Logger) {}
  /**
   * Obtiene la traducción al español de un Objeto, Habilidad o Movimiento.
   */
  public async fetchTranslation(type: 'item' | 'ability' | 'move', name: string): Promise<TranslationResult> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let esName = name;
    let esDesc = '';

    if (process.env.SKIP_POKEAPI === 'true') {
      return { esName, esDesc };
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/${type}/${slug}`);
      if (res.ok) {
        const data: PokeApiResponse = await res.json();
        
        const nameEntry = data.names?.find(n => n.language?.name === 'es');
        if (nameEntry?.name) {
          esName = nameEntry.name;
        }

        const flavorEntry = data.flavor_text_entries?.find(e => e.language?.name === 'es');
        if (flavorEntry?.flavor_text) {
          esDesc = flavorEntry.flavor_text.replace(/\n|\f|\r/g, ' ');
        }
      }
    } catch {
      // Fallo silencioso tolerante a red, conservando valores en inglés
    }

    return { esName, esDesc };
  }

  /**
   * Obtiene la entrada de la Pokédex y categoría bilingüe para un Pokémon.
   */
  public async fetchPokemonTranslation(pokeApiName: string): Promise<PokemonTranslationResult> {
    const result: PokemonTranslationResult = {
      pokedexEntryEs: null,
      pokedexEntryEn: null,
      categoryEs: null,
      categoryEn: null,
      nameEs: null
    };

    if (process.env.SKIP_POKEAPI === 'true') {
      return result;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeApiName}`);
      if (res.ok) {
        const data: PokeApiResponse = await res.json();

        const flavorEs = data.flavor_text_entries?.find(e => e.language?.name === 'es');
        const flavorEn = data.flavor_text_entries?.find(e => e.language?.name === 'en');
        if (flavorEs?.flavor_text) {
          result.pokedexEntryEs = flavorEs.flavor_text.replace(/\n|\f|\r/g, ' ');
        }
        if (flavorEn?.flavor_text) {
          result.pokedexEntryEn = flavorEn.flavor_text.replace(/\n|\f|\r/g, ' ');
        }

        const genusEs = data.genera?.find(g => g.language?.name === 'es');
        const genusEn = data.genera?.find(g => g.language?.name === 'en');
        if (genusEs?.genus) {
          result.categoryEs = genusEs.genus;
        }
        if (genusEn?.genus) {
          result.categoryEn = genusEn.genus;
        }

        const nameEntry = data.names?.find(n => n.language?.name === 'es');
        if (nameEntry?.name) {
          result.nameEs = nameEntry.name;
        }
      }
    } catch {
      // Ignorar fallos de red puntuales
    }

    return result;
  }

  /**
   * Descarga el archivo maestro de sets competitivos de Smogon.
   */
  public async getSmogonSets(): Promise<Record<string, unknown>> {
    try {
      const res = await fetch('https://pkmn.github.io/smogon/data/sets/gen9.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      this.logger.error('No se pudieron descargar los sets de Smogon', err);
    }
    return {};
  }

  /**
   * Descarga el archivo maestro de análisis competitivos de Smogon.
   */
  public async getSmogonAnalyses(): Promise<Record<string, unknown>> {
    try {
      const res = await fetch('https://pkmn.github.io/smogon/data/analyses/gen9.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      this.logger.error('No se pudieron descargar los análisis de Smogon', err);
    }
    return {};
  }

  /**
   * Obtiene todos los objetos elegibles del motor @pkmn/dex.
   */
  public getAllItems(): RawItemData[] {
    const items = Array.from(Dex.items.all()).filter(i => !i.isNonstandard);
    return items.map(i => ({
      id: i.id,
      name: i.name,
      desc: i.desc,
      shortDesc: i.shortDesc,
      num: i.num,
      gen: i.gen,
      isNonstandard: i.isNonstandard || null
    }));
  }

  /**
   * Obtiene todas las habilidades elegibles del motor @pkmn/dex.
   */
  public getAllAbilities(): RawAbilityData[] {
    const abilities = Array.from(Dex.abilities.all());
    return abilities.map(a => ({
      name: a.name,
      desc: a.desc,
      shortDesc: a.shortDesc,
      num: a.num,
      gen: a.gen,
      isNonstandard: a.isNonstandard || null
    }));
  }

  /**
   * Obtiene todos los movimientos elegibles del motor @pkmn/dex.
   */
  public getAllMoves(): RawMoveData[] {
    const moves = Array.from(Dex.moves.all());
    return moves.map(m => ({
      name: m.name,
      desc: m.desc,
      shortDesc: m.shortDesc,
      type: m.type,
      category: m.category,
      basePower: m.basePower,
      accuracy: m.accuracy,
      priority: m.priority,
      target: m.target,
      flags: (m.flags ? { ...m.flags } : {}) as Record<string, unknown>,
      isNonstandard: m.isNonstandard || null
    }));
  }

  /**
   * Obtiene el listado completo de especies.
   */
  public getAllSpecies(): Array<Record<string, unknown>> {
    const species = Array.from(Dex.species.all());
    // Retornamos de forma compatible mediante un mapeo a objetos tipados genéricamente
    return species.map(rawSpecies => {
      // Usamos una conversión tipada estructurada para satisfacer las firmas extendidas sin recurrir a 'any'
      interface ExtendedDexSpecies {
        id: string;
        name: string;
        baseSpecies?: string | null;
        gen: number;
        types?: string[];
        abilities?: Record<string, string>;
        baseStats?: Record<string, number>;
        tags?: string[];
        isNonstandard?: string | null;
        isMega?: boolean;
        isPrimal?: boolean;
        canGigantamax?: string | null;
        forme?: string | null;
        prevo?: string | null;
        evos?: string[];
        num?: number;
        weightkg?: number;
        heightm?: number;
        tier?: string;
        eggGroups?: string[];
      }

      const s = rawSpecies as unknown as ExtendedDexSpecies;

      // Extraemos la información relevante en un objeto para evitar el uso de clases externas directas
      const baseStats = s.baseStats ? { ...s.baseStats } : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      const abilities = s.abilities ? { ...s.abilities } : {};
      
      return {
        id: s.id,
        name: s.name,
        baseSpecies: s.baseSpecies || null,
        gen: s.gen,
        types: s.types ? [...s.types] : [],
        abilities,
        baseStats,
        tags: s.tags ? [...s.tags] : [],
        isNonstandard: s.isNonstandard || null,
        isMega: !!s.isMega,
        isPrimal: !!s.isPrimal,
        canGigantamax: s.canGigantamax || null,
        forme: s.forme || null,
        prevo: s.prevo || null,
        evos: s.evos ? [...s.evos] : [],
        num: s.num || 0,
        weightkg: s.weightkg || 0,
        heightm: s.heightm || 0,
        tier: s.tier || "Unknown",
        eggGroups: s.eggGroups ? [...s.eggGroups] : []
      };
    });
  }

  /**
   * Resuelve la familia evolutiva completa hacia adelante y hacia atrás.
   */
  public getEvolutionChain(species: Record<string, unknown>): string[] {
    const chain: string[] = [];
    
    // Convertir y buscar desde el objeto inicial usando el Dex
    const speciesId = typeof species.id === 'string' ? species.id : '';
    if (!speciesId) return chain;

    let current: DexSpeciesNode = Dex.species.get(speciesId) as unknown as DexSpeciesNode;
    if (!current?.exists) return chain;

    // Recorrer pre-evoluciones
    while (current.prevo) {
      const prevoNode = Dex.species.get(current.prevo) as unknown as DexSpeciesNode;
      if (prevoNode?.exists) {
        current = prevoNode;
      } else {
        break;
      }
    }

    const rootName = current.name || '';
    if (rootName) {
      chain.push(rootName);
    }

    const visited = new Set<string>([rootName]);

    function addEvos(sp: DexSpeciesNode) {
      if (Array.isArray(sp.evos)) {
        for (const evoName of sp.evos) {
          const evoNode = Dex.species.get(evoName) as unknown as DexSpeciesNode;
          const eName = evoNode?.name || '';
          if (evoNode?.exists && eName && !visited.has(eName)) {
            visited.add(eName);
            chain.push(eName);
            addEvos(evoNode);
          }
        }
      }
    }

    addEvos(current);
    return chain;
  }

  /**
   * Resuelve los movimientos aprendibles utilizando Dex.learnsets.
   */
  public async getLearnsetMoves(speciesId: string): Promise<string[]> {
    const moves: string[] = [];
    if (!speciesId) return moves;

    try {
      // Casteo tipado de la respuesta de learnsets
      const learnsetObj = (await Dex.learnsets.get(speciesId)) as unknown as {
        learnset?: Record<string, unknown>;
      };

      if (learnsetObj?.learnset) {
        for (const moveKey of Object.keys(learnsetObj.learnset)) {
          const moveData = Dex.moves.get(moveKey);
          if (moveData?.name) {
            moves.push(moveData.name);
          }
        }
      }
    } catch {
      // Ignorar fallos si la especie no tiene learnset registrado
    }

    return moves;
  }
}
