import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno desde .env.local o .env antes de cualquier otro import
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { generateTeamWithGemini } from "../lib/ai/gemini";
import { validateTeam } from "../lib/pokemon/validator";

async function runTest() {
  console.log("=== INICIANDO PRUEBA DE AUTOCORRECCIÓN DE GEMINI ===");

  if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: La variable de entorno GEMINI_API_KEY no está configurada.");
    process.exit(1);
  }

  // Creamos un prompt contradictorio/retador que intente forzar ilegalidades y warnings
  const userPrompt = "Quiero un equipo competitivo de VGC Reg G. Por favor, haz que Incineroar lleve Assault Vest (Chaleco Asalto) con el movimiento Protect, y añade otro Incineroar que lleve Choice Specs con Protect.";
  
  const ragContext = `
  - Incineroar es un Pokémon muy usado en VGC. Suele llevar Intimidate, Fake Out, Flare Blitz, Knock Off y Parting Shot.
  - El formato es VGC Reg G, que obliga a Species Clause (un Pokémon de cada especie) y Item Clause.
  `;

  const options = {
    format: "gen9vgc2024regg",
    customRules: {
      speciesClause: true,
      itemClause: true,
      allowMega: false,
      allowZMove: false,
      allowTera: true,
      minLevel: 50,
      maxLevel: 50,
      bans: {
        pokemon: [],
        items: [],
        moves: [],
        abilities: []
      }
    }
  };

  try {
    console.log("Enviando solicitud de generación de equipo a Gemini...");
    const team = await generateTeamWithGemini(userPrompt, ragContext, options);
    
    console.log("\n=== EQUIPO GENERADO POR LA IA ===");
    console.log(`Nombre del equipo: ${team.teamName}`);
    console.log(`Formato: ${team.format}`);
    console.log(`Modelo utilizado: ${team.modelUsed}`);
    console.log("Miembros del equipo:");
    
    team.members.forEach((m, index) => {
      console.log(`\nSlot ${index + 1}: ${m.species}`);
      console.log(`  Objeto: ${m.item}`);
      console.log(`  Habilidad: ${m.ability}`);
      console.log(`  Nivel: ${m.level}`);
      console.log(`  Movimientos: ${m.moves.join(", ")}`);
    });

    console.log("\n=== VALIDANDO EL RESULTADO FINAL ===");
    const report = validateTeam(team.members, options.format, options.customRules);
    
    console.log(`¿Válido?: ${report.valid ? "🟢 SÍ" : "🔴 NO"}`);
    console.log(`Errores (${report.errors.length}):`);
    report.errors.forEach(e => console.log(`  - ❌ ${e}`));
    console.log(`Advertencias (${report.warnings.length}):`);
    report.warnings.forEach(w => console.log(`  - ⚠️ ${w}`));
    
    if (report.valid && report.errors.length === 0) {
      console.log("\n🎉 ¡ÉXITO! La IA logró corregir los intentos iniciales inválidos y retornó un equipo legal.");
    } else {
      console.log("\n⚠️ La IA retornó un equipo, pero contiene ilegalidades o advertencias críticas no corregidas.");
    }
  } catch (error) {
    console.error("Ocurrió un error durante la generación del equipo:", error);
  }
}

runTest();
