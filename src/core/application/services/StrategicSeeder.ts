import { 
  KnowledgeRepository, 
  EmbeddingService, 
  ExternalDexProvider,
  CreaturePayload,
  Logger
} from '../ports/KnowledgeVaultPorts';
import { TypeChartService } from '../../domain/TypeChart';
import { PokemonClassifierService } from '../../domain/PokemonClassifier';
import { SmogonDataParser, SmogonSet } from './SmogonDataParser';

export class StrategicSeeder {
  private static readonly BATCH_SIZE = 5;

  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly dexProvider: ExternalDexProvider,
    private readonly logger: Logger
  ) {}

  public async seed(): Promise<void> {
    const smogonSetsGlobal = await this.dexProvider.getSmogonSets();
    const smogonAnalysesGlobal = await this.dexProvider.getSmogonAnalyses();
    const allSpeciesRaw = this.dexProvider.getAllSpecies();
    
    const eligibleSpecies = allSpeciesRaw.filter(species => {
      const isNonstandard = typeof species.isNonstandard === 'string' ? species.isNonstandard : null;
      const name = typeof species.name === 'string' ? species.name : '';
      if (isNonstandard === 'Custom' || isNonstandard === 'LGPE') return false;
      if (name.includes('Pikachu-') && name !== 'Pikachu-Starter' && name !== 'Pikachu-Gmax') return false;
      if (name.includes('Minior-') && name !== 'Minior-Meteor') return false;
      if (name.includes('Furfrou-') || (name.includes('Alcremie-') && name !== 'Alcremie-Gmax')) return false;
      return true;
    });

    for (let i = 0; i < eligibleSpecies.length; i += StrategicSeeder.BATCH_SIZE) {
      const batch = eligibleSpecies.slice(i, i + StrategicSeeder.BATCH_SIZE);
      await Promise.all(batch.map(async (species) => {
        try {
          await this.processSpecies(species, smogonSetsGlobal, smogonAnalysesGlobal);
        } catch (error) {
          const speciesName = typeof species.name === 'string' ? species.name : 'Unknown';
          this.logger.error(`Error procesando especie ${speciesName} en lote`, error);
        }
      }));
    }
  }

  private async processSpecies(
    species: Record<string, unknown>, 
    smogonSetsGlobal: Record<string, unknown>, 
    smogonAnalysesGlobal: Record<string, unknown>
  ): Promise<void> {
    const name = typeof species.name === 'string' ? species.name : 'Unknown';
    const id = typeof species.id === 'string' ? species.id : '';
    const gen = typeof species.gen === 'number' ? species.gen : 1;
    const types = Array.isArray(species.types) ? species.types.map(String) : [];
    
    const abilitiesObj = (species.abilities && typeof species.abilities === 'object')
      ? species.abilities as Record<string, string | undefined> : {};
    const abilitiesList = Object.values(abilitiesObj).filter((a): a is string => !!a);
    const baseStats = (species.baseStats && typeof species.baseStats === 'object')
      ? species.baseStats as Record<string, number> : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const translation = await this.dexProvider.fetchPokemonTranslation(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const defensiveProfile = TypeChartService.calculateDefensiveProfile(types);
    const tags = PokemonClassifierService.classify({
      id, name, gen,
      tags: Array.isArray(species.tags) ? species.tags.map(String) : undefined,
      isNonstandard: typeof species.isNonstandard === 'string' ? species.isNonstandard : null,
      isMega: species.isMega === true, isPrimal: species.isPrimal === true,
      canGigantamax: typeof species.canGigantamax === 'string' ? species.canGigantamax : null,
      forme: typeof species.forme === 'string' ? species.forme : null,
      prevo: typeof species.prevo === 'string' ? species.prevo : null,
      evos: Array.isArray(species.evos) ? species.evos.map(String) : undefined
    });

    const evolutionChain = this.dexProvider.getEvolutionChain(species);
    const learnset = await this.dexProvider.getLearnsetMoves(id);

    const smogonSets = (smogonSetsGlobal[name] && typeof smogonSetsGlobal[name] === 'object')
      ? (smogonSetsGlobal[name] as Record<string, Record<string, SmogonSet>>) : {};
    const smogonAnalyses = (smogonAnalysesGlobal[name] && typeof smogonAnalysesGlobal[name] === 'object')
      ? (smogonAnalysesGlobal[name] as Record<string, string | undefined>) : {};

    const setsDetails = SmogonDataParser.formatSetsDetails(smogonSets);
    const isCap = typeof species.isNonstandard === 'string' && species.isNonstandard === 'CAP';

    const payload: CreaturePayload = {
      name, author: isCap ? 'Comunidad CAP' : 'Oficial', isFakemon: isCap,
      names: { en: name, es: translation.nameEs || name },
      descriptions: { en: translation.pokedexEntryEn || 'N/A', es: translation.pokedexEntryEs || 'N/A' },
      categories: { en: translation.categoryEn || 'Pokemon', es: translation.categoryEs || 'Pokémon' },
      combatAttributes: {
        types, tier: typeof species.tier === 'string' ? species.tier : 'Unknown',
        spriteUrl: `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.png`,
        baseStats, abilities: abilitiesList, tags, generation: gen, num: typeof species.num === 'number' ? species.num : 0,
        weight: typeof species.weightkg === 'number' ? species.weightkg : 0, height: typeof species.heightm === 'number' ? species.heightm : 0,
        eggGroups: Array.isArray(species.eggGroups) ? species.eggGroups.map(String) : [],
        learnset, evolutionChain, weaknesses: defensiveProfile.weaknesses || [],
        resistances: defensiveProfile.resistances || [], immunities: defensiveProfile.immunities || [],
        formats: Object.keys(smogonSets), recommendedSets: smogonSets, strategicAnalysis: smogonAnalyses
      }
    };

    await this.repository.upsertCreature(payload);
    await this.saveRAGDocument(name, gen, types, abilitiesList, baseStats, smogonSets, setsDetails, smogonAnalyses, evolutionChain, learnset, tags);
  }

  private async saveRAGDocument(name: string, gen: number, types: string[], abilities: string[], stats: Record<string, number>, sets: object, details: string, analysis: Record<string, string | undefined>, evo: string[], moves: string[], tags: string[]): Promise<void> {
    const docText = `Pokemon: ${name}. Gen: ${gen}. Types: ${types.join(', ')}. Abilities: ${abilities.join(', ')}. Stats: HP ${stats.hp}, Atk ${stats.atk}, Def ${stats.def}, SpA ${stats.spa}, SpD ${stats.spd}, Spe ${stats.spe}. Strategy: ${details}. Evolution: ${evo.join(' -> ')}. Moves: ${moves.slice(0, 20).join(', ')}.`.trim();
    const vector = await this.embeddingService.embedText(docText);
    await this.repository.saveKnowledgeDocument({
      docType: 'pokemon', content: docText,
      metadata: { name, gen, types, isFullyEvolved: tags.includes('fully_evolved') },
      embeddingVector: vector
    });
  }
}
