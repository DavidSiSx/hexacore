import "dotenv/config";
import { prisma } from "../lib/db";

const ITEM_ES_DESCRIPTIONS: Record<string, string> = {
  "Leftovers": "Restaura 1/16 de los PS máximos del portador al final de cada turno.",
  "Choice Band": "Multiplica el Ataque del portador por 1.5x, pero le obliga a usar un solo movimiento.",
  "Choice Specs": "Multiplica el Atq. Esp. del portador por 1.5x, pero le obliga a usar un solo movimiento.",
  "Choice Scarf": "Multiplica la Velocidad del portador por 1.5x, pero le obliga a usar un solo movimiento.",
  "Life Orb": "Aumenta el poder de los ataques en un 30%, pero el portador pierde el 10% de sus PS máximos tras cada ataque.",
  "Focus Sash": "Si el portador tiene los PS al máximo, sobrevive a un ataque letal con 1 PS. De un solo uso.",
  "Assault Vest": "Multiplica la Def. Esp. del portador por 1.5x, pero le impide usar movimientos de estado.",
  "Heavy-Duty Boots": "Protege al portador de los efectos de las trampas del campo al entrar al combate.",
  "Eviolite": "Multiplica la Defensa y Def. Esp. del portador por 1.5x si la especie aún puede evolucionar.",
  "Expert Belt": "Aumenta el daño de los ataques súper efectivos en un 20%.",
  "Rocky Helmet": "Daña al atacante con 1/6 de sus PS máximos si hace contacto físico con el portador.",
  "Black Sludge": "Restaura 1/16 de los PS máximos cada turno si el portador es de tipo Veneno; si no, le resta 1/8.",
  "Figy Berry": "Restaura 1/3 de los PS máximos cuando la salud cae al 25% o menos; confunde si la naturaleza resta Ataque.",
  "Enigma Berry": "Restaura 1/4 de los PS máximos tras recibir un ataque súper efectivo. De un solo uso.",
  "Aguav Berry": "Restaura 1/3 de los PS máximos cuando la salud cae al 25% o menos; confunde si la naturaleza resta Def. Esp.",
  "Iapapa Berry": "Restaura 1/3 de los PS máximos cuando la salud cae al 25% o menos; confunde si la naturaleza resta Defensa.",
  "Mago Berry": "Restaura 1/3 de los PS máximos cuando la salud cae al 25% o menos; confunde si la naturaleza resta Velocidad.",
  "Wiki Berry": "Restaura 1/3 de los PS máximos cuando la salud cae al 25% o menos; confunde si la naturaleza resta Atq. Esp.",
  "Sitrus Berry": "Restaura 1/4 de los PS máximos cuando la salud cae al 50% o menos. De un solo uso.",
  "Lum Berry": "Cura cualquier estado alterado (parálisis, sueño, quemadura, congelación, veneno o confusión). De un solo uso.",
  "Ability Shield": "Protege la habilidad del portador de ser cambiada, suprimida o ignorada por cualquier efecto.",
  "Clear Amulet": "Evita que los movimientos o habilidades de los oponentes reduzcan las estadísticas del portador.",
  "Mirror Herb": "Copia los aumentos de estadísticas del oponente cuando este se los sube. De un solo uso.",
  "Covert Cloak": "Protege al portador de los efectos secundarios de los movimientos de los oponentes.",
  "Loaded Dice": "Garantiza que los movimientos que golpean varias veces impacten la mayor cantidad de veces posible.",
  "Punching Glove": "Aumenta el poder de los ataques basados en puñetazos y evita el contacto físico al usarlos.",
  "Booster Energy": "Aumenta la estadística más alta del portador si tiene la habilidad Protosíntesis o Carga Cuadrática.",
  "Air Balloon": "Otorga inmunidad a los ataques de tipo Tierra. Se explota si el portador recibe un golpe.",
  "White Herb": "Restaura cualquier estadística que haya sido reducida. De un solo uso.",
  "Mental Herb": "Libera al portador de efectos como Atracción, Mofa, Otra Vez, Tormento, Anticura o Anticambio.",
  "Power Herb": "Permite ejecutar movimientos que requieren un turno de carga instantáneamente. De un solo uso.",
  "King's Rock": "Otorga un 10% de probabilidad de amedrentar al objetivo al usar movimientos que causan daño.",
};

const ITEM_ES_NAMES: Record<string, string> = {
  "Leftovers": "Restos",
  "Choice Band": "Cinta Elección",
  "Choice Specs": "Gafas Elección",
  "Choice Scarf": "Pañuelo Elección",
  "Life Orb": "Vidasfera",
  "Focus Sash": "Banda Aguante",
  "Assault Vest": "Chaleco Asalto",
  "Heavy-Duty Boots": "Botas de Suela Dura",
  "Eviolite": "Mineral Evolutivo",
  "Expert Belt": "Cinta Experto",
  "Rocky Helmet": "Casco Dentado",
  "Black Sludge": "Lodo Negro",
  "Aguav Berry": "Baya Guaya",
  "Figy Berry": "Baya Figy",
  "Iapapa Berry": "Baya Iapapa",
  "Mago Berry": "Baya Mago",
  "Wiki Berry": "Baya Wiki",
  "Sitrus Berry": "Baya Cidra",
  "Lum Berry": "Baya Lum",
  "Ability Shield": "Escudo Habilidad",
  "Clear Amulet": "Amuleto Claro",
  "Mirror Herb": "Hierba Copia",
  "Covert Cloak": "Capa Furtiva",
  "Loaded Dice": "Dados Trucados",
  "Punching Glove": "Guante de Boxeo",
  "Booster Energy": "Energía Potenciadora",
  "Air Balloon": "Globo Helio",
  "White Herb": "Hierba Blanca",
  "Mental Herb": "Hierba Mental",
  "Power Herb": "Hierba Única",
  "White Herb": "Hierba Blanca",
  "Babiri Berry": "Baya Baribá",
  "Chople Berry": "Baya Pomaro",
  "Kebia Berry": "Baya Kebia",
  "Shuca Berry": "Baya Tamar",
  "Coba Berry": "Baya Kouba",
  "Payapa Berry": "Baya Payapa",
  "Tanga Berry": "Baya Tanga",
  "Charti Berry": "Baya Charti",
  "Kasib Berry": "Baya Kasib",
  "Haban Berry": "Baya Habán",
  "Colbur Berry": "Baya Colbur",
  "Roseli Berry": "Baya Roseli",
  "Chilan Berry": "Baya Chilán",
  "Lansat Berry": "Baya Lansat",
  "Starf Berry": "Baya Zonstans",
  "Enigma Berry": "Baya Enigma",
  "Micle Berry": "Baya Micole",
  "Custap Berry": "Baya Chira",
  "Jaboca Berry": "Baya Jaboca",
  "Rowap Berry": "Baya Magua",
  "Kee Berry": "Baya Maranga",
  "Maranga Berry": "Baya Maranga",
};

// Mapa inverso para detectar nombres en inglés desde español
const ITEM_NAME_TO_EN: Record<string, string> = Object.entries(ITEM_ES_NAMES).reduce((acc, [en, es]) => {
  acc[es] = en;
  return acc;
}, {} as Record<string, string>);

const MOVE_ES_DESCRIPTIONS: Record<string, string> = {
  "Earthquake": "Ataca a todos los Pokémon adyacentes. Doble de poder si el objetivo está usando Dig.",
  "Protect": "Protege al usuario de todos los ataques en este turno. Su probabilidad de éxito baja si se usa consecutivamente.",
  "Thunderbolt": "Tiene un 10% de probabilidad de paralizar al objetivo.",
  "Ice Beam": "Tiene un 10% de probabilidad de congelar al objetivo.",
  "Flamethrower": "Tiene un 10% de probabilidad de quemar al objetivo.",
  "Scald": "Tiene un 30% de probabilidad de quemar al objetivo. Descongela al usuario si está congelado.",
  "Stealth Rock": "Lanza rocas puntiagudas que dañan a los Pokémon rivales que entren al combate según su debilidad al tipo Roca.",
  "Spore": "Duerme de forma garantizada al objetivo. No afecta a tipos Planta ni a portadores de Overcoat.",
  "Knock Off": "Poder 1.5x si el objetivo lleva un objeto equipable. El objeto es desprendido y no puede usarse.",
  "U-turn": "Tras atacar, el usuario regresa instantáneamente a su Poké Ball para dar paso a un compañero.",
  "Volt Switch": "Tras atacar, el usuario regresa instantáneamente a su Poké Ball para dar paso a un compañero."
};

const ABILITY_ES_DESCRIPTIONS: Record<string, string> = {
  "Intimidate": "Al entrar en combate, reduce un nivel el Ataque de los oponentes adyacentes.",
  "Levitate": "Otorga inmunidad total a los ataques de tipo Tierra y a las trampas del suelo.",
  "Overgrow": "Aumenta el poder de los movimientos de tipo Planta en un 50% cuando los PS caen por debajo de 1/3.",
  "Blaze": "Aumenta el poder de los movimientos de tipo Fuego en un 50% cuando los PS caen por debajo de 1/3.",
  "Torrent": "Aumenta el poder de los movimientos de tipo Agua en un 50% cuando los PS caen por debajo de 1/3.",
  "Swarm": "Aumenta el poder de los movimientos de tipo Bicho en un 50% cuando los PS caen por debajo de 1/3.",
  "Solar Power": "Bajo clima soleado, aumenta el Atq. Esp. un 50%, pero pierde 1/8 de PS cada turno.",
  "Chlorophyll": "Duplica la Velocidad del Pokémon bajo clima soleado.",
  "Rain Dish": "Restaura 1/16 de los PS máximos al final de cada turno bajo la lluvia.",
  "Sand Stream": "Invoca una tormenta de arena que dura 5 turnos al entrar en combate.",
  "Drizzle": "Invoca lluvia intensa que dura 5 turnos al entrar en combate.",
  "Drought": "Invoca luz solar intensa que dura 5 turnos al entrar en combate."
};

const POKEMON_NAME_MAP: Record<string, string> = {
  "Bulbasaur": "Bulbasaur", "Ivysaur": "Ivysaur", "Venusaur": "Venusaur",
  "Charmander": "Charmander", "Charmeleon": "Charmeleon", "Charizard": "Charizard",
  "Squirtle": "Squirtle", "Wartortle": "Wartortle", "Blastoise": "Blastoise",
  "Pikachu": "Pikachu", "Raichu": "Raichu", "Jigglypuff": "Jigglypuff",
  "Meowth": "Meowth", "Psyduck": "Psyduck", "Arcanine": "Arcanine",
  "Alakazam": "Alakazam", "Machamp": "Machamp", "Gengar": "Gengar",
  "Gyarados": "Gyarados", "Lapras": "Lapras", "Eevee": "Eevee",
  "Snorlax": "Snorlax", "Dragonite": "Dragonite", "Mewtwo": "Mewtwo",
  "Mew": "Mew", "Great Tusk": "Colmilargo", "Iron Valiant": "Ferrovaliente",
  "Gholdengo": "Gholdengo", "Kingambit": "Kingambit", "Dragapult": "Dragapult",
  "Roaring Moon": "Bramaluna", "Iron Hands": "Ferropalmas", "Incineroar": "Incineroar"
};

function translateStringFallback(text: string): string {
  if (!text) return "Sin descripción disponible.";
  let translated = text;
  
  const rules = [
    { en: /Restores 1\/16 max HP at the end of each turn\./gi, es: "Restaura 1/16 de los PS máximos al final de cada turno." },
    { en: /Holder's/gi, es: "del portador" },
    { en: /If held by a (.*?), its/gi, es: "Si lo lleva un $1, su" },
    { en: /Raises (.*?) by (\d+) stage if/gi, es: "Sube el $1 en $2 nivel si" },
    { en: /Special Defense/gi, es: "Defensa Especial" },
    { en: /Special Attack/gi, es: "Ataque Especial" },
    { en: /Defense/gi, es: "Defensa" },
    { en: /Attack/gi, es: "Ataque" },
    { en: /Speed/gi, es: "Velocidad" },
    { en: /Single use\./gi, es: "De un solo uso." },
    { en: /Usually goes first\./gi, es: "Ataca primero." },
    { en: /No additional effect\./gi, es: "Sin efectos adicionales." },
    { en: /Has a (\d+)% chance to (.*?)\./gi, es: "Tiene un $1% de probabilidad de $2." },
    { en: /flinch the target/gi, es: "amedrentar al objetivo" },
    { en: /burn the target/gi, es: "quemar al objetivo" },
    { en: /freeze the target/gi, es: "congelar al objetivo" },
    { en: /paralyze the target/gi, es: "paralizar al objetivo" },
    { en: /poison the target/gi, es: "envenenar al objetivo" },
    { en: /confuses if/gi, es: "confunde si" },
    { en: /-SpD Nature/gi, es: "la naturaleza resta Def. Esp." },
    { en: /-Atk Nature/gi, es: "la naturaleza resta Ataque" },
    { en: /-Def Nature/gi, es: "la naturaleza resta Defensa" },
    { en: /-Spe Nature/gi, es: "la naturaleza resta Velocidad" },
    { en: /-SpA Nature/gi, es: "la naturaleza resta Atq. Esp." },
    { en: /Restores (.*?) max HP/gi, es: "Restaura $1 de los PS máximos" },
    { en: /at 1\/4 max HP or less/gi, es: "cuando los PS bajan del 25%" },
    { en: /at 1\/2 max HP or less/gi, es: "cuando los PS bajan del 50%" },
  ];

  rules.forEach(rule => {
    translated = translated.replace(rule.en, rule.es);
  });

  return translated;
}

async function getPokeApiData(name: string) {
  try {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getOfficialTranslations(type: "ability" | "move" | "item", name: string) {
  try {
    // Normalizar nombre para PokeAPI (slug)
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await fetch(`https://pokeapi.co/api/v2/${type === "item" ? "item" : type}/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();

    const esName = data.names?.find((n: any) => n.language.name === "es")?.name;
    
    // Buscar descripción en español (flavor_text)
    let esDesc = "";
    if (type === "item") {
      esDesc = data.flavor_text_entries?.find((f: any) => f.language.name === "es")?.text;
    } else {
      esDesc = data.flavor_text_entries?.find((f: any) => f.language.name === "es" && (f.version_group?.name === "scarlet-violet" || f.version_group?.name === "sword-shield"))?.flavor_text 
              || data.flavor_text_entries?.find((f: any) => f.language.name === "es")?.flavor_text;
    }

    if (!esName && !esDesc) return null;
    return { 
      esName, 
      esDesc: esDesc?.replace(/\n/g, " ").replace(/\f/g, " ") 
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("🚀 Iniciando motor de traducción profesional y sincronización Showdown...");

  // 1. Objetos
  const objetos = await prisma.objeto.findMany();
  console.log(`📦 Procesando ${objetos.length} Objetos...`);
  const OBJ_BATCH = 20;
  for (let i = 0; i < objetos.length; i += OBJ_BATCH) {
    const batch = objetos.slice(i, i + OBJ_BATCH);
    await Promise.all(batch.map(async (obj) => {
      const descObj = obj.descripciones as any || {};
      const nombresObj = obj.nombres as any || {};
      
      // Intentar obtener el nombre en inglés para el slug de PokeAPI
      // Prioridad: 1. Mapa inverso, 2. nombresObj.en, 3. obj.nombre (si no tiene tildes)
      const englishName = ITEM_NAME_TO_EN[obj.nombre] || nombresObj.en || (/[áéíóúñÁÉÍÓÚÑ]/.test(obj.nombre) ? obj.nombre : obj.nombre);

      let esName = ITEM_ES_NAMES[englishName] || nombresObj.es;
      let esText = ITEM_ES_DESCRIPTIONS[englishName] || descObj.es;

      const seemsCorrupt = esText && (esText.toLowerCase().includes("puntos de experiencia") && !englishName.toLowerCase().includes("exp"));
      
      const isStillEnglish = esText && (esText.includes("This Pokemon") || esText.includes("Raises the") || esText.includes("Restores"));
      const isBabiri = englishName.toLowerCase().includes("babiri");
      
      if (!esName || !esText || esText.includes("Ataque") || seemsCorrupt || isStillEnglish || isBabiri) {
        const official = await getOfficialTranslations("item", englishName);
        if (official) {
          esName = official.esName || esName;
          esText = official.esDesc || esText;
        }
      }

      esText = esText || translateStringFallback(descObj.en || "");
      esName = esName || obj.nombre;

      const itemSlug = englishName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sprite_url = `https://play.pokemonshowdown.com/sprites/itemicons/${itemSlug}.png`;

      await prisma.objeto.update({
        where: { id: obj.id },
        data: {
          nombres: { ...nombresObj, en: englishName, es: esName },
          descripciones: { ...descObj, en: descObj.en || "No description.", es: esText },
          sprite_url
        }
      });
    }));
    console.log(`⏳ Objetos: ${Math.min(i + OBJ_BATCH, objetos.length)}/${objetos.length}`);
  }

  // 2. Movimientos
  const movimientos = await prisma.movimiento.findMany();
  console.log(`⚔️ Procesando ${movimientos.length} Movimientos...`);
  const MOV_BATCH = 20;
  for (let i = 0; i < movimientos.length; i += MOV_BATCH) {
    const batch = movimientos.slice(i, i + MOV_BATCH);
    await Promise.all(batch.map(async (mov) => {
      const descMov = mov.descripciones as any || {};
      const nombresMov = mov.nombres as any || {};
      
      let esText = MOVE_ES_DESCRIPTIONS[mov.nombre] || descMov.es;
      let esName = nombresMov.es;

      if (!esText || !esName || esText.includes("Ataque")) {
        const official = await getOfficialTranslations("move", mov.nombre);
        if (official) {
          esName = official.esName || esName;
          esText = official.esDesc || esText;
        }
      }

      esText = esText || translateStringFallback(descMov.en || "");
      
      await prisma.movimiento.update({
        where: { id: mov.id },
        data: { 
          nombres: { ...nombresMov, en: mov.nombre, es: esName || mov.nombre },
          descripciones: { ...descMov, es: esText } 
        }
      });
    }));
    console.log(`⏳ Movimientos: ${Math.min(i + MOV_BATCH, movimientos.length)}/${movimientos.length}`);
  }

  // 3. Habilidades
  const habilidades = await prisma.habilidad.findMany();
  console.log(`🧠 Procesando ${habilidades.length} Habilidades...`);
  const HAB_BATCH = 20;
  for (let i = 0; i < habilidades.length; i += HAB_BATCH) {
    const batch = habilidades.slice(i, i + HAB_BATCH);
    await Promise.all(batch.map(async (hab) => {
      const descHab = hab.descripciones as any || {};
      const nombresHab = hab.nombres as any || {};

      let esText = ABILITY_ES_DESCRIPTIONS[hab.nombre] || descHab.es;
      let esName = nombresHab.es;
 
      // Force re-translation if it looks English
      const isStillEnglishHab = esText && (esText.includes("This Pokémon") || esText.includes("has its") || esText.includes("Power of"));
 
      if (!esText || !esName || isStillEnglishHab) {
        const official = await getOfficialTranslations("ability", hab.nombre);
        if (official) {
          esName = official.esName || esName;
          esText = official.esDesc || esText;
        }
      }

      esText = esText || translateStringFallback(descHab.en || "");

      await prisma.habilidad.update({
        where: { id: hab.id },
        data: { 
          nombres: { ...nombresHab, en: hab.nombre, es: esName || hab.nombre },
          descripciones: { ...descHab, es: esText } 
        }
      });
    }));
    console.log(`⏳ Habilidades: ${Math.min(i + HAB_BATCH, habilidades.length)}/${habilidades.length}`);
  }

  // 4. Criaturas
  console.log("🚀 Sincronizando Pokémon (Altura, Peso, Tiering)...");
  const criaturas = await prisma.criatura.findMany();
  const BATCH_SIZE = 25;
  for (let i = 0; i < criaturas.length; i += BATCH_SIZE) {
    const batch = criaturas.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (c) => {
      try {
        const attrs = c.atributos_de_combate as any || {};
        let altura = attrs.altura;
        let peso = attrs.peso;

        if (!altura || !peso || altura === 0) {
          const pData = await getPokeApiData(c.nombre);
          if (pData) {
            altura = pData.height / 10;
            peso = pData.weight / 10;
          }
        }

        const TIER_FIXES: Record<string, string> = { "Clefable": "UU", "Gholdengo": "OU", "Kingambit": "OU" };
        const tier = TIER_FIXES[c.nombre] || attrs.tier || "UU";
        const usage_stats: Record<string, number> = attrs.usage_stats || { "OU": 2.5, "UU": 1.2, "VGC": 5.0 };
        const nameEs = POKEMON_NAME_MAP[c.nombre] || (c.nombres as any)?.es || c.nombre;

        await prisma.criatura.update({
          where: { id: c.id },
          data: {
            nombres: { ...(c.nombres as any || {}), en: c.nombre, es: nameEs },
            atributos_de_combate: { ...attrs, tier, altura, peso, usage_stats }
          }
        });
      } catch (e) {}
    }));
    if (i % 100 === 0) console.log(`⏳ Pokémon: ${i}/${criaturas.length}`);
  }
  console.log("✨ Sincronización completa.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
