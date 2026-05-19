import { 
  KnowledgeRepository, 
  EmbeddingService, 
  ExternalDexProvider,
  ItemPayload,
  AbilityPayload,
  MovePayload,
  Logger
} from '../ports/KnowledgeVaultPorts';

export class DictionarySeeder {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly dexProvider: ExternalDexProvider,
    private readonly logger: Logger
  ) {}

  public async seed(): Promise<void> {
    await this.seedItems();
    await this.seedAbilities();
    await this.seedMoves();
  }

  private async seedItems(): Promise<void> {
    const items = this.dexProvider.getAllItems();
    for (const item of items) {
      try {
        const translation = await this.dexProvider.fetchTranslation('item', item.name);
        const description = item.desc || item.shortDesc || '';
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.id}.png`;

        const payload: ItemPayload = {
          name: item.name,
          names: { en: item.name, es: translation.esName || item.name },
          descriptions: { en: description, es: translation.esDesc || description },
          spriteUrl,
          attributes: {
            id: item.id,
            num: item.num,
            gen: item.gen,
            isNonstandard: item.isNonstandard || null,
            shortDesc: item.shortDesc || ''
          }
        };

        await this.repository.upsertItem(payload);
      } catch (error) {
        this.logger.error(`Error procesando objeto ${item.name}`, error);
      }
    }
  }

  private async seedAbilities(): Promise<void> {
    const abilities = this.dexProvider.getAllAbilities();
    for (const ability of abilities) {
      try {
        const translation = await this.dexProvider.fetchTranslation('ability', ability.name);
        const description = ability.desc || ability.shortDesc || '';

        const payload: AbilityPayload = {
          name: ability.name,
          names: { en: ability.name, es: translation.esName || ability.name },
          descriptions: { en: description, es: translation.esDesc || description },
          attributes: {
            num: ability.num,
            gen: ability.gen,
            isNonstandard: ability.isNonstandard || null,
            shortDesc: ability.shortDesc || ''
          }
        };

        await this.repository.upsertAbility(payload);
      } catch (error) {
        this.logger.error(`Error procesando habilidad ${ability.name}`, error);
      }
    }
  }

  private async seedMoves(): Promise<void> {
    const moves = this.dexProvider.getAllMoves();
    for (const move of moves) {
      try {
        const translation = await this.dexProvider.fetchTranslation('move', move.name);
        const description = move.desc || move.shortDesc || '';

        const payload: MovePayload = {
          name: move.name,
          names: { en: move.name, es: translation.esName || move.name },
          type: move.type,
          category: move.category,
          basePower: move.basePower,
          accuracy: move.accuracy === true ? 100 : Number(move.accuracy) || 0,
          descriptions: { en: description, es: translation.esDesc || description },
          attributes: {
            priority: move.priority,
            target: move.target,
            flags: move.flags || {},
            isNonstandard: move.isNonstandard || null,
            shortDesc: move.shortDesc || ''
          }
        };

        await this.repository.upsertMove(payload);
      } catch (error) {
        this.logger.error(`Error procesando movimiento ${move.name}`, error);
      }
    }
  }
}
