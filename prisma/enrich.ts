/**
 * Script de enriquecimiento: Añade clasificaciones, evolución, debilidades y learnset
 * a los Pokémon existentes en la DB sin necesidad de re-ejecutar todo el seed.
 * 
 * Ejecutar: npx tsx prisma/enrich.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Dex } from '@pkmn/dex';

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
      // How effective is atkType against defType?
      // We need the DEFENSIVE chart: what multiplier does defType receive from atkType?
      const chart = TYPE_CHART[atkType];
      if (chart && chart[defType] !== undefined) {
        multiplier *= chart[defType];
      }
    }
    if (multiplier === 0) immunities.push(atkType);
    else if (multiplier >= 2) weaknesses.push(atkType);
    else if (multiplier < 1) resistances.push(atkType);
  }
  return { weaknesses, resistances, immunities };
}

function getEvolutionChain(species: any): string[] {
  const chain: string[] = [];
  // Get base species
  let current = species;
  while (current.prevo) {
    const prevo = Dex.species.get(current.prevo);
    if (prevo.exists) current = prevo;
    else break;
  }
  // Walk forward
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

  // Category labels
  if (species.tags?.includes('Sub-Legendary') || species.tags?.includes('Restricted Legendary')) tags.push('legendary');
  if (species.tags?.includes('Mythical')) tags.push('mythical');
  if (species.tags?.includes('Ultra Beast')) tags.push('ultra_beast');
  if (species.tags?.includes('Paradox')) tags.push('paradox');

  // Form classifications
  if (species.isMega) tags.push('mega');
  if (species.isPrimal) tags.push('primal');
  if (species.canGigantamax) tags.push('gigantamax');
  if (species.forme && (species.forme.includes('Alola') || species.id.includes('alola'))) tags.push('alolan');
  if (species.forme && (species.forme.includes('Galar') || species.id.includes('galar'))) tags.push('galarian');
  if (species.forme && (species.forme.includes('Hisui') || species.id.includes('hisui'))) tags.push('hisuian');
  if (species.forme && (species.forme.includes('Paldea') || species.id.includes('paldea'))) tags.push('paldean');
  if (species.forme) tags.push('alternate_form');

  // Evolutionary stage
  if (!species.prevo && (!species.evos || species.evos.length === 0)) {
    tags.push('single_stage');
  } else if (!species.prevo) {
    tags.push('basic');
  } else if (species.evos && species.evos.length > 0) {
    tags.push('stage_1');
  } else {
    tags.push('fully_evolved');
  }

  // Generation
  tags.push(`gen_${species.gen}`);

  return tags;
}

async function main() {
  console.log('🔧 Enriqueciendo datos de Pokémon...');

  const allCriaturas = await prisma.criatura.findMany({ where: { es_fakemon: false } });
  console.log(`Encontradas ${allCriaturas.length} criaturas. Procesando...`);

  let updated = 0;
  for (const criatura of allCriaturas) {
    const species = Dex.species.get(criatura.nombre);
    if (!species.exists) {
      console.log(`⚠️ No encontrado en Dex: ${criatura.nombre}`);
      continue;
    }

    const attrs = criatura.atributos_de_combate as any;

    // Get learnset
    let learnset: string[] = [];
    try {
      const ls = await Dex.learnsets.get(species.id);
      if (ls?.learnset) learnset = Object.keys(ls.learnset).map(m => Dex.moves.get(m).name);
    } catch {}

    // Compute defensive chart
    const defense = calcDefensiveChart(species.types);
    const evoChain = getEvolutionChain(species);
    const tags = classifyPokemon(species);

    const enriched = {
      ...attrs,
      peso: species.weightkg,
      altura: species.heightm,
      generacion: species.gen,
      color: species.color,
      egg_groups: species.eggGroups,
      gender_ratio: species.genderRatio,
      base_experience: species.baseStats.hp, // Approximation
      learnset,
      evolution_chain: evoChain,
      weaknesses: defense.weaknesses,
      resistances: defense.resistances,
      immunities: defense.immunities,
      tags,
      forme: species.forme || null,
      baseSpecies: species.baseSpecies || null,
      num: species.num,
    };

    await prisma.criatura.update({
      where: { id: criatura.id },
      data: { atributos_de_combate: enriched },
    });

    updated++;
    if (updated % 100 === 0) console.log(`  ${updated}/${allCriaturas.length}...`);
  }

  console.log(`✅ ${updated} Pokémon enriquecidos con éxito.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
