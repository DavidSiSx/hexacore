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

// Type effectiveness for weakness/resistance calculation
const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Poison: 0.5, Fighting: 2, Dragon: 2, Dark: 2, Steel: 0.5 },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

function calcDefensiveChart(types: string[]): { weaknesses: string[]; resistances: string[]; immunities: string[] } {
  const weaknesses: string[] = [];
  const resistances: string[] = [];
  const immunities: string[] = [];
  for (const atkType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of types) {
      const chart = TYPE_CHART[atkType];
      if (chart && chart[defType] !== undefined) multiplier *= chart[defType];
    }
    if (multiplier === 0) immunities.push(atkType);
    else if (multiplier >= 2) weaknesses.push(atkType);
    else if (multiplier < 1) resistances.push(atkType);
  }
  return { weaknesses, resistances, immunities };
}

function getEvolutionChain(species: any): string[] {
  const chain: string[] = [];
  let current = species;
  while (current.prevo) {
    const prevo = Dex.species.get(current.prevo);
    if (prevo.exists) current = prevo;
    else break;
  }
  chain.push(current.name);
  const visited = new Set([current.name]);
  function addEvos(sp: any) {
    if (sp.evos) {
      for (const evoName of sp.evos) {
        const evo = Dex.species.get(evoName);
        if (evo.exists && !visited.has(evo.name)) {
          visited.add(evo.name);
          chain.push(evo.name);
          addEvos(evo);
        }
      }
    }
  }
  addEvos(current);
  return chain;
}

function classifyPokemon(species: any): string[] {
  const tags: string[] = [];
  if (species.tags?.includes('Sub-Legendary') || species.tags?.includes('Restricted Legendary')) tags.push('legendary');
  if (species.tags?.includes('Mythical')) tags.push('mythical');
  if (species.tags?.includes('Ultra Beast')) tags.push('ultra_beast');
  if (species.tags?.includes('Paradox')) tags.push('paradox');
  if (species.isNonstandard === 'CAP') tags.push('cap');

  if (species.isMega) tags.push('mega');
  if (species.isPrimal) tags.push('primal');
  if (species.canGigantamax) tags.push('gigantamax');
  if (species.forme && (species.forme.includes('Alola') || species.id.includes('alola'))) tags.push('alolan');
  if (species.forme && (species.forme.includes('Galar') || species.id.includes('galar'))) tags.push('galarian');
  if (species.forme && (species.forme.includes('Hisui') || species.id.includes('hisui'))) tags.push('hisuian');
  if (species.forme && (species.forme.includes('Paldea') || species.id.includes('paldea'))) tags.push('paldean');
  if (species.forme) tags.push('alternate_form');

  if (!species.prevo && (!species.evos || species.evos.length === 0)) tags.push('single_stage');
  else if (!species.prevo) tags.push('basic');
  else if (species.evos && species.evos.length > 0) tags.push('stage_1');
  else tags.push('fully_evolved');

  tags.push(`gen_${species.gen}`);
  return tags;
}

async function insertDocument(embedder: any, docType: string, contenido: string, metadatos: any) {
  const output = await embedder(contenido, { pooling: 'mean', normalize: true });
  const embeddingVector = Array.from(output.data);
  const vectorString = `[${embeddingVector.join(',')}]`;

  await prisma.$executeRaw`
    INSERT INTO "DocumentoConocimiento" (doc_type, contenido, metadatos, embedding)
    VALUES (${docType}, ${contenido}, ${JSON.stringify(metadatos)}::jsonb, ${vectorString}::vector)
  `;
}

async function getTranslations(type: 'item' | 'ability' | 'move', name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  let esName = name;
  let esDesc = "";
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/${type}/${slug}`);
    if (res.ok) {
      const data = await res.json();
      const nameEntry = data.names?.find((n: any) => n.language.name === 'es');
      if (nameEntry) esName = nameEntry.name;
      
      const flavorEntry = data.flavor_text_entries?.find((e: any) => e.language.name === 'es');
      if (flavorEntry) esDesc = flavorEntry.flavor_text.replace(/\n|\f|\r/g, ' ');
    }
  } catch (e) {
    // Silent fail, fallback to English
  }
  return { esName, esDesc };
}

async function seedDictionary(embedder: any) {
  console.log('--- Construyendo Diccionario (Objetos, Habilidades, Movimientos) ---');
  
  const items = Array.from(Dex.items.all()).filter(i => !i.isNonstandard);
  console.log(`Guardando ${items.length} Objetos...`);
  for (const item of items) {
    const enDesc = item.desc || item.shortDesc || '';
    const { esName, esDesc } = await getTranslations('item', item.name);
    await prisma.objeto.upsert({
      where: { nombre: item.name },
      update: {},
      create: {
        nombre: item.name,
        nombres: { en: item.name, es: esName },
        descripciones: { en: enDesc, es: esDesc || enDesc },
        sprite_url: `https://play.pokemonshowdown.com/sprites/itemicons/${item.id}.png`,
        atributos: { num: item.num, gen: item.gen }
      }
    });
    const docText = `[OBJETO]: ${item.name} [${esName}]\n[DESCRIPCIÓN]: ${enDesc}\n[ESP]: ${esDesc || enDesc}`;
    await insertDocument(embedder, 'diccionario_objeto', docText, { item: item.name });
  }

  const abilities = Array.from(Dex.abilities.all()).filter(a => !a.isNonstandard);
  console.log(`Guardando ${abilities.length} Habilidades...`);
  for (const ability of abilities) {
    const enDesc = ability.desc || ability.shortDesc || '';
    const { esName, esDesc } = await getTranslations('ability', ability.name);
    await prisma.habilidad.upsert({
      where: { nombre: ability.name },
      update: {},
      create: {
        nombre: ability.name,
        nombres: { en: ability.name, es: esName },
        descripciones: { en: enDesc, es: esDesc || enDesc },
        atributos: { num: ability.num, gen: ability.gen }
      }
    });
    const docText = `[HABILIDAD]: ${ability.name} [${esName}]\n[DESCRIPCIÓN]: ${enDesc}\n[ESP]: ${esDesc || enDesc}`;
    await insertDocument(embedder, 'diccionario_habilidad', docText, { habilidad: ability.name });
  }

  const moves = Array.from(Dex.moves.all()).filter(m => !m.isNonstandard);
  console.log(`Guardando ${moves.length} Movimientos...`);
  for (const move of moves) {
    const enDesc = move.desc || move.shortDesc || '';
    const { esName, esDesc } = await getTranslations('move', move.name);
    await prisma.movimiento.upsert({
      where: { nombre: move.name },
      update: {},
      create: {
        nombre: move.name,
        nombres: { en: move.name, es: esName },
        tipo: move.type,
        categoria: move.category,
        potencia: move.basePower,
        precision: move.accuracy === true ? 100 : move.accuracy,
        descripciones: { en: enDesc, es: esDesc || enDesc },
        atributos: { priority: move.priority, target: move.target, flags: move.flags as any }
      }
    });
    const docText = `[MOVIMIENTO]: ${move.name} [${esName}]\n[TIPO]: ${move.type}\n[CATEGORÍA]: ${move.category}\n[POTENCIA]: ${move.basePower}\n[DESCRIPCIÓN]: ${enDesc}\n[ESP]: ${esDesc || enDesc}`;
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
        let pokedexEntryEn = "No Pokédex entry found.";
        let pokedexEntryEs = "Sin entrada de Pokédex.";
        let categoryEn = "Unknown Pokémon";
        let categoryEs = "Pokémon Desconocido";
        let nameEs = species.name;

        try {
          const pokeApiName = species.baseSpecies ? species.baseSpecies.toLowerCase() : species.id;
          const pokeApiRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeApiName}`);
          if (pokeApiRes.ok) {
            const data = await pokeApiRes.json();
            
            const flavorEs = data.flavor_text_entries.find((e: any) => e.language.name === 'es');
            const flavorEn = data.flavor_text_entries.find((e: any) => e.language.name === 'en');
            if (flavorEs) pokedexEntryEs = flavorEs.flavor_text.replace(/\n|\f|\r/g, ' ');
            if (flavorEn) pokedexEntryEn = flavorEn.flavor_text.replace(/\n|\f|\r/g, ' ');

            const genusEs = data.genera?.find((g: any) => g.language.name === 'es');
            const genusEn = data.genera?.find((g: any) => g.language.name === 'en');
            if (genusEs) categoryEs = genusEs.genus;
            if (genusEn) categoryEn = genusEn.genus;

            const nameEntry = data.names?.find((n: any) => n.language.name === 'es');
            if (nameEntry) nameEs = nameEntry.name;
          }
        } catch (e) {
          // Ignore network errors
        }

        const habilidades = Object.values(species.abilities).filter(Boolean);
        
        // Fetch learnset
        let learnsetObj = null;
        try { learnsetObj = await Dex.learnsets.get(species.id); } catch (e) {}
        const learnsetMoves = learnsetObj && learnsetObj.learnset ? Object.keys(learnsetObj.learnset).map(m => Dex.moves.get(m).name) : [];
        
        // Compute classifications & mechanics
        const defense = calcDefensiveChart(species.types);
        const evoChain = getEvolutionChain(species);
        const tags = classifyPokemon(species);

        const esFakemon = species.isNonstandard === 'CAP';

        const atributos_de_combate = {
          tipos: species.types,
          stats_base: species.baseStats,
          habilidades: habilidades,
          peso: species.weightkg,
          altura: (species as any).heightm || null,
          color: (species as any).color || null,
          egg_groups: species.eggGroups || [],
          generacion: species.gen,
          tier: species.tier || "Unknown",
          sprite_url: `https://play.pokemonshowdown.com/sprites/gen5/${species.id}.png`,
          requiredItem: species.requiredItem || null,
          requiredAbility: species.requiredAbility || null,
          isMega: species.isMega || false,
          isPrimal: species.isPrimal || false,
          canGigantamax: species.canGigantamax || null,
          learnset: learnsetMoves,
          evolution_chain: evoChain,
          weaknesses: defense.weaknesses,
          resistances: defense.resistances,
          immunities: defense.immunities,
          tags: tags,
          forme: species.forme || null,
          baseSpecies: species.baseSpecies || null,
          num: species.num,
        };

        await prisma.criatura.upsert({
          where: { nombre: nombre_limpio },
          update: { 
            atributos_de_combate,
            nombres: { en: species.name, es: nameEs },
            descripciones: { en: pokedexEntryEn, es: pokedexEntryEs },
            categorias: { en: categoryEn, es: categoryEs }
          },
          create: {
            nombre: nombre_limpio,
            autor: "oficial",
            es_fakemon: esFakemon,
            nombres: { en: species.name, es: nameEs },
            descripciones: { en: pokedexEntryEn, es: pokedexEntryEs },
            categorias: { en: categoryEn, es: categoryEs },
            atributos_de_combate,
          },
        });

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
