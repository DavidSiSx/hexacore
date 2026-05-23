import { describe, it, expect } from "vitest";
import { validateTeam, getSpeciesData, getSpeciesBaseStats } from "@/lib/pokemon/validator";
import { PokemonBuild } from "@/lib/schemas/team";

describe("Competitive Pokemon Team Validator", () => {
  describe("getSpeciesData", () => {
    it("should resolve correct types and evolution stages for competitive Pokemon", () => {
      const gholdengo = getSpeciesData("Gholdengo");
      expect(gholdengo.types).toContain("Steel");
      expect(gholdengo.types).toContain("Ghost");
      expect(gholdengo.isEvolved).toBe(true);

      const charmander = getSpeciesData("Charmander");
      expect(charmander.types).toContain("Fire");
      expect(charmander.isEvolved).toBe(false);
    });

    it("should fallback intelligently for unknown species", () => {
      const waterAqua = getSpeciesData("Aqua-Sea-Creature");
      expect(waterAqua.types).toContain("Water");
    });
  });

  describe("getSpeciesBaseStats", () => {
    it("should resolve correct base stats for species in database", () => {
      const stats = getSpeciesBaseStats("Arcanine");
      expect(stats).toEqual({ HP: 90, Atk: 110, Def: 80, SpA: 100, SpD: 80, Spe: 95 });
    });
  });

  describe("validateTeam", () => {
    const validRegHTeam: PokemonBuild[] = [
      {
        species: "Amoonguss",
        item: "Rocky Helmet",
        ability: "Regenerator",
        nature: "Bold",
        level: 50,
        teraType: "Water",
        evs: { HP: 252, Atk: 0, Def: 156, SpA: 0, SpD: 100, Spe: 0 },
        ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
        moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"],
        role: "Support"
      },
      {
        species: "Gholdengo",
        item: "Choice Specs",
        ability: "Good as Gold",
        nature: "Modest",
        level: 50,
        teraType: "Steel",
        evs: { HP: 252, Atk: 0, Def: 4, SpA: 252, SpD: 0, Spe: 0 },
        ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
        moves: ["Make It Rain", "Shadow Ball", "Power Gem", "Trick"],
        role: "Special Attacker"
      },
      {
        species: "Whimsicott",
        item: "Focus Sash",
        ability: "Prankster",
        nature: "Timid",
        level: 50,
        teraType: "Ghost",
        evs: { HP: 4, Atk: 0, Def: 0, SpA: 252, SpD: 0, Spe: 252 },
        ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
        moves: ["Tailwind", "Moonblast", "Taunt", "Protect"],
        role: "Speed Control"
      }
    ];

    it("should flag empty teams as invalid", () => {
      const report = validateTeam([]);
      expect(report.valid).toBe(false);
      expect(report.errors).toContain("El equipo está vacío.");
    });

    it("should pass valid team on Regulation H", () => {
      const report = validateTeam(validRegHTeam, "regulation-h");
      expect(report.errors).toHaveLength(0);
    });

    it("should detect duplicate species (Species Clause violations)", () => {
      const duplicateTeam = [
        ...validRegHTeam,
        {
          ...validRegHTeam[0],
          item: "Leftovers" // change item to prevent item clause violation
        }
      ];

      const report = validateTeam(duplicateTeam, "regulation-h");
      expect(report.errors.some(e => e.includes("Species Clause"))).toBe(true);
    });

    it("should flag restricted legendaries in Regulation H", () => {
      const illegalTeam = [
        ...validRegHTeam,
        {
          species: "Miraidon",
          item: "Choice Specs",
          ability: "Hadron Engine",
          nature: "Timid",
          level: 50,
          teraType: "Electric",
          evs: { HP: 0, Atk: 0, Def: 0, SpA: 252, SpD: 4, Spe: 252 },
          ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
          moves: ["Electro Drift", "Draco Meteor", "Volt Switch", "Overheat"],
          role: "Restricted Legendary"
        }
      ];

      const report = validateTeam(illegalTeam, "regulation-h");
      expect(report.errors.some(e => e.includes("Miraidon") && e.includes("banned") || e.includes("prohibido"))).toBe(true);
    });

    it("should flag paradox Pokemon in Regulation H", () => {
      const illegalTeam = [
        ...validRegHTeam,
        {
          species: "Flutter Mane",
          item: "Booster Energy",
          ability: "Protosynthesis",
          nature: "Timid",
          level: 50,
          teraType: "Fairy",
          evs: { HP: 0, Atk: 0, Def: 0, SpA: 252, SpD: 4, Spe: 252 },
          ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
          moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Protect"],
          role: "Paradox"
        }
      ];

      const report = validateTeam(illegalTeam, "regulation-h");
      expect(report.errors.some(e => e.toLowerCase().includes("flutter-mane") || e.toLowerCase().includes("flutter mane"))).toBe(true);
    });

    it("should apply custom rules and bans correctly", () => {
      const customRules = {
        speciesClause: true,
        itemClause: true,
        allowMega: false,
        allowZMove: false,
        allowTera: false,
        minLevel: 50,
        maxLevel: 50,
        bans: {
          pokemon: ["Gholdengo"],
          items: ["Rocky Helmet"],
          moves: ["Spore"],
          abilities: ["Regenerator"]
        }
      };

      const report = validateTeam(validRegHTeam, "custom-format-1", customRules);
      expect(report.errors.some(e => e.includes("Gholdengo"))).toBe(true);
      expect(report.errors.some(e => e.includes("Rocky Helmet"))).toBe(true);
      expect(report.errors.some(e => e.toLowerCase().includes("spore"))).toBe(true);
      expect(report.errors.some(e => e.includes("Regenerator"))).toBe(true);
    });
  });
});
