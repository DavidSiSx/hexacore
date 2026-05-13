import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { pipeline, env } from '@xenova/transformers';
import { Dex } from '@pkmn/dex';
import fs from 'fs';
import path from 'path';

env.allowLocalModels = false;

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function insertDocument(embedder: any, docType: string, contenido: string, metadatos: any) {
  const output = await embedder(contenido, { pooling: 'mean', normalize: true });
  const embeddingVector = Array.from(output.data);
  const vectorString = `[${embeddingVector.join(',')}]`;

  await prisma.$executeRaw`
    INSERT INTO "DocumentoConocimiento" (doc_type, contenido, metadatos, embedding)
    VALUES (${docType}, ${contenido}, ${JSON.stringify(metadatos)}::jsonb, ${vectorString}::vector)
  `;
}

async function seedDictionary(embedder: any) {
  console.log('--- Construyendo Diccionario (Objetos, Habilidades, Movimientos) ---');
  
  const items = Array.from(Dex.items.all()).filter(i => !i.isNonstandard);
  console.log(`Guardando ${items.length} Objetos...`);
  for (const item of items) {
    await prisma.objeto.upsert({
      where: { nombre: item.name },
      update: {},
      create: {
        nombre: item.name,
        descripcion: item.desc || item.shortDesc || '',
        sprite_url: `https://play.pokemonshowdown.com/sprites/itemicons/${item.id}.png`,
        atributos: { num: item.num, gen: item.gen }
      }
    });
    const docText = `[OBJETO]: ${item.name}\n[DESCRIPCIÓN]: ${item.desc || item.shortDesc || ''}`;
    await insertDocument(embedder, 'diccionario_objeto', docText, { item: item.name });
  }

  const abilities = Array.from(Dex.abilities.all()).filter(a => !a.isNonstandard);
  console.log(`Guardando ${abilities.length} Habilidades...`);
  for (const ability of abilities) {
    await prisma.habilidad.upsert({
      where: { nombre: ability.name },
      update: {},
      create: {
        nombre: ability.name,
        descripcion: ability.desc || ability.shortDesc || '',
        atributos: { num: ability.num, gen: ability.gen }
      }
    });
    const docText = `[HABILIDAD]: ${ability.name}\n[DESCRIPCIÓN]: ${ability.desc || ability.shortDesc || ''}`;
    await insertDocument(embedder, 'diccionario_habilidad', docText, { habilidad: ability.name });
  }

  const moves = Array.from(Dex.moves.all()).filter(m => !m.isNonstandard);
  console.log(`Guardando ${moves.length} Movimientos...`);
  for (const move of moves) {
    await prisma.movimiento.upsert({
      where: { nombre: move.name },
      update: {},
      create: {
        nombre: move.name,
        tipo: move.type,
        categoria: move.category,
        potencia: move.basePower,
        precision: move.accuracy === true ? 100 : move.accuracy,
        descripcion: move.desc || move.shortDesc || '',
        atributos: { priority: move.priority, target: move.target, flags: move.flags }
      }
    });
    const docText = `[MOVIMIENTO]: ${move.name}\n[TIPO]: ${move.type}\n[CATEGORÍA]: ${move.category}\n[POTENCIA]: ${move.basePower}\n[PRECISIÓN]: ${move.accuracy}\n[PRIORIDAD]: ${move.priority}\n[DESCRIPCIÓN]: ${move.desc || move.shortDesc || ''}`;
    await insertDocument(embedder, 'diccionario_movimiento', docText, { movimiento: move.name });
  }
}

async function seedStaticMechanics(embedder: any) {
  console.log('--- Construyendo Conocimiento de Metajuego (Math, Synergies) ---');
  
  const mathPath = path.join(process.cwd(), 'src/data/mechanics_math.json');
  if (fs.existsSync(mathPath)) {
    const mathData = JSON.parse(fs.readFileSync(mathPath, 'utf8'));
    const docText = `[MATEMÁTICAS DE COMBATE Y MECÁNICAS]\n${JSON.stringify(mathData, null, 2)}`;
    await insertDocument(embedder, 'mecanicas_base', docText, { source: 'mechanics_math' });
    console.log('✅ Mecánicas base vectorizadas.');
  }

  const synergiesPath = path.join(process.cwd(), 'src/data/synergies.json');
  if (fs.existsSync(synergiesPath)) {
    const { gimmicks_and_synergies } = JSON.parse(fs.readFileSync(synergiesPath, 'utf8'));
    for (const synergy of gimmicks_and_synergies) {
      const docText = `[MECÁNICA / GIMMICK]: ${synergy.nombre}\n[FORMATO]: ${synergy.formato}\n[DESCRIPCIÓN]: ${synergy.descripcion}\n[COUNTERS]: ${synergy.counters.join(', ')}`;
      await insertDocument(embedder, 'sinergia_gimmick', docText, { synergy: synergy.nombre });
    }
    console.log(`✅ ${gimmicks_and_synergies.length} Sinergias/Gimmicks vectorizados.`);
  }
}

async function main() {
  console.log('Iniciando la Bóveda de Conocimiento (Seed RAG Multicapa + Diccionarios)...');

  console.log('Cargando modelo de embeddings local (all-MiniLM-L6-v2)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  console.log('Limpiando tablas de conocimiento previo...');
  await prisma.$executeRaw`TRUNCATE TABLE "DocumentoConocimiento" CASCADE`;
  await prisma.objeto.deleteMany({});
  await prisma.habilidad.deleteMany({});
  await prisma.movimiento.deleteMany({});
  await prisma.criatura.deleteMany({});

  // 1. Diccionarios y Mecánicas
  await seedDictionary(embedder);
  await seedStaticMechanics(embedder);

  // 2. Enciclopedia de Pokémon y Sets (Smogon)
  console.log('--- Construyendo Enciclopedia de Pokémon y Sets ---');
  console.log('Descargando Sets Maestros de Smogon (Gen 9)...');
  const setsRes = await fetch('https://pkmn.github.io/smogon/data/sets/gen9.json');
  const smogonSets = await setsRes.json();
  
  console.log('Descargando Artículos de Smogon (Gen 9)...');
  const analysesRes = await fetch('https://pkmn.github.io/smogon/data/analyses/gen9.json');
  const smogonAnalyses = await analysesRes.json();

  console.log('Obteniendo catálogo de Pokémon de @pkmn/dex...');
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

  const BATCH_SIZE = 5; 
  for (let i = 0; i < allSpecies.length; i += BATCH_SIZE) {
    const batch = allSpecies.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const species = batch[j];
      const nombre_limpio = species.name;
      const pokemonId = i + j + 1;

      try {
        let pokedexEntry = "Sin entrada de Pokédex.";
        try {
          // Intentar obtener el flavor text de PokeAPI (usando el nombre base para evitar errores con formas alternas)
          const pokeApiName = species.baseSpecies ? species.baseSpecies.toLowerCase() : species.id;
          const pokeApiRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeApiName}`);
          if (pokeApiRes.ok) {
            const data = await pokeApiRes.json();
            const flavorEntry = data.flavor_text_entries.find((e: any) => e.language.name === 'es' || e.language.name === 'en');
            if (flavorEntry) {
              pokedexEntry = flavorEntry.flavor_text.replace(/\n|\f|\r/g, ' ');
            }
          }
        } catch (e) {
          // Ignorar errores de red de PokeAPI y continuar
        }

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
          pokedex_entry: pokedexEntry
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

        let learnsetObj = null;
        try {
          learnsetObj = await Dex.learnsets.get(species.id);
        } catch (e) {}
        const learnsetMoves = learnsetObj && learnsetObj.learnset ? Object.keys(learnsetObj.learnset) : [];

        let docText = `[POKÉMON]: ${nombre_limpio}\n`;
        docText += `[POKÉDEX LORE]: ${pokedexEntry}\n`;
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

            if (analysesData && analysesData[formato]) {
              const analysis = analysesData[formato];
              if (analysis.overview) docText += `Resumen Estratégico:\n${analysis.overview.replace(/<[^>]*>?/gm, '')}\n`; 
              if (analysis.comments) docText += `Comentarios:\n${analysis.comments.replace(/<[^>]*>?/gm, '')}\n`;
            }
          }
        } else {
          docText += `\n(Aún no hay estrategias publicadas en Smogon para este Pokémon en esta generación. Basa tu estrategia en sus Stats y Learnset).`;
        }

        await insertDocument(embedder, 'enciclopedia_estrategica', docText, { pokemon: nombre_limpio });
        
        console.log(`✅ [${pokemonId}/${allSpecies.length}] ${nombre_limpio}: Enciclopedia construida.`);

      } catch (err) {
        console.error(`❌ Error procesando ${nombre_limpio}:`, err);
      }
    }
  }

  console.log('Seed RAG Multicapa + Diccionarios completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
