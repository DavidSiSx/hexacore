import "dotenv/config";
import { prisma } from "../lib/db";
import { Dex } from "@pkmn/dex";

const CONCURRENCY_LIMIT = 5;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function fetchPokeApiTranslations(type: "pokemon" | "item" | "move" | "ability", nameOrId: string | number) {
  try {
    const slug = typeof nameOrId === "string" ? toSlug(nameOrId) : nameOrId;
    const data = await fetchWithRetry(`https://pokeapi.co/api/v2/${type}/${slug}`);
    if (!data) return null;

    const esName = data.names?.find((n: any) => n.language.name === "es")?.name;
    
    let esDesc = "";
    if (type === "item") {
      // Reversar para obtener la descripción más reciente (evita bugs como el de Babiri Berry en PokeAPI)
      esDesc = data.flavor_text_entries?.slice().reverse().find((f: any) => f.language.name === "es")?.text;
    } else if (type === "pokemon") {
      const speciesData = await fetchWithRetry(data.species.url);
      if (speciesData) {
        esDesc = speciesData.flavor_text_entries?.slice().reverse().find((f: any) => f.language.name === "es")?.flavor_text;
      }
    } else {
      // Para movimientos/habilidades: Preferir Escarlata/Púrpura o Espada/Escudo
      const entries = data.flavor_text_entries || [];
      esDesc = entries.find((f: any) => f.language.name === "es" && ["scarlet-violet", "sword-shield", "legends-arceus"].includes(f.version_group?.name))?.flavor_text 
              || entries.slice().reverse().find((f: any) => f.language.name === "es")?.flavor_text;
    }

    return {
      id: data.id,
      esName: esName || null,
      esDesc: esDesc?.replace(/\n/g, " ").replace(/\f/g, " ") || null
    };
  } catch (e) {
    return null;
  }
}

async function processInBatches<T>(items: T[], batchSize: number, processor: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
    console.log(`  Progress: ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }
}

async function main() {
  console.log("🛠️  Iniciando ETL Pipeline Optimizado (Database SSOT)...");

  console.log("🧹 Limpiando tablas de la enciclopedia...");
  await prisma.equipo.deleteMany({});
  await prisma.criatura.deleteMany({});
  await prisma.objeto.deleteMany({});
  await prisma.movimiento.deleteMany({});
  await prisma.habilidad.deleteMany({});

  console.log("🧠 Cargando Habilidades...");
  const abilities = Dex.abilities.all().filter(h => !h.isNonstandard || h.isNonstandard === "CAP");
  await processInBatches(abilities, CONCURRENCY_LIMIT, async (hab) => {
    const official = await fetchPokeApiTranslations("ability", hab.name);
    await prisma.habilidad.create({
      data: {
        nombre: hab.name,
        slug: toSlug(hab.name),
        nombres: { en: hab.name, es: official?.esName || hab.name },
        descripciones: { en: hab.shortDesc, es: official?.esDesc || hab.shortDesc },
        atributos: { ...hab }
      }
    });
  });

  console.log("⚔️  Cargando Movimientos...");
  const moves = Dex.moves.all().filter(m => !m.isNonstandard || m.isNonstandard === "CAP");
  await processInBatches(moves, CONCURRENCY_LIMIT, async (mov) => {
    const official = await fetchPokeApiTranslations("move", mov.name);
    await prisma.movimiento.create({
      data: {
        nombre: mov.name,
        slug: toSlug(mov.name),
        nombres: { en: mov.name, es: official?.esName || mov.name },
        tipo: mov.type,
        categoria: mov.category,
        potencia: mov.basePower,
        precision: mov.accuracy === true ? 100 : (mov.accuracy || 0),
        descripciones: { en: mov.shortDesc, es: official?.esDesc || mov.shortDesc },
        atributos: { ...mov }
      }
    });
  });

  console.log("📦 Cargando Objetos...");
  const items = Dex.items.all().filter(i => !i.isNonstandard || i.isNonstandard === "CAP");
  await processInBatches(items, CONCURRENCY_LIMIT, async (item) => {
    const official = await fetchPokeApiTranslations("item", item.name);
    await prisma.objeto.create({
      data: {
        nombre: item.name,
        slug: toSlug(item.name),
        nombres: { en: item.name, es: official?.esName || item.name },
        descripciones: { en: item.desc, es: official?.esDesc || item.desc },
        sprite_url: `https://play.pokemonshowdown.com/sprites/itemicons/${toSlug(item.name)}.png`,
        atributos: { ...item }
      }
    });
  });

  console.log("🐲 Cargando Especies Base...");
  const speciesList = Dex.species.all().filter(s => (!s.isNonstandard || ["Past", "CAP"].includes(s.isNonstandard as string)) && !s.forme);
  const nameToId = new Map<string, string>();

  await processInBatches(speciesList, CONCURRENCY_LIMIT, async (s) => {
    const official = await fetchPokeApiTranslations("pokemon", s.name);
    const criatura = await prisma.criatura.create({
      data: {
        nombre: s.name,
        slug: toSlug(s.name),
        nombres: { en: s.name, es: official?.esName || s.name },
        descripciones: { en: "Base species.", es: official?.esDesc || "Especie base." },
        es_fakemon: s.isNonstandard === "CAP",
        atributos_de_combate: {
          num: s.num,
          tipos: s.types,
          stats_base: s.baseStats,
          habilidades: Object.values(s.abilities),
          peso: s.weightkg,
          altura: s.heightm,
          egg_groups: s.eggGroups,
          tags: s.tags || []
        }
      }
    });
    nameToId.set(s.name, criatura.id);
  });

  console.log("🧬 Procesando Variantes y Formas (Herencia)...");
  const formsList = Dex.species.all().filter(s => (!s.isNonstandard || ["Past", "CAP"].includes(s.isNonstandard as string)) && !!s.forme);
  
  await processInBatches(formsList, CONCURRENCY_LIMIT, async (s) => {
    const baseSpeciesName = s.baseSpecies || s.name.split("-")[0];
    const baseId = nameToId.get(baseSpeciesName);

    const official = await fetchPokeApiTranslations("pokemon", s.name);
    await prisma.criatura.create({
      data: {
        nombre: s.name,
        slug: toSlug(s.name),
        base_species_id: baseId,
        nombres: { en: s.name, es: official?.esName || s.name },
        descripciones: { en: "Alternative form.", es: official?.esDesc || "Forma alternativa." },
        es_fakemon: s.isNonstandard === "CAP",
        atributos_de_combate: {
          num: s.num,
          tipos: s.types,
          stats_base: s.baseStats,
          habilidades: Object.values(s.abilities),
          peso: s.weightkg,
          altura: s.heightm,
          tags: ["alternate_form", ...(s.tags || [])]
        }
      }
    });
  });

  console.log("✨ ETL Completado con éxito.");
}

main()
  .catch(e => {
    console.error("❌ Error en ETL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
