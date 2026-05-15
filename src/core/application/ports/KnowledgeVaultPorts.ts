/**
 * Cadenas localizadas en inglés y español.
 */
export interface LocalizedStrings {
  en: string;
  es: string;
}

/**
 * Carga útil para un Objeto equipable.
 */
export interface ItemPayload {
  name: string;
  names: LocalizedStrings;
  descriptions: LocalizedStrings;
  spriteUrl: string;
  attributes: Record<string, unknown>;
}

/**
 * Carga útil para una Habilidad.
 */
export interface AbilityPayload {
  name: string;
  names: LocalizedStrings;
  descriptions: LocalizedStrings;
  attributes: Record<string, unknown>;
}

/**
 * Carga útil para un Movimiento.
 */
export interface MovePayload {
  name: string;
  names: LocalizedStrings;
  type: string;
  category: string;
  basePower: number;
  accuracy: number;
  descriptions: LocalizedStrings;
  attributes: Record<string, unknown>;
}

/**
 * Carga útil para el perfil general de una Criatura/Pokémon.
 */
export interface CreaturePayload {
  name: string;
  author: string;
  isFakemon: boolean;
  names: LocalizedStrings;
  descriptions: LocalizedStrings;
  categories: LocalizedStrings;
  combatAttributes: Record<string, unknown>;
}

/**
 * Carga útil para un fragmento semántico de la Bóveda de Conocimiento (RAG).
 */
export interface KnowledgeDocumentPayload {
  docType: string;
  content: string;
  metadata: Record<string, unknown>;
  embeddingVector: number[];
}

/**
 * Puerto de salida para el repositorio de almacenamiento (Persistencia agnóstica).
 */
export interface KnowledgeRepository {
  clearAllTables(): Promise<void>;
  upsertItem(payload: ItemPayload): Promise<void>;
  upsertAbility(payload: AbilityPayload): Promise<void>;
  upsertMove(payload: MovePayload): Promise<void>;
  upsertCreature(payload: CreaturePayload): Promise<void>;
  saveKnowledgeDocument(payload: KnowledgeDocumentPayload): Promise<void>;
}

/**
 * Puerto de salida para el servicio de incrustación vectorial (Embeddings).
 */
export interface EmbeddingService {
  embedText(text: string): Promise<number[]>;
}

/**
 * Resultado estructurado de una traducción externa.
 */
export interface TranslationResult {
  esName: string;
  esDesc: string;
}

/**
 * Contrato de traducción para especies de Pokémon.
 */
export interface PokemonTranslationResult {
  pokedexEntryEs: string | null;
  pokedexEntryEn: string | null;
  categoryEs: string | null;
  categoryEn: string | null;
  nameEs: string | null;
}

/**
 * Datos brutos de un Objeto del Dex.
 */
export interface RawItemData {
  id: string;
  name: string;
  desc?: string;
  shortDesc?: string;
  num: number;
  gen: number;
  isNonstandard?: string | null;
}

/**
 * Datos brutos de una Habilidad del Dex.
 */
export interface RawAbilityData {
  name: string;
  desc?: string;
  shortDesc?: string;
  num: number;
  gen: number;
  isNonstandard?: string | null;
}

/**
 * Datos brutos de un Movimiento del Dex.
 */
export interface RawMoveData {
  name: string;
  desc?: string;
  shortDesc?: string;
  type: string;
  category: string;
  basePower: number;
  accuracy: true | number;
  priority: number;
  target: string;
  flags: Record<string, unknown>;
  isNonstandard?: string | null;
}

/**
 * Puerto de salida para la consulta del catálogo externo de Pokédex y Smogon.
 */
export interface ExternalDexProvider {
  fetchTranslation(type: 'item' | 'ability' | 'move', name: string): Promise<TranslationResult>;
  fetchPokemonTranslation(pokeApiName: string): Promise<PokemonTranslationResult>;
  getSmogonSets(): Promise<Record<string, unknown>>;
  getSmogonAnalyses(): Promise<Record<string, unknown>>;
  getAllItems(): RawItemData[];
  getAllAbilities(): RawAbilityData[];
  getAllMoves(): RawMoveData[];
  getAllSpecies(): Array<Record<string, unknown>>;
  getEvolutionChain(species: Record<string, unknown>): string[];
  getLearnsetMoves(speciesId: string): Promise<string[]>;
}

/**
 * Puerto de salida para el registro de eventos y errores de la aplicación.
 */
export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}
