import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Team } from "../schemas/team";

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
          role: { type: SchemaType.STRING, description: "Breve explicación de su rol en el equipo" }
        },
        required: ["species", "item", "ability", "nature", "evs", "moves", "teraType", "role"]
      }
    }
  },
  required: ["teamName", "format", "strategy", "members"]
};

export async function generateTeamWithGemini(userPrompt: string, ragContext: string): Promise<Team> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: teamResponseSchema,
      temperature: 0.2, // Baja temperatura para priorizar precisión mecánica sobre creatividad extrema
    },
  });

  const prompt = `
Eres Hexacore, un Coach Experto en Pokémon Competitivo (VGC y Smogon).
Tu tarea es construir un equipo altamente sinérgico, legal y competitivo basado en la solicitud del usuario y el conocimiento proporcionado.

### CONOCIMIENTO DE LA BÓVEDA (RAG):
A continuación se presentan estrategias verificadas de Smogon, mecánicas de juego y estadísticas de Showdown que DEBES consultar y respetar para la legalidad:
${ragContext}

### PETICIÓN DEL USUARIO:
"${userPrompt}"

### REGLAS ESTRICTAS:
1. DEBES devolver estrictamente un objeto JSON que siga el esquema requerido.
2. NUNCA inventes movimientos (moves) o habilidades que el Pokémon no pueda aprender legalmente en el juego. Usa el contexto RAG para verificar legalidad.
3. Asegúrate de que los EVs sumen un máximo de 508.
4. Escoge naturalezas que tengan sentido competitivo (ej. No pongas Jolly a un atacante especial).
5. No devuelvas ningún texto fuera del JSON. El sistema intentará hacer JSON.parse() de tu respuesta directamente.
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    const teamData = JSON.parse(responseText) as Team;
    return teamData;
  } catch (error) {
    console.error("Gemini devolvió un JSON inválido:", responseText);
    throw new Error("Falló el parseo del JSON generado por Gemini.");
  }
}
