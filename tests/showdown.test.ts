import { describe, it, expect } from "vitest";
import { importTeamFromShowdown, exportTeamToShowdown } from "@/lib/pokemon/showdown";
import { PokemonBuild } from "@/lib/schemas/team";

describe("Showdown Team Parser & Formatter", () => {
  const sampleShowdownText = `
Tatsugiri @ Choice Scarf  
Ability: Commander  
Level: 50  
Tera Type: Stellar  
EVs: 4 HP / 252 SpA / 252 Spe  
Timid Nature  
IVs: 0 Atk  
- Draco Meteor  
- Muddy Water  
- Icy Wind  
- Protect  

Gholdengo @ Leftovers  
Ability: Good as Gold  
Tera Type: Dragon  
EVs: 252 HP / 196 Def / 60 SpD  
Bold Nature  
- Make It Rain  
- Nasty Plot  
- Recover  
- Shadow Ball  
`;

  describe("importTeamFromShowdown", () => {
    it("should import a team with all properties correctly parsed", () => {
      const team = importTeamFromShowdown(sampleShowdownText);
      expect(team).toHaveLength(2);

      // Check Tatsugiri
      const tatsugiri = team[0];
      expect(tatsugiri.species).toBe("Tatsugiri");
      expect(tatsugiri.item).toBe("Choice Scarf");
      expect(tatsugiri.ability).toBe("Commander");
      expect(tatsugiri.level).toBe(50);
      expect(tatsugiri.teraType).toBe("Stellar");
      expect(tatsugiri.nature).toBe("Timid");
      expect(tatsugiri.evs).toEqual({ HP: 4, Atk: 0, Def: 0, SpA: 252, SpD: 0, Spe: 252 });
      expect(tatsugiri.ivs).toEqual({ HP: 31, Atk: 0, Def: 31, SpA: 31, SpD: 31, Spe: 31 });
      expect(tatsugiri.moves).toEqual(["Draco Meteor", "Muddy Water", "Icy Wind", "Protect"]);

      // Check Gholdengo
      const gholdengo = team[1];
      expect(gholdengo.species).toBe("Gholdengo");
      expect(gholdengo.item).toBe("Leftovers");
      expect(gholdengo.ability).toBe("Good as Gold");
      expect(gholdengo.level).toBeUndefined(); // defaults to undefined / 100 in exporter
      expect(gholdengo.teraType).toBe("Dragon");
      expect(gholdengo.nature).toBe("Bold");
      expect(gholdengo.evs).toEqual({ HP: 252, Atk: 0, Def: 196, SpA: 0, SpD: 60, Spe: 0 });
      expect(gholdengo.ivs).toEqual({ HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 });
    });

    it("should correctly handle nickname brackets", () => {
      const nickText = `Garganacl (M) @ Leftovers  
Ability: Purifying Salt  
- Salt Cure`;
      const team = importTeamFromShowdown(nickText);
      expect(team).toHaveLength(1);
      expect(team[0].species).toBe("Garganacl"); // bracket gender (M) or nickname extracted
    });

    it("should fill missing moves with empty strings", () => {
      const shortMovesText = `Torkoal @ Charcoal  
Ability: Drought  
- Eruption`;
      const team = importTeamFromShowdown(shortMovesText);
      expect(team).toHaveLength(1);
      expect(team[0].moves).toEqual(["Eruption", "", "", ""]);
    });
  });

  describe("exportTeamToShowdown", () => {
    it("should export team back to valid Showdown format", () => {
      const mockTeam: PokemonBuild[] = [
        {
          species: "Amoonguss",
          item: "Rocky Helmet",
          ability: "Regenerator",
          nature: "Relaxed",
          level: 50,
          teraType: "Water",
          evs: { HP: 252, Atk: 0, Def: 156, SpA: 0, SpD: 100, Spe: 0 },
          ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 0 },
          moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"],
          role: "Soporte"
        }
      ];

      const exported = exportTeamToShowdown(mockTeam);
      expect(exported).toContain("Amoonguss @ Rocky Helmet");
      expect(exported).toContain("Ability: Regenerator");
      expect(exported).toContain("Level: 50");
      expect(exported).toContain("Tera Type: Water");
      expect(exported).toContain("EVs: 252 HP / 156 Def / 100 SpD");
      expect(exported).toContain("Relaxed Nature");
      expect(exported).toContain("IVs: 0 Spe"); // only non-31 IVs exported
      expect(exported).toContain("- Spore");
      expect(exported).toContain("- Rage Powder");
    });

    it("should omit @ None if item is None", () => {
      const mockTeam: PokemonBuild[] = [
        {
          species: "Ogerpon",
          item: "None",
          ability: "Defiant",
          nature: "Jolly",
          evs: { HP: 0, Atk: 252, Def: 4, SpA: 0, SpD: 0, Spe: 252 },
          ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
          moves: ["Ivy Cudgel", "Horn Leech", "Spiky Shield", "U-turn"],
          role: "Physical Attacker"
        }
      ];

      const exported = exportTeamToShowdown(mockTeam);
      expect(exported).toContain("Ogerpon\nAbility: Defiant");
      expect(exported).not.toContain("@ None");
    });
  });
});
