import { PokemonBuild } from "@/lib/schemas/team";

export function exportTeamToShowdown(members: PokemonBuild[]): string {
  return members.map((p) => {
    let output = `${p.species}`;
    if (p.item && p.item.toLowerCase() !== "none" && p.item.toLowerCase() !== "no item") {
      output += ` @ ${p.item}`;
    }
    output += "\n";

    if (p.ability) {
      output += `Ability: ${p.ability}\n`;
    }
    
    if (p.level && p.level !== 100) {
      output += `Level: ${p.level}\n`;
    }

    if (p.teraType) {
      output += `Tera Type: ${p.teraType}\n`;
    }

    // EVs
    const evParts: string[] = [];
    if (p.evs.HP) evParts.push(`${p.evs.HP} HP`);
    if (p.evs.Atk) evParts.push(`${p.evs.Atk} Atk`);
    if (p.evs.Def) evParts.push(`${p.evs.Def} Def`);
    if (p.evs.SpA) evParts.push(`${p.evs.SpA} SpA`);
    if (p.evs.SpD) evParts.push(`${p.evs.SpD} SpD`);
    if (p.evs.Spe) evParts.push(`${p.evs.Spe} Spe`);
    if (evParts.length > 0) {
      output += `EVs: ${evParts.join(" / ")}\n`;
    }

    if (p.nature) {
      output += `${p.nature} Nature\n`;
    }

    // IVs
    const ivParts: string[] = [];
    if (p.ivs.HP !== undefined && p.ivs.HP !== 31) ivParts.push(`${p.ivs.HP} HP`);
    if (p.ivs.Atk !== undefined && p.ivs.Atk !== 31) ivParts.push(`${p.ivs.Atk} Atk`);
    if (p.ivs.Def !== undefined && p.ivs.Def !== 31) ivParts.push(`${p.ivs.Def} Def`);
    if (p.ivs.SpA !== undefined && p.ivs.SpA !== 31) ivParts.push(`${p.ivs.SpA} SpA`);
    if (p.ivs.SpD !== undefined && p.ivs.SpD !== 31) ivParts.push(`${p.ivs.SpD} SpD`);
    if (p.ivs.Spe !== undefined && p.ivs.Spe !== 31) ivParts.push(`${p.ivs.Spe} Spe`);
    if (ivParts.length > 0) {
      output += `IVs: ${ivParts.join(" / ")}\n`;
    }

    // Moves
    p.moves.forEach((move) => {
      if (move && move.trim() !== "") {
        output += `- ${move}\n`;
      }
    });

    return output;
  }).join("\n");
}

export function importTeamFromShowdown(text: string): PokemonBuild[] {
  const members: PokemonBuild[] = [];
  const rawBlocks = text.split(/\n\s*\n/);

  for (const block of rawBlocks) {
    if (!block.trim()) continue;

    const lines = block.split("\n").map(l => l.trim()).filter(l => l !== "");
    if (lines.length === 0) continue;

    // Primer línea: Especie [@ Objeto]
    const headerLine = lines[0];
    let species = "";
    let item = "None";

    if (headerLine.includes("@")) {
      const parts = headerLine.split("@");
      species = parts[0].trim();
      item = parts[1].trim();
    } else {
      species = headerLine.trim();
    }

    // Limpiar especie de apodos (ej: "Amoonguss (M)" o "Amoonguss (F)" o "Nick (Amoonguss)")
    // Showdown format: Nickname (Species) @ Item
    if (species.includes("(") && species.includes(")")) {
      const match = species.match(/\(([^)]+)\)/);
      if (match) {
        const inside = match[1].trim();
        if (inside === "M" || inside === "F") {
          species = species.replace(/\([^)]+\)/, "").trim();
        } else {
          species = inside;
        }
      }
    }

    let ability = "None";
    let nature = "Serious";
    let teraType = "Normal";
    let level: number | undefined = undefined;
    const evs: Record<string, number> = { HP: 0, Atk: 0, Def: 0, SpA: 0, SpD: 0, Spe: 0 };
    const ivs: Record<string, number> = { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 };
    const moves: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("Ability:")) {
        ability = line.replace("Ability:", "").trim();
      } else if (line.startsWith("Level:")) {
        const parsedLevel = parseInt(line.replace("Level:", "").trim());
        if (!isNaN(parsedLevel)) {
          level = parsedLevel;
        }
      } else if (line.startsWith("Tera Type:")) {
        teraType = line.replace("Tera Type:", "").trim();
      } else if (line.endsWith("Nature")) {
        nature = line.replace("Nature", "").trim();
      } else if (line.startsWith("EVs:")) {
        const evLine = line.replace("EVs:", "").trim();
        const parts = evLine.split("/");
        parts.forEach((p) => {
          const match = p.trim().match(/(\d+)\s+([a-zA-Z]+)/);
          if (match) {
            const val = parseInt(match[1]);
            const stat = match[2].trim();
            if (stat.toLowerCase() === "hp") evs.HP = val;
            else if (stat.toLowerCase() === "atk") evs.Atk = val;
            else if (stat.toLowerCase() === "def") evs.Def = val;
            else if (stat.toLowerCase() === "spa") evs.SpA = val;
            else if (stat.toLowerCase() === "spd") evs.SpD = val;
            else if (stat.toLowerCase() === "spe") evs.Spe = val;
          }
        });
      } else if (line.startsWith("IVs:")) {
        const ivLine = line.replace("IVs:", "").trim();
        const parts = ivLine.split("/");
        parts.forEach((p) => {
          const match = p.trim().match(/(\d+)\s+([a-zA-Z]+)/);
          if (match) {
            const val = parseInt(match[1]);
            const stat = match[2].trim();
            if (stat.toLowerCase() === "hp") ivs.HP = val;
            else if (stat.toLowerCase() === "atk") ivs.Atk = val;
            else if (stat.toLowerCase() === "def") ivs.Def = val;
            else if (stat.toLowerCase() === "spa") ivs.SpA = val;
            else if (stat.toLowerCase() === "spd") ivs.SpD = val;
            else if (stat.toLowerCase() === "spe") ivs.Spe = val;
          }
        });
      } else if (line.startsWith("-")) {
        const moveName = line.replace("-", "").trim();
        if (moves.length < 4) {
          moves.push(moveName);
        }
      }
    }

    // Asegurar 4 movimientos
    while (moves.length < 4) {
      moves.push("");
    }

    members.push({
      species,
      item,
      ability,
      nature,
      evs,
      ivs,
      moves,
      teraType,
      role: "Atacante / Soporte", // Rol por defecto al importar
      level,
    });

    if (members.length >= 6) break;
  }

  return members;
}
