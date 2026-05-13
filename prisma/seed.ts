import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { pipeline, env } from '@xenova/transformers';
import { Dex } from '@pkmn/dex';

env.allowLocalModels = false;

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando la Bóveda de Conocimiento (Seed RAG Multicapa)...');

  console.log('Cargando modelo de embeddings local (all-MiniLM-L6-v2)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  console.log('Descargando Sets Maestros de Smogon (Gen 9)...');
  const setsRes = await fetch('https://pkmn.github.io/smogon/data/sets/gen9.json');
  const smogonSets = await setsRes.json();
  
  console.log('Descargando Artículos de Smogon (Gen 9)...');
  const analysesRes = await fetch('https://pkmn.github.io/smogon/data/analyses/gen9.json');
  const smogonAnalyses = await analysesRes.json();

  console.log('Obteniendo catálogo de @pkmn/dex...');
  let allSpecies = Array.from(Dex.species.all());
  
  allSpecies = allSpecies.filter(s => {
    if (s.isNonstandard === 'Custom' || s.isNonstandard === 'LGPE') return false;
    if (s.name.includes('Pikachu-') && s.name !== 'Pikachu-Starter' && s.name !== 'Pikachu-Gmax') return false;
    if (s.name.includes('Minior-') && s.name !== 'Minior-Meteor') return false;
    if (s.name.includes('Furfrou-')) return false;
    if (s.name.includes('Alcremie-') && s.name !== 'Alcremie-Gmax') return false;
    return true;
  });

  console.log(`Procesando ${allSpecies.length} Pokémon mecánicamente únicos...`);

  await prisma.criatura.deleteMany({});
  await prisma.$executeRaw`TRUNCATE TABLE "DocumentoConocimiento" CASCADE`;

  const BATCH_SIZE = 5; // Reducido para no saturar memoria con textos gigantes
  for (let i = 0; i < allSpecies.length; i += BATCH_SIZE) {
    const batch = allSpecies.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const species = batch[j];
      const nombre_limpio = species.name;
      const pokemonId = i + j + 1;

      try {
        const habilidades = Object.values(species.abilities).filter(Boolean);
        const atributos_de_combate = {
          tipos: species.types,
          stats_base: species.baseStats,
          habilidades: habilidades,
          peso: species.weightkg,
          tier: species.tier || "Unknown",
          sprite_url: `https://play.pokemonshowdown.com/sprites/gen5/${species.id}.png`,
          requiredItem: species.requiredItem || null,
          requiredAbility: species.requiredAbility || null,
          isMega: species.isMega || false,
          isPrimal: species.isPrimal || false,
          canGigantamax: species.canGigantamax || null,
        };

        await prisma.criatura.upsert({
          where: { nombre: nombre_limpio },
          update: { atributos_de_combate },
          create: {
            nombre: nombre_limpio,
            autor: "oficial",
            es_fakemon: false,
            atributos_de_combate,
          },
        });

        // Extraer Learnset
        let learnsetObj = null;
        try {
          learnsetObj = await Dex.learnsets.get(species.id);
        } catch (e) {}
        const learnsetMoves = learnsetObj && learnsetObj.learnset ? Object.keys(learnsetObj.learnset) : [];

        // Construir Documento RAG
        let docText = `[POKÉMON]: ${nombre_limpio}\n`;
        docText += `[TIPOS]: ${species.types.join(', ')}\n`;
        docText += `[STATS BASE]: HP ${species.baseStats.hp}, Atk ${species.baseStats.atk}, Def ${species.baseStats.def}, SpA ${species.baseStats.spa}, SpD ${species.baseStats.spd}, Spe ${species.baseStats.spe}\n`;
        docText += `[HABILIDADES]: ${habilidades.join(', ')}\n`;
        if (learnsetMoves.length > 0) {
          docText += `[MOVIMIENTOS APRENDIBLES]: ${learnsetMoves.join(', ')}\n\n`;
        }

        const setsData = smogonSets[nombre_limpio];
        const analysesData = smogonAnalyses[nombre_limpio];

        if (setsData || analysesData) {
          docText += `--- ESTRATEGIAS COMPETITIVAS ---\n`;
          const formatos = new Set([...Object.keys(setsData || {}), ...Object.keys(analysesData || {})]);

          for (const formato of formatos) {
            docText += `\n[FORMATO: ${formato.toUpperCase()}]\n`;
            
            // Sets
            if (setsData && setsData[formato]) {
              for (const [setName, setDetails] of Object.entries(setsData[formato])) {
                const details: any = setDetails;
                docText += `Set: ${setName}\n`;
                docText += `- Objeto: ${Array.isArray(details.item) ? details.item.join(' / ') : details.item || 'Ninguno'}\n`;
                docText += `- Habilidad: ${Array.isArray(details.ability) ? details.ability.join(' / ') : details.ability || 'Cualquiera'}\n`;
                if (details.nature) docText += `- Naturaleza: ${details.nature}\n`;
                if (details.evs) docText += `- EVs: ${JSON.stringify(details.evs)}\n`;
                if (details.ivs) docText += `- IVs: ${JSON.stringify(details.ivs)}\n`;
                if (details.teratypes) docText += `- Tera Tipo: ${Array.isArray(details.teratypes) ? details.teratypes.join(' / ') : details.teratypes}\n`;
                
                if (details.moves) {
                  const parsedMoves = details.moves.map((m: any) => Array.isArray(m) ? m.join(' / ') : m);
                  docText += `- Movimientos: ${parsedMoves.join(' | ')}\n`;
                }
              }
            }

            // Análisis escrito
            if (analysesData && analysesData[formato]) {
              const analysis = analysesData[formato];
              if (analysis.overview) docText += `Resumen Estratégico:\n${analysis.overview.replace(/<[^>]*>?/gm, '')}\n`; // Quitar HTML tags
              if (analysis.comments) docText += `Comentarios:\n${analysis.comments.replace(/<[^>]*>?/gm, '')}\n`;
            }
          }
        } else {
          docText += `\n(Aún no hay estrategias publicadas en Smogon para este Pokémon en esta generación. Basa tu estrategia en sus Stats y Learnset).`;
        }

        const output = await embedder(docText, { pooling: 'mean', normalize: true });
        const embeddingVector = Array.from(output.data);
        const vectorString = `[${embeddingVector.join(',')}]`;

        await prisma.$executeRaw`
          INSERT INTO "DocumentoConocimiento" (doc_type, contenido, metadatos, embedding)
          VALUES ('enciclopedia_estrategica', ${docText}, ${JSON.stringify({ pokemon: nombre_limpio })}::jsonb, ${vectorString}::vector)
        `;
        
        console.log(`✅ [${pokemonId}/${allSpecies.length}] ${nombre_limpio}: Enciclopedia RAG construida.`);

      } catch (err) {
        console.error(`❌ Error procesando ${nombre_limpio}:`, err);
      }
    }
    
    await new Promise(r => setTimeout(r, 100)); // Breve pausa
  }

  console.log('Seed RAG Multicapa completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
