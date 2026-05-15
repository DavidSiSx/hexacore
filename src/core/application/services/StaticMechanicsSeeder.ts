import fs from 'fs';
import path from 'path';
import { 
  KnowledgeRepository, 
  EmbeddingService,
  Logger
} from '../ports/KnowledgeVaultPorts';

interface StaticMechanicSection {
  title?: string;
  content?: string;
  formula?: string;
  category?: string;
}

interface SynergyCore {
  name?: string;
  tier?: string;
  pokemons?: string[];
  description?: string;
  counters?: string[];
}

export class StaticMechanicsSeeder {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly logger: Logger
  ) {}

  public async seed(): Promise<void> {
    await this.seedMath();
    await this.seedSynergies();
  }

  private async seedMath(): Promise<void> {
    try {
      const mathPath = path.join(process.cwd(), 'src', 'data', 'mechanics_math.json');
      if (fs.existsSync(mathPath)) {
        const mathContent = fs.readFileSync(mathPath, 'utf-8');
        const parsed: { sections?: StaticMechanicSection[] } = JSON.parse(mathContent);
        
        if (Array.isArray(parsed.sections)) {
          for (const section of parsed.sections) {
            const title = section.title || 'Desconocido';
            const content = section.content || '';
            const formula = section.formula || 'N/A';
            const category = section.category || 'general';

            const docText = `Mechanics Section: ${title}. Content: ${content}. Formula: ${formula}.`;
            const vector = await this.embeddingService.embedText(docText);

            await this.repository.saveKnowledgeDocument({
              docType: 'mechanics',
              content: docText,
              metadata: { title, category },
              embeddingVector: vector
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error cargando mechanics_math.json', error);
    }
  }

  private async seedSynergies(): Promise<void> {
    try {
      const synPath = path.join(process.cwd(), 'src', 'data', 'synergies.json');
      if (fs.existsSync(synPath)) {
        const synContent = fs.readFileSync(synPath, 'utf-8');
        const parsed: { cores?: SynergyCore[] } = JSON.parse(synContent);

        if (Array.isArray(parsed.cores)) {
          for (const core of parsed.cores) {
            const name = core.name || 'Core';
            const tier = core.tier || 'OU';
            const pokemons = Array.isArray(core.pokemons) ? core.pokemons.join(', ') : '';
            const description = core.description || '';
            const counters = Array.isArray(core.counters) ? core.counters.join(', ') : 'None';

            const docText = `Synergy Core: ${name}. Tier: ${tier}. Pokemons involved: ${pokemons}. Description: ${description}. Counters: ${counters}.`;
            const vector = await this.embeddingService.embedText(docText);

            await this.repository.saveKnowledgeDocument({
              docType: 'synergy',
              content: docText,
              metadata: { name, tier, pokemons: core.pokemons || [] },
              embeddingVector: vector
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error cargando synergies.json', error);
    }
  }
}
