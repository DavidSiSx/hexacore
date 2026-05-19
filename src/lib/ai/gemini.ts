import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { AITeam, TeamGenerationOptions } from "../schemas/team";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const teamResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    teamName: { type: SchemaType.STRING, description: "Un nombre llamativo para el equipo" },
    format: { type: SchemaType.STRING, description: "Formato para el que fue diseñado (ej. VGC, OU)" },
    strategy: { type: SchemaType.STRING, description: "Explicación general de la sinergia y cómo se juega el equipo" },
    members: {
      type: SchemaType.ARRAY,
      description: "Los 6 integrantes del equipo",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          species: { type: SchemaType.STRING, description: "Nombre exacto del Pokémon" },
          item: { type: SchemaType.STRING, description: "Objeto equipado competitivo" },
          ability: { type: SchemaType.STRING, description: "Habilidad competitiva ideal" },
          nature: { type: SchemaType.STRING, description: "Naturaleza (ej. Timid, Jolly)" },
          evs: { 
            type: SchemaType.OBJECT, 
            description: "Distribución de EVs. ej: {'HP': 252, 'Spe': 252, 'SpA': 4}",
            properties: {
              HP: { type: SchemaType.INTEGER },
              Atk: { type: SchemaType.INTEGER },
              Def: { type: SchemaType.INTEGER },
              SpA: { type: SchemaType.INTEGER },
              SpD: { type: SchemaType.INTEGER },
              Spe: { type: SchemaType.INTEGER },
            }
          },
          ivs: { 
            type: SchemaType.OBJECT, 
            description: "Distribución de IVs, asume 31 si no se especifica. Útil para Trick room (Spe: 0)",
            properties: {
              HP: { type: SchemaType.INTEGER },
              Atk: { type: SchemaType.INTEGER },
              Def: { type: SchemaType.INTEGER },
              SpA: { type: SchemaType.INTEGER },
              SpD: { type: SchemaType.INTEGER },
              Spe: { type: SchemaType.INTEGER },
            }
          },
          moves: {
            type: SchemaType.ARRAY,
            description: "Exactamente 4 movimientos legales",
            items: { type: SchemaType.STRING }
          },
          teraType: { type: SchemaType.STRING, description: "Tipo Teracristal ideal" },
          role: { type: SchemaType.STRING, description: "Breve explicación de su rol en el equipo" },
          level: { type: SchemaType.INTEGER, description: "Nivel del Pokémon (ej. 5 para Little Cup, 50 para VGC o 100 para otros)" },
          synergyScore: { type: SchemaType.INTEGER, description: "Porcentaje del 0 al 100 que refleja su nivel de sinergia competitiva con el resto del equipo" },
          synergyReason: { type: SchemaType.STRING, description: "Detalle matemático/estratégico del porqué de su sinergia (co-ocurrencias, coberturas, soporte)" }
        },
        required: ["species", "item", "ability", "nature", "evs", "moves", "teraType", "role", "synergyScore", "synergyReason"]
      }
    }
  },
  required: ["teamName", "format", "strategy", "members"]
};

export async function generateTeamWithGemini(
  userPrompt: string,
  ragContext: string,
  options?: TeamGenerationOptions
): Promise<AITeam> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
  }

  // Lista de modelos ordenada de más deseable a fallback de emergencia
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.0-flash",
    "gemini-1.5-flash"
  ];

  let constraintsPrompt = "";
  if (options) {
    if (options.forcePokemon && options.forcePokemon.length > 0) {
      constraintsPrompt += `\n- EL EQUIPO DEBE INCLUIR OBLIGATORIAMENTE ESTAS ESPECIES DE POKÉMON: [${options.forcePokemon.join(", ")}].`;
    }
    if (options.banPokemon && options.banPokemon.length > 0) {
      constraintsPrompt += `\n- EL EQUIPO TIENE TOTALMENTE PROHIBIDO INCLUIR A ESTOS POKÉMON: [${options.banPokemon.join(", ")}].`;
    }
    if (options.monotype) {
      constraintsPrompt += `\n- RESTRICCIÓN MONOTYPE: Todos los 6 Pokémon del equipo deben poseer el tipo elemental "${options.monotype}" (como tipo primario o secundario).`;
    }
    if (options.bannedMoves && options.bannedMoves.length > 0) {
      constraintsPrompt += `\n- EL EQUIPO TIENE TOTALMENTE PROHIBIDO CONTENER ESTOS MOVIMIENTOS EN CUALQUIERA DE LOS POKÉMON: [${options.bannedMoves.join(", ")}].`;
    }
    if (options.format) {
      constraintsPrompt += `\n- FORMATO DE JUEGO / REGULACIÓN: "${options.format}". `;
      if (options.format === "regulation-h") {
        constraintsPrompt += "Debes seguir estrictamente la REGULACIÓN H de VGC. Están completamente PROHIBIDOS todos los Pokémon legendarios principales (ej. Koraidon, Miraidon, Calyrex), sub-legendarios/semi-legendarios (ej. Urshifu, Landorus, Tornadus, Ogerpon, Ruin Quartet), Pokémon paradoja (ej. Flutter Mane, Iron Hands, Great Tusk) y Ultraentes (ej. Kartana, Nihilego). Todo tu equipo debe consistir solo de Pokémon regionales estándar (ej. Gholdengo, Archaludon, Amoonguss, Pelipper, Incineroar, Primarina, etc.).";
      } else if (options.format === "regulation-g") {
        constraintsPrompt += "Debes seguir la REGULACIÓN G de VGC. Se permite exactamente UN (1) Pokémon Restringido (Legendario mayor/Box Legendary) por equipo (ej. Calyrex-Shadow, Kyogre, Koraidon, Miraidon, Zacian, Groudon, Terapagos). Los otros 5 miembros deben ser Pokémon normales, paradojas o sub-legendarios legales (se permite Flutter Mane, Urshifu, etc., pero ningún otro legendario mayor).";
      } else if (options.format === "regulation-f") {
        constraintsPrompt += "Debes seguir la REGULACIÓN F de VGC. Están prohibidos los Pokémon Restringidos mayores (ej. Calyrex, Koraidon, Miraidon), pero SE PERMITEN sub-legendarios (ej. Urshifu, Ogerpon, Tornadus, Chien-Pao) y Pokémon paradoja (ej. Flutter Mane, Iron Hands).";
      } else if (options.format === "regulation-e") {
        constraintsPrompt += "Debes seguir la REGULACIÓN E de VGC. Permite Pokémon de la expansión The Teal Mask (incluyendo a Ogerpon y Ursaluna-Bloodmoon) y sub-legendarios/paradojas, pero los Pokémon Restringidos mayores están completamente PROHIBIDOS.";
      } else if (options.format === "regulation-d") {
        constraintsPrompt += "Debes seguir la REGULACIÓN D de VGC. Permite transferencias de Pokémon HOME (ej. Urshifu, Landorus, Cresselia, Heatran) y Pokémon paradoja básicos, pero NO permite Pokémon del DLC (sin Ogerpon, Archaludon, etc.) ni Pokémon Restringidos mayores.";
      } else if (options.format === "regulation-c") {
        constraintsPrompt += "Debes seguir la REGULACIÓN C de VGC. Permite los Pokémon paradoja iniciales y el Cuarteto de la Ruina (Chien-Pao, Chi-Yu, Ting-Lu, Wo-Chien), pero NO se permiten transferencias de HOME ni Pokémon Restringidos mayores.";
      } else if (options.format === "championship-series") {
        constraintsPrompt += "Debes diseñar el equipo bajo las reglas oficiales del VGC Championship Series (formato de Campeonato Mundial oficial). Asegura que el equipo sea de nivel competitivo supremo, con sets optimizados de alta sinergia.";
      } else if (options.format === "smogon-ou") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles OU (Generation 9). Respeta las bans competitivas usuales (ningún Pokémon Ubers como Koraidon, Miraidon, Flutter Mane, Calyrex, etc.). En este formato, carecer de un limpiador de Hazards (Defog, Rapid Spin, Mortal Spin) es una deficiencia crítica, y debes asegurar un control de velocidad (Choice Scarf o revenge killer rápido).";
      } else if (options.format === "smogon-ubers") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles Ubers (Generation 9). Se permiten los Pokémon más poderosos y restringidos del juego sin restricciones de nivel de poder (ej. Calyrex-Shadow, Koraidon, Miraidon). Ten en cuenta que el clima/terreno es dominante (Koraidon, Kyogre, Miraidon) y debes controlarlo o responder a él.";
      } else if (options.format === "smogon-uu") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles UU (Underused, Generation 9). Están prohibidos todos los Pokémon de las tiers superiores (OU y Ubers). Debes incluir obligatoriamente un limpiador de Hazards (Defog, Rapid Spin, Mortal Spin) and un control de velocidad (Choice Scarf o revenge killer rápido).";
      } else if (options.format === "smogon-ru") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles RU (Rarely Used, Generation 9). Están prohibidos todos los Pokémon de las tiers superiores (OU, UU y Ubers). Debes incluir obligatoriamente un limpiador de Hazards (Defog, Rapid Spin, Mortal Spin) y un control de velocidad (Choice Scarf o revenge killer rápido).";
      } else if (options.format === "smogon-nu") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles NU (Never Used, Generation 9). Están prohibidos todos los Pokémon de las tiers superiores (OU, UU, RU y Ubers). Debes incluir obligatoriamente un limpiador de Hazards (Defog, Rapid Spin, Mortal Spin) y un control de velocidad (Choice Scarf o revenge killer rápido).";
      } else if (options.format === "smogon-pu") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles PU (Generation 9). Están prohibidos todos los Pokémon de las tiers superiores (OU, UU, RU, NU y Ubers). Debes incluir obligatoriamente un limpiador de Hazards (Defog, Rapid Spin, Mortal Spin) y un control de velocidad (Choice Scarf o revenge killer rápido).";
      } else if (options.format === "smogon-lc") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Little Cup (Generation 9). Todos los Pokémon del equipo deben ser obligatoriamente de primera etapa evolutiva aptos para el formato (ej. Gligar, Foongus, Mienfoo, Pawniard, Tinkatink, etc.) y estar en su forma básica no evolucionada. Como regla especial de Little Cup, todos los Pokémon deben ser exactamente de Nivel 5 (debes establecer 'level: 5' para todos los miembros). Es crítico equipar 'Eviolite' (Mineral Evolutivo) o 'Berry Juice' (Zumo de Baya) en tus Pokémon.";
      } else if (options.format === "smogon-doubles-ou") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Doubles OU (Generation 9). Formato de dobles competitivo de Smogon con su propia lista de prohibiciones.";
      } else if (options.format === "gen9nationaldex") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex OU (Generation 9). Este formato permite usar Megaevoluciones, Movimientos Z, Reversión Primigenia y todos los Pokémon históricamente disponibles (incluidos los eliminados en la Generación 9). El Teracristal está completamente prohibido en National Dex OU de acuerdo a las últimas regulaciones de Smogon. Es crítico balancear el control de Hazards (Rapid Spin/Defog/Mortal Spin) y tener sinergias potentes que involucren una Mega Evolución única.";
      } else if (options.format === "gen9nationaldexubers") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex Ubers. Un formato extremadamente poderoso donde se permiten los Pokémon más destructivos de la historia de la saga con sus mecánicas heredadas completas (Mega-Rayquaza, Calyrex-Shadow, Zacian-Crowned, etc.) incluyendo Megas, Movimientos Z, Teracristalización y Reversión Primigenia sin límites de nivel de poder.";
      } else if (options.format === "gen9nationaldexuu") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex UU (Underused). Se permiten todas las mecánicas heredadas (Megas, Movimientos Z) pero están prohibidos todos los Pokémon de las tiers superiores (National Dex OU y Ubers). Asegura un limpiador de Hazards y un atacante principal bien definido.";
      } else if (options.format === "gen9nationaldexru") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex RU (Rarely Used). Tier inferior que permite el uso de Megas y Movimientos Z con Pokémon menos frecuentes pero sumamente interesantes y balanceados. Asegura sinergias de tipos y control del ritmo de combate.";
      } else if (options.format === "gen9nationaldexmonotype") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex Monotype. Todos los Pokémon del equipo deben compartir obligatoriamente exactamente un tipo elemental común (primario o secundario) y se permiten mecánicas heredadas (Megaevolución y Movimientos Z) aplicadas a ese tipo común.";
      } else if (options.format === "gen9nationaldexdoubles") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon National Dex Doubles. Este formato permite usar Megaevoluciones, Movimientos Z, Reversión Primigenia y todos los Pokémon históricamente disponibles en combates de dobles de National Dex. Asegura sinergias potentes de dobles, control de velocidad (como Tailwind o Trick Room) y excelente coherencia ofensiva/defensiva.";
      }
    }
    if (options.customRules) {
      const rules = options.customRules;
      constraintsPrompt += `\n- REGLAS DE FORMATO PERSONALIZADO ACTIVO:`;
      if (rules.speciesClause) {
        constraintsPrompt += `\n  * Species Clause: No puedes tener Pokémon duplicados de la misma especie.`;
      }
      if (rules.itemClause) {
        constraintsPrompt += `\n  * Item Clause: No puedes tener dos Pokémon con el mismo objeto equipado.`;
      }
      if (rules.allowMega !== undefined) {
        if (!rules.allowMega) {
          constraintsPrompt += `\n  * Mega Evolución PROHIBIDA: Ningún Pokémon debe llevar Mega Piedra u Orbe Primigenio.`;
        } else {
          constraintsPrompt += `\n  * Mega Evolución PERMITIDA: Puedes usar Mega Piedras.`;
        }
      }
      if (rules.allowZMove !== undefined) {
        if (!rules.allowZMove) {
          constraintsPrompt += `\n  * Movimientos Z PROHIBIDOS: Ningún Pokémon debe llevar un Cristal Z.`;
        } else {
          constraintsPrompt += `\n  * Movimientos Z PERMITIDOS: Puedes usar Cristales Z.`;
        }
      }
      if (rules.allowTera !== undefined) {
        if (!rules.allowTera) {
          constraintsPrompt += `\n  * Teracristalización PROHIBIDA: Ningún Pokémon puede teracristalizar (los sets no deben depender de Teratipos especiales, de preferencia teratipos base).`;
        } else {
          constraintsPrompt += `\n  * Teracristalización PERMITIDA: Elige el mejor tipo Teracristal competitivo.`;
        }
      }
      if (rules.minLevel !== undefined && rules.maxLevel !== undefined) {
        constraintsPrompt += `\n  * Nivel de Pokémon: Todos los Pokémon deben estar exactamente entre Nivel ${rules.minLevel} y Nivel ${rules.maxLevel}. Ajusta el atributo 'level' de cada Pokémon acorde a esto.`;
      }
      if (rules.bans) {
        if (rules.bans.pokemon && rules.bans.pokemon.length > 0) {
          constraintsPrompt += `\n  * POKÉMON PROHIBIDOS (BANEADOS): [${rules.bans.pokemon.join(", ")}].`;
        }
        if (rules.bans.items && rules.bans.items.length > 0) {
          constraintsPrompt += `\n  * OBJETOS PROHIBIDOS (BANEADOS): [${rules.bans.items.join(", ")}].`;
        }
        if (rules.bans.moves && rules.bans.moves.length > 0) {
          constraintsPrompt += `\n  * MOVIMIENTOS PROHIBIDOS (BANEADOS): [${rules.bans.moves.join(", ")}].`;
        }
        if (rules.bans.abilities && rules.bans.abilities.length > 0) {
          constraintsPrompt += `\n  * HABILIDADES PROHIBIDAS (BANEADAS): [${rules.bans.abilities.join(", ")}].`;
        }
      }
    }
    if (options.archetype) {
      constraintsPrompt += `\n- ARQUETIPO TÁCTICO / MECÁNICA CLAVE: "${options.archetype}". `;
      if (options.archetype === "rain") {
        constraintsPrompt += "Equipo de lluvia (Rain Team). Debes incluir un activador de lluvia con habilidad Drizzle (ej. Pelipper o Politoed) y atacantes con habilidades sinérgicas como Swift Swim (ej. Archaludon con Electro Shot, Basculegion, Palafin, Overqwil) y movimientos de agua potenciados.";
      } else if (options.archetype === "sun") {
        constraintsPrompt += "Equipo de sol (Sun Team). Debes incluir un activador de sol con habilidad Drought (ej. Torkoal o Ninetales) y atacantes que aprovechen el sol con habilidad Protosynthesis (si se permiten paradojas, ej. Gouging Fire, Raging Bolt) o Chlorophyll (ej. Venusaur, Lilligant-Hisui) y movimientos de fuego potenciados.";
      } else if (options.archetype === "sand") {
        constraintsPrompt += "Equipo de arena (Sand Team). Debes incluir un activador de arena con Sand Stream (ej. Tyranitar o Hippowdon) y Pokémon inmunes o que aprovechen la tormenta con Sand Rush (ej. Excadrill, Houndstone).";
      } else if (options.archetype === "snow") {
        constraintsPrompt += "Equipo de nieve (Snow Team). Debes incluir un activador con Snow Warning (ej. Abomasnow o Ninetales-Alola) y Pokémon que aprovechen la nieve con Slush Rush o con boost de defensa física por hielo (ej. Cetitan, Baxcalibur, Arctibax, Alolan Sandslash).";
      } else if (options.archetype === "trick-room") {
        constraintsPrompt += "Equipo de Espacio Raro (Trick Room). Debes incluir al menos un Trick Room setter lento con alta durabilidad (ej. Cresselia, Dusclops, Porygon2, Farigiraf, Ursaluna-Bloodmoon) y Pokémon sumamente lentos con 0 IVs en velocidad (Spe IV: 0) y naturalezas que bajen velocidad (ej. Brave, Quiet). El prompt debe reflejar Spe IV: 0 para atacantes en Trick Room.";
      } else if (options.archetype === "tailwind") {
        constraintsPrompt += "Equipo de Viento Afín (Tailwind). Debes incluir un setter rápido de Tailwind, idealmente con la habilidad Prankster (ej. Tornadus o Whimsicott) o alta velocidad natural (ej. Talonflame, Roaring Moon) para controlar la velocidad del combate.";
      } else if (options.archetype === "hyper-offense") {
        constraintsPrompt += "Equipo de Ofensiva Total (Hyper Offense). Centrado en atacantes destructivos inmediatos, rompedores de murallas y barrenderos rápidos con boosts (ej. Dragon Dance, Nasty Plot).";
      } else if (options.archetype === "stall") {
        constraintsPrompt += "Equipo defensivo de desgaste (Stall). Centrado en alta defensa, recuperación confiable, hazards, curación de estados y desgaste lento (ej. Blissey, Dondozo, Toxapex, Garganacl).";
      } else if (options.archetype === "balance") {
        constraintsPrompt += "Equipo equilibrado (Balance). Sinergia perfecta de cores defensivos robustos y cores ofensivos potentes que pueden pivotar con facilidad.";
      }
    }
    if (options.blacklistTypes && options.blacklistTypes.length > 0) {
      constraintsPrompt += `\n- EXCLUSIÓN ESTRICTA DE CATEGORÍAS (BLACKLIST): [${options.blacklistTypes.join(", ")}]. `;
      if (options.blacklistTypes.includes("legendary")) {
        constraintsPrompt += "Están COMPLETAMENTE PROHIBIDOS todos los Pokémon Legendarios Restringidos/Mayores (ej. Calyrex, Miraidon, Koraidon, Zacian, Kyogre, Groudon, Rayquaza, Dialga, Palkia, Solgaleo, Lunala, Necrozma, Mewtwo, Lugia, Ho-Oh). ";
      }
      if (options.blacklistTypes.includes("sub-legendary")) {
        constraintsPrompt += "Están COMPLETAMENTE PROHIBIDOS los Pokémon Sub-legendarios o Semi-legendarios menores (ej. Landorus, Tornadus, Thundurus, Urshifu, Ogerpon, Ruin Quartet: Chien-Pao, Chi-Yu, Ting-Lu, Wo-Chien, Okidogi, Munkidori, Fezandipiti, Enamorus, Heatran, Cresselia, Latios, Latias, Gen 1-4 legendary beasts/birds). ";
      }
      if (options.blacklistTypes.includes("paradox")) {
        constraintsPrompt += "Están COMPLETAMENTE PROHIBIDOS todos los Pokémon Paradoja del pasado y del futuro (ej. Flutter Mane, Iron Hands, Great Tusk, Roaring Moon, Iron Valiant, Raging Bolt, Gouging Fire, Iron Crown, etc.). ";
      }
      if (options.blacklistTypes.includes("ultra-beast")) {
        constraintsPrompt += "Están COMPLETAMENTE PROHIBIDOS todos los Ultraentes (ej. Nihilego, Kartana, Buzzwole, Celesteela, Pheromosa, Xurkitree, Guzzlord, Stakataka, Blacephalon). ";
      }
      if (options.blacklistTypes.includes("mythical")) {
        constraintsPrompt += "Están COMPLETAMENTE PROHIBIDOS todos los Pokémon Singulares/Míticos (ej. Mew, Celebi, Jirachi, Deoxys, Darkrai, Arceus, Diancie, Hoopa, Volcanion, Magearna, Marshadow, Zeraora, Meltan, Melmetal, Zarude, Pecharunt). ";
      }
    }
    if (options.metaMode) {
      constraintsPrompt += `\n- RIGIDEZ DE META / MODO DE CONSTRUCCIÓN: "${options.metaMode}". `;
      if (options.metaMode === "meta") {
        constraintsPrompt += "Debes ser sumamente estricto y riguroso con el metagame de alto nivel de torneos. Utiliza únicamente Pokémon tier S/A dominantes en Showdown y campeonatos mundiales, con reparticiones de EVs optimizadas (ej. spreads detallados de supervivencia en lugar de solo 252/252/4 genéricos cuando sea viable para maximizar eficiencia), habilidades competitivas de primer nivel, e ítems óptimos y definidores del meta.";
      } else if (options.metaMode === "optimized") {
        constraintsPrompt += "Diseña un equipo altamente competitivo, funcional e impecablemente optimizado en sus sets, pero con mayor flexibilidad para habilitar combinaciones y sinergias creativas de cores no convencionales.";
      } else if (options.metaMode === "casual") {
        constraintsPrompt += "Prioriza divertirte con la idea conceptual o tema meme solicitado por el usuario (ej. 'equipo de pulpos', 'meme team', 'mono-color', etc.). Puedes usar Pokémon de tiers bajas o inusuales para satisfacer el tema, pero sus sets de movimientos, habilidades y reparticiones de EVs/IVs deben ser 100% legales y mecánicamente coherentes para poder batallar de forma lógica.";
      } else {
        constraintsPrompt += "Balancea el metagame competitivo actual con flexibilidad general de acuerdo a la solicitud del usuario.";
      }
    }
    if (options.currentTeam && options.currentTeam.length > 0) {
      constraintsPrompt += `\n\n### ESTADO ACTUAL DEL EQUIPO A REFINAR:
A continuación se muestra el equipo estructurado que ya has generado previamente:
${JSON.stringify(options.currentTeam, null, 2)}

`;
      if (options.lockedSlots && options.lockedSlots.length > 0) {
        constraintsPrompt += `- SLOTS BLOQUEADOS (LOCKED SLOTS): Los Pokémon en los índices [${options.lockedSlots.join(", ")}] (0-indexed) ESTÁN TOTALMENTE BLOQUEADOS y su set completo (especie, objeto, habilidad, naturaleza, movimientos, EVs, IVs, teraType, etc.) DEBE SER PRESERVADO EXACTAMENTE IGUAL SIN NINGÚN CAMBIO NI MODIFICACIÓN.
`;
        options.lockedSlots.forEach((slotIdx) => {
          const pk = options.currentTeam![slotIdx];
          if (pk) {
            constraintsPrompt += `  * Ranura ${slotIdx} (${pk.species}): Debe conservarse 100% idéntico.\n`;
          }
        });
      }
      if (options.refinementPrompt) {
        constraintsPrompt += `\n- INSTRUCCIÓN DE REFINAMIENTO DEL USUARIO: "${options.refinementPrompt}". Modifica y optimiza el equipo incorporando esta petición únicamente en los Pokémon de las ranuras que NO están bloqueadas. El resto de las ranuras no bloqueadas pueden ser re-diseñadas para mantener o maximizar la sinergia general del equipo.`;
      }
    }
  }

  const prompt = `
Eres Hexacore, un Coach Experto en Pokémon Competitivo (VGC y Smogon).
Tu tarea es construir un equipo altamente sinérgico, legal y competitivo basado en la solicitud del usuario y el conocimiento proporcionado.

### CONOCIMIENTO DE LA BÓVEDA (RAG):
A continuación se presentan estrategias verificadas de Smogon, mecánicas de juego y estadísticas de Showdown que DEBES consultar y respetar para la legalidad:
${ragContext}

### PETICIÓN DEL USUARIO:
"${userPrompt}"
${constraintsPrompt}

### REGLAS ESTRICTAS Y PRE-VALIDACIÓN OBLIGATORIA:
1. DEBES devolver estrictamente un objeto JSON que siga el esquema requerido.
2. NUNCA inventes movimientos o habilidades que el Pokémon no pueda aprender legalmente en el juego. Usa el contexto RAG para verificar la legalidad.
3. Asegúrate de que los EVs sumen un máximo de 508.
4. Escoge naturalezas que tengan sentido competitivo (ej. No pongas Jolly a un atacante especial).
5. No devuelvas ningún texto fuera del JSON. El sistema intentará hacer JSON.parse() de tu respuesta directamente.
6. Calcula con máxima precisión el 'synergyScore' (0-100) y el 'synergyReason' para cada miembro del equipo basándote en estadísticas de co-ocurrencia de Smogon RAG y coberturas defensivas/ofensivas.
7. EVITA ILEGALIDADES BINARIAS Y ADVERTENCIAS DEL VALIDADOR EN TU GENERACIÓN:
   - Un Pokémon con Assault Vest (Chaleco Asalto) NO PUEDE llevar ningún movimiento de estado (como Protect, Swords Dance, Will-O-Wisp, Tailwind, Spore, etc.). Todos sus 4 movimientos deben ser de categoría física o especial (daño directo).
   - Un Pokémon con un objeto Choice ("Choice Specs", "Choice Band", "Choice Scarf") NO DEBE llevar movimientos de protección (Protect/Detect) ni de danza/boosteo (como Swords Dance, Nasty Plot), ya que se quedaría bloqueado en batalla.
   - Evita la Guerra Civil de Climas: No mezcles habilidades de clima opuestas (como Drizzle con Drought) en el mismo equipo si es de Dobles/VGC, a menos que sea Anything Goes o el usuario lo pida.
   - Evita la prioridad en Terreno Psíquico: Si tu equipo activa Terreno Psíquico, no pongas movimientos de prioridad como Fake Out (Sorpresa) en Pokémon terrestres.
   - Coberturas Elementales: Asegúrate de no tener 3 o más Pokémon débiles al mismo tipo elemental sin tener al menos una inmunidad (habilidad o tipo) activa en el equipo para absorberlo.
   - Para formatos de DOBLES/VGC:
     * El equipo DEBE contar con al menos una forma de Control de Velocidad (como Tailwind, Trick Room, Icy Wind, Electroweb).
     * Se recomienda fuertemente que al menos 3 Pokémon lleven Protect o Detect.
   - Para formatos de SINGLES (Smogon OU, UU, RU, etc.):
     * Es OBLIGATORIO contar con al menos un removedor de trampas/Hazards (como Rapid Spin, Defog, Mortal Spin, Tidy Up).
     * El equipo debe contar con un revenge-killer rápido (Velocidad Base >= 110) o un usuario de Choice Scarf.
`;

  let lastError: Error | null = null;

  for (const modelName of models) {
    try {
      console.log(`[TeamBuilder] Intentando generación con el modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: teamResponseSchema as Schema,
          temperature: 0.2, // Baja temperatura para priorizar precisión mecánica sobre creatividad extrema
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const teamData = JSON.parse(responseText) as AITeam;
      
      // Inyectamos el modelo que funcionó para poder mostrarlo en la UI
      teamData.modelUsed = modelName;
      
      console.log(`[TeamBuilder] ¡Generación exitosa con ${modelName}!`);
      return teamData;
    } catch (err: any) {
      console.warn(`[TeamBuilder] Falló generación con el modelo ${modelName}:`, err.message);
      lastError = err;
      // Continúa al siguiente modelo disponible en la rotación
    }
  }

  throw new Error(`Todos los modelos de la rotación de Gemini fallaron. Último error: ${lastError?.message}`);
}
