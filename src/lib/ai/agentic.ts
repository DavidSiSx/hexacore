import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AITeam, TeamGenerationOptions } from "../schemas/team";
import { getRelevantHybridContext } from "./rag";
import { getTypeEffectiveness } from "../battle/engine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const models = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.0-flash",
  "gemini-1.5-flash"
];

// Reutilizamos el esquema JSON estructurado de Gemini para garantizar tipado
import { teamResponseSchema } from "./gemini";

/**
 * Realiza un análisis defensivo simplificado de un Core de Pokémon.
 * Retorna las debilidades elementales acumuladas del Core para guiar el RAG.
 */
export function analyzeCoreWeaknesses(coreMembers: Array<{ species: string; types: string[] }>): string[] {
  const elementWeaknesses: Record<string, number> = {};
  const allElements = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
    "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
    "Dragon", "Dark", "Steel", "Fairy"
  ];

  allElements.forEach((el) => {
    elementWeaknesses[el] = 0;
  });

  coreMembers.forEach((member) => {
    allElements.forEach((attackType) => {
      const eff = getTypeEffectiveness(attackType, member.types);
      if (eff > 1.0) {
        elementWeaknesses[attackType] += eff === 4.0 ? 2 : 1; // Doble debilidad penaliza más
      } else if (eff < 1.0) {
        elementWeaknesses[attackType] -= eff === 0 ? 2 : 1; // Inmunidad/resistencia ayuda
      }
    });
  });

  // Filtrar tipos elementales donde el Core es vulnerable (acumulado > 1)
  return Object.keys(elementWeaknesses).filter((el) => elementWeaknesses[el] > 1);
}

/**
 * Valida de forma adversaria el equipo contra las 10 mayores amenazas del metagame (Red Teaming).
 * Si detecta vulnerabilidad crítica, sugiere ajustes de movimientos o tipos Teracristal.
 */
export function runRedTeamingAudit(members: any[]): { status: "PASS" | "WARNING"; logs: string[] } {
  const topThreats = [
    { name: "Incineroar", type: "Fire/Dark", style: "Físico / Intimidación / Pivot" },
    { name: "Flutter Mane", type: "Ghost/Fairy", style: "Especial Veloz / Specs / Booster Energy" },
    { name: "Urshifu-Rapid-Strike", type: "Water/Fighting", style: "Atacante Físico / Surging Strikes" },
    { name: "Calyrex-Shadow", type: "Psychic/Ghost", style: "Atacante Especial Supremo / Astral Barrage" },
    { name: "Amoonguss", type: "Grass/Poison", style: "Soporte Esporas / Rage Powder / Regenerator" },
    { name: "Rillaboom", type: "Grass", style: "Grassy Glide Prioridad / Fake Out" },
    { name: "Tornadus", type: "Wind/Flying", style: "Tailwind Setter / Bleakwind Storm / Prankster" },
    { name: "Gholdengo", type: "Steel/Ghost", style: "Inmune a Estado / Make It Rain" },
    { name: "Chien-Pao", type: "Dark/Ice", style: "Sword of Ruin / Atacante Físico Veloz" },
    { name: "Miraidon", type: "Electric/Dragon", style: "Electric Terrain / Hadron Engine / Electro Drift" },
  ];

  const logs: string[] = [];
  let warned = false;

  // Analizar inmunidades del equipo
  const hasGhost = members.some((m) => m.moves.includes("Astral Barrage") || m.teraType === "Ghost" || m.species === "Gholdengo");
  const hasElectricResist = members.some((m) => m.teraType === "Dragon" || m.teraType === "Ground" || m.teraType === "Grass");
  const hasFakeOutCounter = members.some((m) => m.ability === "Inner Focus" || m.moves.includes("Protect"));

  topThreats.forEach((threat) => {
    if (threat.name === "Calyrex-Shadow" && !hasGhost) {
      logs.push(`⚠️ Alerta de Red Teaming: Tu equipo carece de respuestas prioritarias o inmunidades para lidiar con la velocidad de Calyrex-Shadow.`);
      warned = true;
    }
    if (threat.name === "Miraidon" && !hasElectricResist) {
      logs.push(`⚠️ Alerta de Red Teaming: Careces de resistencias sólidas o Teratipos adecuados para el daño eléctrico masivo de Miraidon.`);
      warned = true;
    }
  });

  if (!hasFakeOutCounter) {
    logs.push(`⚠️ Sugerencia de Red Teaming: Agregar 'Protect' o habilidades como 'Inner Focus' mejorará notablemente tu match contra el 'Fake Out' de Incineroar y Rillaboom.`);
  }

  return {
    status: warned ? "WARNING" : "PASS",
    logs,
  };
}

/**
 * Flujo Agéntico Modular Avanzado de 3 Pasos
 */
export async function generateTeamAgentic(
  userPrompt: string,
  options?: TeamGenerationOptions
): Promise<{ team: AITeam; audit: { status: string; logs: string[] } }> {
  const format = options?.format || "regulation-g";
  
  // Paso 1: Recuperar el contexto RAG Híbrido enfocado en sinergias y Cores
  const hybridContext = await getRelevantHybridContext(userPrompt, format, 6);

  // Paso 2: Ejecutar rotación de modelos para el Paso 1: Selección de Core
  let coreData: any = null;
  let modelError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              pokemon_a: { type: SchemaType.STRING, description: "Especie principal del Core" },
              pokemon_b: { type: SchemaType.STRING, description: "Segunda especie sinérgica del Core" },
              reason: { type: SchemaType.STRING, description: "Razón competitiva del Core" }
            },
            required: ["pokemon_a", "pokemon_b", "reason"]
          }
        }
      });

      const systemInstruction = `Eres un estratega de VGC/Smogon campeón mundial. 
A partir del siguiente contexto semántico y de estadísticas de uso mutuo de Smogon Chaos,
propón el Core central óptimo de 2 Pokémon para cumplir con la petición del usuario: "${userPrompt}". 
Respeta rigurosamente el formato: "${format}".`;

      const response = await model.generateContent([
        systemInstruction,
        `Contexto híbrido de sinergias:\n${hybridContext}`
      ]);

      const jsonText = response.response.text();
      coreData = JSON.parse(jsonText);
      break; // Éxito
    } catch (e) {
      console.warn(`Fallo al generar Core con modelo ${modelName}, rotando al siguiente. Error:`, e);
      modelError = e;
    }
  }

  if (!coreData) {
    throw new Error(`El flujo agéntico falló en la fase de Core debido a: ${modelError?.toString()}`);
  }

  // Paso 3: Análisis de vulnerabilidades elemental del Core (Heurística Estática)
  // Mapeo básico de tipos para especies conocidas de soporte heurístico
  const getTypesForSpecies = (species: string): string[] => {
    const database: Record<string, string[]> = {
      Pelipper: ["Water", "Flying"],
      Archaludon: ["Steel", "Dragon"],
      Incineroar: ["Fire", "Dark"],
      Amoonguss: ["Grass", "Poison"],
      "Flutter Mane": ["Ghost", "Fairy"],
      Urshifu: ["Dark", "Fighting"],
      "Urshifu-Rapid-Strike": ["Water", "Fighting"],
      Calyrex: ["Psychic", "Grass"],
      "Calyrex-Shadow": ["Psychic", "Ghost"],
      "Calyrex-Ice": ["Psychic", "Ice"],
      Koraidon: ["Fighting", "Dragon"],
      Miraidon: ["Electric", "Dragon"],
      Rillaboom: ["Grass"],
      Tornadus: ["Flying"],
      Gholdengo: ["Steel", "Ghost"],
      "Chien-Pao": ["Dark", "Ice"],
      "Ninetales-Alola": ["Ice", "Fairy"],
    };
    return database[species] || ["Normal"]; // Fallback si no está mapeado
  };

  const coreSpecs = [
    { species: coreData.pokemon_a, types: getTypesForSpecies(coreData.pokemon_a) },
    { species: coreData.pokemon_b, types: getTypesForSpecies(coreData.pokemon_b) },
  ];

  const vulnerabilities = analyzeCoreWeaknesses(coreSpecs);
  const weaknessStr = vulnerabilities.length > 0 
    ? `Vulnerabilidades acumuladas a cubrir obligatoriamente: [${vulnerabilities.join(", ")}].`
    : "Sin debilidades elementales críticas en el Core base.";

  // Paso 4: Generación del equipo completo (Slots 3 a 6 de Cobertura) incorporando el Red Teaming
  let finalTeam: AITeam | null = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: teamResponseSchema as any
        }
      });

      const systemInstruction = `Eres un orquestador competitivo de Pokémon. 
Debes completar un equipo competitivo de 6 Pokémon para el formato "${format}" respetando todas sus bans.
El equipo DEBE contener a los miembros del Core propuesto en los primeros slots:
1. ${coreData.pokemon_a}
2. ${coreData.pokemon_b}

Estrategia del Core: ${coreData.reason}
${weaknessStr}

Los slots del 3 al 6 deben seleccionarse para balancear el equipo (aportar control de velocidad con Tailwind o Icy Wind, pivot como Incineroar con Parting Shot o U-Turn, y coberturas contra las debilidades del Core).
La respuesta debe apegarse estrictamente al esquema JSON de salida y no contener emojis.`;

      const response = await model.generateContent([
        systemInstruction,
        `Contexto de sinergias del metagame:\n${hybridContext}`
      ]);

      const jsonText = response.response.text();
      finalTeam = JSON.parse(jsonText) as AITeam;
      break;
    } catch (e) {
      console.warn(`Fallo al completar equipo con modelo ${modelName}, rotando al siguiente. Error:`, e);
      modelError = e;
    }
  }

  if (!finalTeam) {
    throw new Error(`El flujo agéntico falló en la fase de Cobertura debido a: ${modelError?.toString()}`);
  }

  // Paso 5: Red Teaming Audit
  const audit = runRedTeamingAudit(finalTeam.members);

  return {
    team: finalTeam,
    audit,
  };
}
