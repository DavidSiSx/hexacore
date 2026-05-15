import { PrismaClient, Prisma } from '@prisma/client';
import { 
  KnowledgeRepository, 
  ItemPayload, 
  AbilityPayload, 
  MovePayload, 
  CreaturePayload, 
  KnowledgeDocumentPayload 
} from '../../application/ports/KnowledgeVaultPorts';

/**
 * Adaptador concreto para interactuar con PostgreSQL mediante Prisma Client.
 * Implementa el patrón Repositorio garantizando el encapsulamiento de sentencias
 * SQL nativas y operaciones ORM transaccionales.
 */
export class PrismaKnowledgeRepository implements KnowledgeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Limpia el almacén vectorial para evitar duplicidad de incrustaciones en siembras sucesivas.
   */
  public async clearAllTables(): Promise<void> {
    await this.prisma.documentoConocimiento.deleteMany();
    // Nota: Las tablas de Objeto, Habilidad, Movimiento y Criatura utilizan upsert,
    // preservando la integridad referencial si hay equipos de usuarios asociados.
  }

  /**
   * Guarda o actualiza un Objeto equipable.
   */
  public async upsertItem(payload: ItemPayload): Promise<void> {
    const nombres = payload.names as unknown as Prisma.InputJsonObject;
    const descripciones = payload.descriptions as unknown as Prisma.InputJsonObject;
    const atributos = payload.attributes as unknown as Prisma.InputJsonObject;

    await this.prisma.objeto.upsert({
      where: { nombre: payload.name },
      update: {
        nombres,
        descripciones,
        sprite_url: payload.spriteUrl,
        atributos
      },
      create: {
        nombre: payload.name,
        nombres,
        descripciones,
        sprite_url: payload.spriteUrl,
        atributos
      }
    });
  }

  /**
   * Guarda o actualiza una Habilidad.
   */
  public async upsertAbility(payload: AbilityPayload): Promise<void> {
    const nombres = payload.names as unknown as Prisma.InputJsonObject;
    const descripciones = payload.descriptions as unknown as Prisma.InputJsonObject;
    const atributos = payload.attributes as unknown as Prisma.InputJsonObject;

    await this.prisma.habilidad.upsert({
      where: { nombre: payload.name },
      update: {
        nombres,
        descripciones,
        atributos
      },
      create: {
        nombre: payload.name,
        nombres,
        descripciones,
        atributos
      }
    });
  }

  /**
   * Guarda o actualiza un Movimiento.
   */
  public async upsertMove(payload: MovePayload): Promise<void> {
    const nombres = payload.names as unknown as Prisma.InputJsonObject;
    const descripciones = payload.descriptions as unknown as Prisma.InputJsonObject;
    const atributos = payload.attributes as unknown as Prisma.InputJsonObject;

    await this.prisma.movimiento.upsert({
      where: { nombre: payload.name },
      update: {
        nombres,
        tipo: payload.type,
        categoria: payload.category,
        potencia: payload.basePower,
        precision: payload.accuracy,
        descripciones,
        atributos
      },
      create: {
        nombre: payload.name,
        nombres,
        tipo: payload.type,
        categoria: payload.category,
        potencia: payload.basePower,
        precision: payload.accuracy,
        descripciones,
        atributos
      }
    });
  }

  /**
   * Guarda o actualiza el perfil completo de una Criatura/Pokémon.
   */
  public async upsertCreature(payload: CreaturePayload): Promise<void> {
    const nombres = payload.names as unknown as Prisma.InputJsonObject;
    const descripciones = payload.descriptions as unknown as Prisma.InputJsonObject;
    const categorias = payload.categories as unknown as Prisma.InputJsonObject;
    const atributos_de_combate = payload.combatAttributes as unknown as Prisma.InputJsonObject;

    await this.prisma.criatura.upsert({
      where: { nombre: payload.name },
      update: {
        autor: payload.author,
        es_fakemon: payload.isFakemon,
        nombres,
        descripciones,
        categorias,
        atributos_de_combate
      },
      create: {
        nombre: payload.name,
        autor: payload.author,
        es_fakemon: payload.isFakemon,
        nombres,
        descripciones,
        categorias,
        atributos_de_combate
      }
    });
  }

  /**
   * Almacena un documento semántico inyectando el vector mediante SQL nativo seguro.
   * Utiliza plantillas etiquetadas para prevenir vulnerabilidades de inyección.
   */
  public async saveKnowledgeDocument(payload: KnowledgeDocumentPayload): Promise<void> {
    const vectorString = `[${payload.embeddingVector.join(',')}]`;

    await this.prisma.$executeRaw`
      INSERT INTO "DocumentoConocimiento" (doc_type, contenido, metadatos, embedding)
      VALUES (${payload.docType}, ${payload.content}, ${JSON.stringify(payload.metadata)}::jsonb, ${vectorString}::vector)
    `;
  }
}
