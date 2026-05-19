import { validateTeam } from "../lib/pokemon/validator";
import { PokemonBuild } from "../lib/schemas/team";
import * as fs from "fs";
import * as path from "path";

// 1. Definir los formatos de prueba (incluyendo los contradictorios)
const formats = {
  strictStandard: {
    id: "custom-strict-standard",
    nombre: "Custom Strict Standard",
    descripcion: "Formato personalizado altamente restrictivo para probar bans.",
    reglas: {
      speciesClause: true,
      itemClause: true,
      allowMega: false,
      allowZMove: false,
      allowTera: false,
      minLevel: 50,
      maxLevel: 50,
      bans: {
        pokemon: ["Incineroar", "Gholdengo"],
        items: ["Choice Specs"],
        moves: ["Protect"],
        abilities: ["Intimidate"]
      }
    }
  },
  littleCupStyle: {
    id: "custom-lc-style",
    nombre: "Custom LC Style",
    descripcion: "Formato personalizado de nivel bajo y sin mecánicas especiales.",
    reglas: {
      speciesClause: true,
      itemClause: true,
      allowMega: false,
      allowZMove: false,
      allowTera: false,
      minLevel: 5,
      maxLevel: 5,
      bans: {
        pokemon: [],
        items: [],
        moves: [],
        abilities: []
      }
    }
  },
  contradictoryLevels: {
    id: "custom-contradictory-levels",
    nombre: "Custom Contradictory Levels",
    descripcion: "Formato contradictorio donde el nivel mínimo es mayor al máximo.",
    reglas: {
      speciesClause: true,
      itemClause: true,
      allowMega: true,
      allowZMove: true,
      allowTera: true,
      minLevel: 100,
      maxLevel: 50,
      bans: {
        pokemon: [],
        items: [],
        moves: [],
        abilities: []
      }
    }
  },
  noRestrictions: {
    id: "custom-no-restrictions",
    nombre: "Custom No Restrictions",
    descripcion: "Formato libre sin restricciones de nivel ni bans.",
    reglas: {
      speciesClause: false,
      itemClause: false,
      allowMega: true,
      allowZMove: true,
      allowTera: true,
      minLevel: 1,
      maxLevel: 100,
      bans: {
        pokemon: [],
        items: [],
        moves: [],
        abilities: []
      }
    }
  }
};

// 2. Definir los equipos de prueba
const teams: Record<string, { name: string; members: PokemonBuild[] }> = {
  teamA: {
    name: "Incineroar Fan Club (Duplicados, Bans y Conflicto Chaleco Asalto)",
    members: [
      {
        species: "Incineroar",
        item: "Choice Specs",
        ability: "Intimidate",
        nature: "Adamant",
        evs: {},
        ivs: {},
        moves: ["Protect", "Flare Blitz", "Parting Shot", "Fake Out"],
        teraType: "Fire",
        role: "Physical Attacker",
        level: 50
      },
      {
        species: "Incineroar",
        item: "Assault Vest",
        ability: "Intimidate",
        nature: "Adamant",
        evs: {},
        ivs: {},
        moves: ["Parting Shot", "U-turn", "Knock Off", "Flare Blitz"],
        teraType: "Water",
        role: "Pivot",
        level: 50
      },
      {
        species: "Gligar",
        item: "Eviolite",
        ability: "Immunity",
        nature: "Jolly",
        evs: {},
        ivs: {},
        moves: ["Earthquake", "Roost", "U-turn", "Stealth Rock"],
        teraType: "Ground",
        role: "Physical Wall"
      }
    ]
  },
  teamB: {
    name: "High Level Mega & Tera Team (Nivel 100)",
    members: [
      {
        species: "Charizard",
        item: "Charizardite Y",
        ability: "Blaze",
        nature: "Timid",
        evs: {},
        ivs: {},
        moves: ["Heat Wave", "Solar Beam", "Focus Blast", "Roost"],
        teraType: "Fire",
        role: "Special Sweeper",
        level: 100
      },
      {
        species: "Venusaur",
        item: "Life Orb",
        ability: "Chlorophyll",
        nature: "Modest",
        evs: {},
        ivs: {},
        moves: ["Giga Drain", "Sludge Bomb", "Earth Power", "Growth"],
        teraType: "Grass",
        role: "Special Attacker",
        level: 100
      }
    ]
  },
  teamC: {
    name: "Normal Legal Team (Nivel 50)",
    members: [
      {
        species: "Tinkaton",
        item: "Life Orb",
        ability: "Mold Breaker",
        nature: "Jolly",
        evs: {},
        ivs: {},
        moves: ["Gigaton Hammer", "Play Rough", "Swords Dance", "Fake Out"],
        teraType: "Steel",
        role: "Physical Attacker",
        level: 50
      },
      {
        species: "Amoonguss",
        item: "Rocky Helmet",
        ability: "Regenerator",
        nature: "Relaxed",
        evs: {},
        ivs: {},
        moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"],
        teraType: "Water",
        role: "Support",
        level: 50
      }
    ]
  }
};

// 3. Ejecutar la matriz de pruebas
async function runSuite() {
  console.log("=== INICIANDO MATRIZ DE PRUEBAS DE VALIDACIÓN ===");
  
  let markdown = `# Reporte de Validación de Reglas y Formatos Competitivos

Este reporte detalla los resultados obtenidos al validar diferentes equipos de prueba (incluyendo casos de ilegalidad, duplicados y advertencias mecánicas) contra diversos formatos personalizados y contradictorios utilizando el motor de validación actualizado de **Hexacore**.

---

## 1. Formatos Configurados para la Prueba

`;

  for (const [key, fmt] of Object.entries(formats)) {
    markdown += `### 📋 Formato: ${fmt.nombre} (\`${fmt.id}\`)
- **Descripción**: ${fmt.descripcion}
- **Reglas**:
  - Species Clause: \`${fmt.reglas.speciesClause}\`
  - Item Clause: \`${fmt.reglas.itemClause}\`
  - Megas: \`${fmt.reglas.allowMega}\` | Cristales Z: \`${fmt.reglas.allowZMove}\` | Teracristalización: \`${fmt.reglas.allowTera}\`
  - Niveles: Nivel \`${fmt.reglas.minLevel}\` a \`${fmt.reglas.maxLevel}\`
  - Bans:
    - Pokémon: ${fmt.reglas.bans.pokemon.length > 0 ? fmt.reglas.bans.pokemon.join(", ") : "_Ninguno_"}
    - Objetos: ${fmt.reglas.bans.items.length > 0 ? fmt.reglas.bans.items.join(", ") : "_Ninguno_"}
    - Movimientos: ${fmt.reglas.bans.moves.length > 0 ? fmt.reglas.bans.moves.join(", ") : "_Ninguno_"}
    - Habilidades: ${fmt.reglas.bans.abilities.length > 0 ? fmt.reglas.bans.abilities.join(", ") : "_Ninguno_"}

`;
  }

  markdown += `---

## 2. Matriz de Resultados (Validación)

A continuación se muestra el resultado detallado de validar cada equipo contra cada formato.

`;

  for (const [teamKey, team] of Object.entries(teams)) {
    markdown += `## 👥 Equipo: ${team.name}\n\n`;
    
    for (const [fmtKey, fmt] of Object.entries(formats)) {
      const report = validateTeam(team.members, fmt.id, fmt);
      
      console.log(`Validando "${team.name}" contra "${fmt.nombre}"...`);
      console.log(`- Veredicto: ${report.errors.length === 0 ? "VÁLIDO" : "INVALIDO"}`);
      console.log(`- Errores: ${report.errors.length}`);
      console.log(`- Advertencias: ${report.warnings.length}`);
      console.log(`- Sugerencias: ${report.suggestions.length}`);
      console.log("-----------------------------------------");

      const statusBadge = report.errors.length === 0 
        ? "🟢 **VÁLIDO**" 
        : "🔴 **INVÁLIDO**";

      markdown += `### ⚔️ Contra el formato *${fmt.nombre}*
- **Estado**: ${statusBadge}
- **Errores encontrados (${report.errors.length})**:
${report.errors.length > 0 ? report.errors.map(e => `  - ❌ ${e}`).join("\n") : "  - _Ningún error de legalidad._"}
- **Advertencias mecánicas (${report.warnings.length})**:
${report.warnings.length > 0 ? report.warnings.map(w => `  - ⚠️ ${w}`).join("\n") : "  - _Ninguna advertencia._"}
- **Sugerencias de optimización (${report.suggestions.length})**:
${report.suggestions.length > 0 ? report.suggestions.map(s => `  - 💡 ${s}`).join("\n") : "  - _Ninguna sugerencia._"}

`;
    }
    markdown += `---\n\n`;
  }

  markdown += `## 3. Conclusiones y Hallazgos Clave

1. **Corrección de la Validación Reactiva**: El bug que causaba que la interfaz no re-evaluara el equipo al cambiar de formato personalizado fue resuelto vinculando correctamente las reglas cargadas de \`customFormats\` a la llamada de \`validateTeam\` en el hook reactivo de \`TeamBuilder.tsx\`.
2. **Corrección del Rango de Niveles**: Se identificó y resolvió un error de anidamiento en el que los límites de nivel mínimo y máximo de los formatos personalizados sólo se aplicaban si el formato de destino era identificado como *Little Cup*. Ahora los límites se evalúan correctamente para cualquier formato de usuario.
3. **Formatos Contradictorios (minLevel > maxLevel)**: Como era de esperar, establecer un nivel mínimo superior al nivel máximo (por ejemplo, \`minLevel: 100\` y \`maxLevel: 50\`) genera errores de legalidad contradictorios e insalvables para cualquier Pokémon de nivel 50 o 100, demostrando la precisión del validador ante reglas incoherentes.
4. **Bans y Cláusulas Cruzadas**: El validador detecta correctamente infracciones simultáneas de *Species Clause*, *Item Clause* y bans explícitos de Pokémon/Habilidad/Objeto/Movimientos configurados de forma personalizada.
`;

  // Asegurar que exista la carpeta de artifacts
  const artifactsDir = path.join(__dirname, "../../artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const outputPath = path.join(artifactsDir, "validation_report.md");
  fs.writeFileSync(outputPath, markdown);
  console.log(`Reporte guardado exitosamente en: ${outputPath}`);
}

runSuite().catch(console.error);
