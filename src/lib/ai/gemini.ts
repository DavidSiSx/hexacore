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
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles OU (Generation 9). Respeta las bans competitivas usuales (ningún Pokémon Ubers como Koraidon, Miraidon, Flutter Mane, Calyrex, etc.).";
      } else if (options.format === "smogon-ubers") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles Ubers (Generation 9). Se permiten los Pokémon más poderosos y restringidos del juego sin restricciones de nivel de poder (ej. Calyrex-Shadow, Koraidon, Miraidon).";
      } else if (options.format === "smogon-uu") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Singles UU (Underused, Generation 9). Están prohibidos todos los Pokémon de las tiers superiores (OU y Ubers).";
      } else if (options.format === "smogon-doubles-ou") {
        constraintsPrompt += "Debes diseñar el equipo para Smogon Doubles OU (Generation 9). Formato de dobles competitivo de Smogon con su propia lista de prohibiciones.";
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

### REGLAS ESTRICTAS:
1. DEBES devolver estrictamente un objeto JSON que siga el esquema requerido.
2. NUNCA inventes movimientos (moves) o habilidades que el Pokémon no pueda aprender legalmente en el juego. Usa el contexto RAG para verificar legalidad.
3. Asegúrate de que los EVs sumen un máximo de 508.
4. Escoge naturalezas que tengan sentido competitivo (ej. No pongas Jolly a un atacante especial).
5. No devuelvas ningún texto fuera del JSON. El sistema intentará hacer JSON.parse() de tu respuesta directamente.
6. Calcula con máxima precisión el 'synergyScore' (0-100) y el 'synergyReason' para cada miembro del equipo basándote en estadísticas de co-ocurrencia de Smogon RAG y coberturas defensivas/ofensivas.
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
