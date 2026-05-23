import { PokemonBuild } from "@/lib/schemas/team";
import { getTypeEffectiveness } from "../battle/engine";
import { Dex } from "@pkmn/dex";

export interface ValidationReport {
  valid: boolean;
  errors: string[];       // Nivel 1: Ilegalidades Críticas
  warnings: string[];     // Nivel 2: Anti-Sinergias Mecánicas
  suggestions: string[];  // Nivel 3: Vulnerabilidades Estructurales
  stats?: {
    weathers: string[];
    terrains: string[];
    hasSpeedControl: boolean;
    hasHazardControl: boolean;
    protectCount: number;
    immunities: string[];
    weaknesses: string[];
  };
}


// Mapeo de estadísticas base de las especies del metagame
export const SPECIES_BASE_STATS: Record<string, { HP: number; Atk: number; Def: number; SpA: number; SpD: number; Spe: number }> = {
  Arcanine: { HP: 90, Atk: 110, Def: 80, SpA: 100, SpD: 80, Spe: 95 },
  Torkoal: { HP: 70, Atk: 85, Def: 140, SpA: 85, SpD: 70, Spe: 20 },
  Heatran: { HP: 91, Atk: 90, Def: 106, SpA: 130, SpD: 106, Spe: 77 },
  Volcarona: { HP: 85, Atk: 60, Def: 65, SpA: 135, SpD: 105, Spe: 100 },
  Cinderace: { HP: 80, Atk: 116, Def: 75, SpA: 65, SpD: 75, Spe: 119 },
  Charizard: { HP: 78, Atk: 84, Def: 78, SpA: 109, SpD: 85, Spe: 100 },
  Ceruledge: { HP: 75, Atk: 125, Def: 80, SpA: 60, SpD: 100, Spe: 85 },
  Armarouge: { HP: 85, Atk: 60, Def: 100, SpA: 125, SpD: 80, Spe: 75 },
  "Chi-Yu": { HP: 55, Atk: 80, Def: 80, SpA: 135, SpD: 120, Spe: 100 },
  "Iron-Moth": { HP: 80, Atk: 70, Def: 60, SpA: 140, SpD: 110, Spe: 110 },
  "Ogerpon-Hearthflame": { HP: 80, Atk: 120, Def: 84, SpA: 60, SpD: 96, Spe: 110 },
  "Gouging-Fire": { HP: 105, Atk: 115, Def: 121, SpA: 65, SpD: 93, Spe: 91 },
  Blaziken: { HP: 80, Atk: 120, Def: 70, SpA: 110, SpD: 70, Spe: 80 },
  Pelipper: { HP: 60, Atk: 50, Def: 100, SpA: 95, SpD: 70, Spe: 65 },
  Kyogre: { HP: 100, Atk: 100, Def: 90, SpA: 150, SpD: 140, Spe: 90 },
  Gastrodon: { HP: 111, Atk: 83, Def: 68, SpA: 92, SpD: 82, Spe: 39 },
  Milotic: { HP: 95, Atk: 60, Def: 79, SpA: 100, SpD: 125, Spe: 81 },
  Primarina: { HP: 80, Atk: 74, Def: 74, SpA: 126, SpD: 116, Spe: 60 },
  Suicune: { HP: 100, Atk: 75, Def: 115, SpA: 90, SpD: 115, Spe: 85 },
  Palafin: { HP: 100, Atk: 70, Def: 72, SpA: 53, SpD: 62, Spe: 100 },
  Dondozo: { HP: 150, Atk: 100, Def: 115, SpA: 65, SpD: 65, Spe: 35 },
  Tatsugiri: { HP: 68, Atk: 50, Def: 60, SpA: 120, SpD: 95, Spe: 82 },
  "Urshifu-Rapid-Strike": { HP: 100, Atk: 130, Def: 100, SpA: 63, SpD: 60, Spe: 97 },
  "Ogerpon-Wellspring": { HP: 80, Atk: 120, Def: 84, SpA: 60, SpD: 96, Spe: 110 },
  "Walking-Wake": { HP: 99, Atk: 83, Def: 91, SpA: 125, SpD: 83, Spe: 109 },
  "Rotom-Wash": { HP: 50, Atk: 65, Def: 107, SpA: 105, SpD: 107, Spe: 86 },
  Amoonguss: { HP: 114, Atk: 85, Def: 70, SpA: 85, SpD: 80, Spe: 30 },
  Rillaboom: { HP: 100, Atk: 125, Def: 90, SpA: 60, SpD: 70, Spe: 85 },
  Venusaur: { HP: 80, Atk: 82, Def: 83, SpA: 100, SpD: 100, Spe: 80 },
  Serperior: { HP: 75, Atk: 75, Def: 95, SpA: 75, SpD: 95, Spe: 113 },
  Whimsicott: { HP: 60, Atk: 67, Def: 85, SpA: 77, SpD: 75, Spe: 116 },
  Tsareena: { HP: 72, Atk: 120, Def: 98, SpA: 50, SpD: 98, Spe: 72 },
  Meowscarada: { HP: 76, Atk: 110, Def: 70, SpA: 81, SpD: 70, Spe: 123 },
  Sinistcha: { HP: 71, Atk: 60, Def: 106, SpA: 121, SpD: 80, Spe: 70 },
  Meganium: { HP: 80, Atk: 82, Def: 100, SpA: 83, SpD: 100, Spe: 80 },
  Ogerpon: { HP: 80, Atk: 120, Def: 84, SpA: 60, SpD: 96, Spe: 110 },
  Kartana: { HP: 59, Atk: 181, Def: 131, SpA: 59, SpD: 31, Spe: 109 },
  Miraidon: { HP: 100, Atk: 85, Def: 100, SpA: 135, SpD: 115, Spe: 135 },
  Regieleki: { HP: 80, Atk: 100, Def: 50, SpA: 100, SpD: 50, Spe: 200 },
  "Raging-Bolt": { HP: 125, Atk: 73, Def: 91, SpA: 137, SpD: 89, Spe: 75 },
  "Iron-Hands": { HP: 154, Atk: 140, Def: 108, SpA: 50, SpD: 68, Spe: 50 },
  Zapdos: { HP: 90, Atk: 90, Def: 85, SpA: 125, SpD: 90, Spe: 100 },
  Thundurus: { HP: 79, Atk: 115, Def: 70, SpA: 125, SpD: 80, Spe: 111 },
  "Great-Tusk": { HP: 115, Atk: 131, Def: 131, SpA: 53, SpD: 53, Spe: 87 },
  Landorus: { HP: 89, Atk: 125, Def: 90, SpA: 115, SpD: 80, Spe: 101 },
  "Landorus-Therian": { HP: 89, Atk: 145, Def: 90, SpA: 105, SpD: 80, Spe: 91 },
  Ursaluna: { HP: 130, Atk: 140, Def: 105, SpA: 45, SpD: 80, Spe: 50 },
  "Ursaluna-Bloodmoon": { HP: 113, Atk: 70, Def: 120, SpA: 135, SpD: 65, Spe: 52 },
  Garchomp: { HP: 108, Atk: 130, Def: 95, SpA: 80, SpD: 85, Spe: 102 },
  Gliscor: { HP: 75, Atk: 95, Def: 125, SpA: 45, SpD: 75, Spe: 95 },
  "Ting-Lu": { HP: 155, Atk: 110, Def: 125, SpA: 55, SpD: 80, Spe: 45 },
  Clodsire: { HP: 130, Atk: 75, Def: 60, SpA: 45, SpD: 100, Spe: 35 },
  Excadrill: { HP: 110, Atk: 135, Def: 60, SpA: 50, SpD: 65, Spe: 88 },
  Tornadus: { HP: 79, Atk: 115, Def: 70, SpA: 125, SpD: 80, Spe: 111 },
  Dragonite: { HP: 91, Atk: 134, Def: 95, SpA: 100, SpD: 100, Spe: 80 },
  Corviknight: { HP: 98, Atk: 87, Def: 105, SpA: 53, SpD: 85, Spe: 67 },
  Salamence: { HP: 95, Atk: 135, Def: 80, SpA: 110, SpD: 80, Spe: 100 },
  Gyarados: { HP: 95, Atk: 125, Def: 79, SpA: 60, SpD: 100, Spe: 81 },
  Gholdengo: { HP: 87, Atk: 60, Def: 95, SpA: 133, SpD: 91, Spe: 84 },
  "Flutter-Mane": { HP: 55, Atk: 55, Def: 55, SpA: 135, SpD: 135, Spe: 135 },
  "Calyrex-Shadow": { HP: 100, Atk: 85, Def: 80, SpA: 165, SpD: 100, Spe: 150 },
  Dragapult: { HP: 88, Atk: 120, Def: 75, SpA: 100, SpD: 75, Spe: 142 },
  Annihilape: { HP: 110, Atk: 115, Def: 80, SpA: 50, SpD: 90, Spe: 90 },
  Basculegion: { HP: 120, Atk: 112, Def: 65, SpA: 80, SpD: 75, Spe: 78 },
  Gengar: { HP: 60, Atk: 65, Def: 60, SpA: 130, SpD: 75, Spe: 110 },
  Skeledirge: { HP: 104, Atk: 75, Def: 100, SpA: 110, SpD: 75, Spe: 66 },
  Mimikyu: { HP: 55, Atk: 90, Def: 80, SpA: 50, SpD: 105, Spe: 96 },
  Archaludon: { HP: 90, Atk: 105, Def: 130, SpA: 125, SpD: 65, Spe: 85 },
  Kingambit: { HP: 100, Atk: 135, Def: 120, SpA: 60, SpD: 85, Spe: 50 },
  Scizor: { HP: 70, Atk: 130, Def: 100, SpA: 55, SpD: 80, Spe: 65 },
  "Iron-Crown": { HP: 90, Atk: 72, Def: 100, SpA: 122, SpD: 108, Spe: 98 },
  Aegislash: { HP: 60, Atk: 50, Def: 140, SpA: 50, SpD: 140, Spe: 60 },
  Sylveon: { HP: 95, Atk: 65, Def: 65, SpA: 110, SpD: 130, Spe: 60 },
  Clefairy: { HP: 70, Atk: 45, Def: 48, SpA: 60, SpD: 65, Spe: 35 },
  Clefable: { HP: 95, Atk: 70, Def: 73, SpA: 95, SpD: 90, Spe: 60 },
  Gardevoir: { HP: 68, Atk: 65, Def: 65, SpA: 125, SpD: 115, Spe: 80 },
  Fezandipiti: { HP: 88, Atk: 91, Def: 82, SpA: 70, SpD: 125, Spe: 99 },
  Hatterene: { HP: 57, Atk: 90, Def: 95, SpA: 136, SpD: 103, Spe: 29 },
  "Chien-Pao": { HP: 80, Atk: 120, Def: 80, SpA: 90, SpD: 65, Spe: 135 },
  Baxcalibur: { HP: 115, Atk: 145, Def: 92, SpA: 75, SpD: 86, Spe: 87 },
  "Calyrex-Ice": { HP: 100, Atk: 165, Def: 150, SpA: 85, SpD: 130, Spe: 50 },
  "Iron-Bundle": { HP: 56, Atk: 80, Def: 114, SpA: 124, SpD: 60, Spe: 136 },
  Kyurem: { HP: 125, Atk: 130, Def: 90, SpA: 130, SpD: 90, Spe: 95 },
  Cetitan: { HP: 170, Atk: 113, Def: 65, SpA: 45, SpD: 55, Spe: 73 },
  Koraidon: { HP: 100, Atk: 135, Def: 115, SpA: 85, SpD: 115, Spe: 135 },
  Sneasler: { HP: 80, Atk: 130, Def: 60, SpA: 40, SpD: 80, Spe: 120 },
  Zamazenta: { HP: 92, Atk: 120, Def: 115, SpA: 80, SpD: 115, Spe: 128 },
  Lucario: { HP: 70, Atk: 110, Def: 70, SpA: 115, SpD: 70, Spe: 90 },
  Indeedee: { HP: 60, Atk: 65, Def: 55, SpA: 105, SpD: 95, Spe: 95 },
  "Indeedee-F": { HP: 70, Atk: 55, Def: 65, SpA: 95, SpD: 105, Spe: 85 },
  Farigiraf: { HP: 120, Atk: 90, Def: 70, SpA: 110, SpD: 80, Spe: 60 },
  Glimmora: { HP: 83, Atk: 55, Def: 90, SpA: 130, SpD: 81, Spe: 86 },
  Overqwil: { HP: 85, Atk: 115, Def: 95, SpA: 65, SpD: 65, Spe: 85 },
  Toxapex: { HP: 50, Atk: 63, Def: 152, SpA: 53, SpD: 142, Spe: 35 },
  "Roaring-Moon": { HP: 105, Atk: 139, Def: 71, SpA: 55, SpD: 101, Spe: 119 },
  Tyranitar: { HP: 100, Atk: 134, Def: 110, SpA: 95, SpD: 100, Spe: 61 },
  Grimmsnarl: { HP: 95, Atk: 120, Def: 65, SpA: 95, SpD: 75, Spe: 60 },
  Darkrai: { HP: 70, Atk: 90, Def: 90, SpA: 135, SpD: 90, Spe: 125 },
  Yveltal: { HP: 126, Atk: 131, Def: 95, SpA: 131, SpD: 98, Spe: 99 },
  Maushold: { HP: 74, Atk: 75, Def: 75, SpA: 65, SpD: 75, Spe: 111 },
  Smeargle: { HP: 55, Atk: 20, Def: 35, SpA: 20, SpD: 45, Spe: 75 },
  Porygon2: { HP: 85, Atk: 80, Def: 90, SpA: 105, SpD: 95, Spe: 60 },
  Blissey: { HP: 255, Atk: 10, Def: 10, SpA: 75, SpD: 135, Spe: 55 },
  Chansey: { HP: 250, Atk: 5, Def: 5, SpA: 35, SpD: 105, Spe: 50 },
  Bulbasaur: { HP: 45, Atk: 49, Def: 49, SpA: 65, SpD: 65, Spe: 45 },
  Charmander: { HP: 39, Atk: 52, Def: 43, SpA: 60, SpD: 50, Spe: 65 },
  Squirtle: { HP: 44, Atk: 48, Def: 65, SpA: 50, SpD: 64, Spe: 43 },
  Gligar: { HP: 65, Atk: 75, Def: 105, SpA: 35, SpD: 65, Spe: 85 },
  Sneasel: { HP: 55, Atk: 95, Def: 55, SpA: 35, SpD: 75, Spe: 115 },
  Porygon: { HP: 65, Atk: 60, Def: 70, SpA: 85, SpD: 75, Spe: 40 },
  Growlithe: { HP: 55, Atk: 70, Def: 45, SpA: 70, SpD: 50, Spe: 60 },
  Vulpix: { HP: 38, Atk: 41, Def: 40, SpA: 50, SpD: 65, Spe: 65 },
  "Vulpix-Alola": { HP: 38, Atk: 41, Def: 40, SpA: 50, SpD: 65, Spe: 65 },
  Foongus: { HP: 69, Atk: 55, Def: 45, SpA: 55, SpD: 55, Spe: 15 },
  Mienfoo: { HP: 45, Atk: 85, Def: 50, SpA: 55, SpD: 50, Spe: 65 },
  Pawniard: { HP: 45, Atk: 85, Def: 70, SpA: 40, SpD: 40, Spe: 60 },
  Tinkatink: { HP: 50, Atk: 45, Def: 45, SpA: 35, SpD: 64, Spe: 58 },
  Frigibax: { HP: 65, Atk: 75, Def: 45, SpA: 35, SpD: 45, Spe: 50 },
};

// Mapeo de tipos de movimientos para STABmons
export const MOVES_TYPE_DB: Record<string, string> = {
  "light of ruin": "Fairy",
  moonblast: "Fairy",
  "play rough": "Fairy",
  "dazzling gleam": "Fairy",
  "spirit break": "Fairy",
  eruption: "Fire",
  "flare blitz": "Fire",
  "fire blast": "Fire",
  overheat: "Fire",
  "heat wave": "Fire",
  flamethrower: "Fire",
  "temper flare": "Fire",
  "water spout": "Water",
  "hydro pump": "Water",
  scald: "Water",
  "surging strikes": "Water",
  "wave crash": "Water",
  "muddy water": "Water",
  liquidation: "Water",
  "aqua jet": "Water",
  "leaf storm": "Grass",
  "wood hammer": "Grass",
  "horn leech": "Grass",
  "power whip": "Grass",
  "giga drain": "Grass",
  spore: "Grass",
  "grassy glide": "Grass",
  "bolt strike": "Electric",
  thunderbolt: "Electric",
  thunder: "Electric",
  "volt switch": "Electric",
  "wild charge": "Electric",
  "electro drift": "Electric",
  "rising voltage": "Electric",
  "parabolic charge": "Electric",
  "precipice blades": "Ground",
  earthquake: "Ground",
  "earth power": "Ground",
  "stomping tantrum": "Ground",
  "headlong rush": "Ground",
  "dragon ascent": "Flying",
  "brave bird": "Flying",
  hurricane: "Flying",
  "air slash": "Flying",
  "astral barrage": "Ghost",
  "shadow ball": "Ghost",
  "shadow claw": "Ghost",
  poltergeist: "Ghost",
  "rage fist": "Ghost",
  "draco meteor": "Dragon",
  "clanging scales": "Dragon",
  "dragon claw": "Dragon",
  outrage: "Dragon",
  "dragon pulse": "Dragon",
  "glacial lance": "Ice",
  blizzard: "Ice",
  "ice beam": "Ice",
  "icicle crash": "Ice",
  "freeze dry": "Ice",
  "triple axle": "Ice",
  "close combat": "Fighting",
  "drain punch": "Fighting",
  "sacred sword": "Fighting",
  "focus blast": "Fighting",
  "body press": "Fighting",
  "collision course": "Fighting",
  "mach punch": "Fighting",
  "make it rain": "Steel",
  "gigaton hammer": "Steel",
  "flash cannon": "Steel",
  "iron head": "Steel",
  "bullet punch": "Steel",
  "expanding force": "Psychic",
  psyshock: "Psychic",
  psychic: "Psychic",
  "zen headbutt": "Psychic",
  "stone edge": "Rock",
  "rock slide": "Rock",
  "power gem": "Rock",
  "gunk shot": "Poison",
  "sludge bomb": "Poison",
  "mortal spin": "Poison",
  toxic: "Poison",
  "sludge wave": "Poison",
  "wicked blow": "Dark",
  "dark pulse": "Dark",
  "knock off": "Dark",
  "foul play": "Dark",
  "sucker punch": "Dark",
  snarl: "Dark",
  "u turn": "Bug",
  "bug buzz": "Bug",
  "first impression": "Bug",
  "hyper voice": "Normal",
  "extreme speed": "Normal",
  "fake out": "Normal",
  boomburst: "Normal",
  "rapid spin": "Normal",
};

// Bases de datos para Mix and Mega (Mega Piedras y Orbes)
export const MEGA_STONES_STATS_DB: Record<
  string,
  {
    name: string;
    ability: string;
    stats: { Atk: number; Def: number; SpA: number; SpD: number; Spe: number };
  }
> = {
  pidgeotite: {
    name: "Pidgeotite",
    ability: "No Guard",
    stats: { Atk: 0, Def: 10, SpA: 50, SpD: 10, Spe: 30 },
  },
  gengarite: {
    name: "Gengarite",
    ability: "Shadow Tag",
    stats: { Atk: 0, Def: 20, SpA: 40, SpD: 20, Spe: 20 },
  },
  charizarditex: {
    name: "Charizardite X",
    ability: "Tough Claws",
    stats: { Atk: 46, Def: 33, SpA: 21, SpD: 0, Spe: 0 },
  },
  charizarditey: {
    name: "Charizardite Y",
    ability: "Drought",
    stats: { Atk: 20, Def: 0, SpA: 50, SpD: 30, Spe: 0 },
  },
  lucarionite: {
    name: "Lucarionite",
    ability: "Adaptability",
    stats: { Atk: 35, Def: 18, SpA: 25, SpD: 0, Spe: 22 },
  },
  salamencite: {
    name: "Salamencite",
    ability: "Aerilate",
    stats: { Atk: 10, Def: 50, SpA: 10, SpD: 10, Spe: 20 },
  },
  metagrossite: {
    name: "Metagrossite",
    ability: "Tough Claws",
    stats: { Atk: 10, Def: 20, SpA: 10, SpD: 10, Spe: 50 },
  },
  kangaskhanite: {
    name: "Kangaskhanite",
    ability: "Parental Bond",
    stats: { Atk: 30, Def: 20, SpA: 0, SpD: 10, Spe: 40 },
  },
  gyaradosite: {
    name: "Gyaradosite",
    ability: "Mold Breaker",
    stats: { Atk: 35, Def: 30, SpA: 0, SpD: 20, Spe: 15 },
  },
  mawilite: {
    name: "Mawilite",
    ability: "Huge Power",
    stats: { Atk: 20, Def: 40, SpA: 0, SpD: 40, Spe: 0 },
  },
  blastoisinite: {
    name: "Blastoisinite",
    ability: "Mega Launcher",
    stats: { Atk: 20, Def: 20, SpA: 50, SpD: 10, Spe: 0 },
  },
  venusaurite: {
    name: "Venusaurite",
    ability: "Thick Fat",
    stats: { Atk: 18, Def: 40, SpA: 22, SpD: 20, Spe: 0 },
  },
  gardevoirite: {
    name: "Gardevoirite",
    ability: "Pixilate",
    stats: { Atk: 20, Def: 0, SpA: 40, SpD: 20, Spe: 20 },
  },
  galladite: {
    name: "Galladite",
    ability: "Inner Focus",
    stats: { Atk: 40, Def: 15, SpA: 0, SpD: 0, Spe: 30 },
  },
  pinsirite: {
    name: "Pinsirite",
    ability: "Aerilate",
    stats: { Atk: 31, Def: 20, SpA: 10, SpD: 20, Spe: 19 },
  },
  scizorite: {
    name: "Scizorite",
    ability: "Technician",
    stats: { Atk: 20, Def: 40, SpA: 10, SpD: 20, Spe: 10 },
  },
  aerodactylite: {
    name: "Aerodactylite",
    ability: "Tough Claws",
    stats: { Atk: 30, Def: 20, SpA: 0, SpD: 20, Spe: 30 },
  },
  beedrillite: {
    name: "Beedrillite",
    ability: "Adaptability",
    stats: { Atk: 60, Def: 0, SpA: -15, SpD: 0, Spe: 55 },
  },
  diancite: {
    name: "Diancite",
    ability: "Magic Bounce",
    stats: { Atk: 60, Def: -40, SpA: 60, SpD: -40, Spe: 60 },
  },
  redorb: {
    name: "Red Orb",
    ability: "Desolate Land",
    stats: { Atk: 30, Def: 20, SpA: 50, SpD: 0, Spe: 0 },
  },
  blueorb: {
    name: "Blue Orb",
    ability: "Primordial Sea",
    stats: { Atk: 50, Def: 10, SpA: 30, SpD: 20, Spe: 0 },
  },
};

// Habilidades baneadas en Almost Any Ability
export const AAA_BANNED_ABILITIES = new Set([
  "wonder guard", "superguardia",
  "shadow tag", "sombra trampa",
  "arena trap", "trampa arena",
  "imposter", "impostor",
  "neutralizing gas", "gas reactivo",
  "huge power", "potencia",
  "pure power", "energia pura"
]);

// Mapeo exhaustivo de tipos elementales para las principales especies competitivas del meta
const COMPETITIVE_SPECIES_DB: Record<string, { types: string[]; isEvolved: boolean }> = {
  // Fire
  Arcanine: { types: ["Fire"], isEvolved: true },
  Torkoal: { types: ["Fire"], isEvolved: true },
  Heatran: { types: ["Fire", "Steel"], isEvolved: true },
  Volcarona: { types: ["Fire", "Bug"], isEvolved: true },
  Cinderace: { types: ["Fire"], isEvolved: true },
  Charizard: { types: ["Fire", "Flying"], isEvolved: true },
  "Charizard-Mega-Y": { types: ["Fire", "Flying"], isEvolved: true },
  "Charizard-Mega-X": { types: ["Fire", "Dragon"], isEvolved: true },
  Ceruledge: { types: ["Fire", "Ghost"], isEvolved: true },
  Armarouge: { types: ["Fire", "Psychic"], isEvolved: true },
  "Chi-Yu": { types: ["Dark", "Fire"], isEvolved: true },
  "Iron-Moth": { types: ["Fire", "Poison"], isEvolved: true },
  "Ogerpon-Hearthflame": { types: ["Grass", "Fire"], isEvolved: true },
  "Gouging-Fire": { types: ["Fire", "Dragon"], isEvolved: true },
  Blaziken: { types: ["Fire", "Fighting"], isEvolved: true },

  // Water
  Pelipper: { types: ["Water", "Flying"], isEvolved: true },
  Kyogre: { types: ["Water"], isEvolved: true },
  Gastrodon: { types: ["Water", "Ground"], isEvolved: true },
  Milotic: { types: ["Water"], isEvolved: true },
  Primarina: { types: ["Water", "Fairy"], isEvolved: true },
  Suicune: { types: ["Water"], isEvolved: true },
  Palafin: { types: ["Water"], isEvolved: true },
  Dondozo: { types: ["Water"], isEvolved: true },
  Tatsugiri: { types: ["Dragon", "Water"], isEvolved: true },
  "Urshifu-Rapid-Strike": { types: ["Water", "Fighting"], isEvolved: true },
  "Ogerpon-Wellspring": { types: ["Grass", "Water"], isEvolved: true },
  "Walking-Wake": { types: ["Water", "Dragon"], isEvolved: true },
  "Rotom-Wash": { types: ["Electric", "Water"], isEvolved: true },

  // Grass
  Amoonguss: { types: ["Grass", "Poison"], isEvolved: true },
  Rillaboom: { types: ["Grass"], isEvolved: true },
  Venusaur: { types: ["Grass", "Poison"], isEvolved: true },
  Serperior: { types: ["Grass"], isEvolved: true },
  Whimsicott: { types: ["Grass", "Fairy"], isEvolved: true },
  Tsareena: { types: ["Grass"], isEvolved: true },
  Meowscarada: { types: ["Grass", "Dark"], isEvolved: true },
  Sinistcha: { types: ["Grass", "Ghost"], isEvolved: true },
  Meganium: { types: ["Grass"], isEvolved: true },
  "Meganium-Mega": { types: ["Grass", "Fairy"], isEvolved: true },
  Ogerpon: { types: ["Grass"], isEvolved: true },
  Kartana: { types: ["Grass", "Steel"], isEvolved: true },

  // Electric
  Miraidon: { types: ["Electric", "Dragon"], isEvolved: true },
  Regieleki: { types: ["Electric"], isEvolved: true },
  "Raging-Bolt": { types: ["Electric", "Dragon"], isEvolved: true },
  "Iron-Hands": { types: ["Electric", "Fighting"], isEvolved: true },
  Zapdos: { types: ["Electric", "Flying"], isEvolved: true },
  Thundurus: { types: ["Electric", "Flying"], isEvolved: true },

  // Ground
  "Great-Tusk": { types: ["Ground", "Fighting"], isEvolved: true },
  Landorus: { types: ["Ground", "Flying"], isEvolved: true },
  "Landorus-Therian": { types: ["Ground", "Flying"], isEvolved: true },
  Ursaluna: { types: ["Ground", "Normal"], isEvolved: true },
  "Ursaluna-Bloodmoon": { types: ["Ground", "Normal"], isEvolved: true },
  Garchomp: { types: ["Dragon", "Ground"], isEvolved: true },
  Gliscor: { types: ["Ground", "Flying"], isEvolved: true },
  "Ting-Lu": { types: ["Dark", "Ground"], isEvolved: true },
  Clodsire: { types: ["Poison", "Ground"], isEvolved: true },
  Excadrill: { types: ["Steel", "Ground"], isEvolved: true },

  // Flying
  Tornadus: { types: ["Flying"], isEvolved: true },
  "Tornadus-Therian": { types: ["Flying"], isEvolved: true },
  Dragonite: { types: ["Dragon", "Flying"], isEvolved: true },
  Corviknight: { types: ["Steel", "Flying"], isEvolved: true },
  Salamence: { types: ["Dragon", "Flying"], isEvolved: true },
  Gyarados: { types: ["Water", "Flying"], isEvolved: true },

  // Ghost
  Gholdengo: { types: ["Steel", "Ghost"], isEvolved: true },
  "Flutter-Mane": { types: ["Ghost", "Fairy"], isEvolved: true },
  "Calyrex-Shadow": { types: ["Psychic", "Ghost"], isEvolved: true },
  Dragapult: { types: ["Dragon", "Ghost"], isEvolved: true },
  Annihilape: { types: ["Fighting", "Ghost"], isEvolved: true },
  Basculegion: { types: ["Water", "Ghost"], isEvolved: true },
  Gengar: { types: ["Ghost", "Poison"], isEvolved: true },
  Skeledirge: { types: ["Fire", "Ghost"], isEvolved: true },
  Mimikyu: { types: ["Ghost", "Fairy"], isEvolved: true },

  // Steel
  Archaludon: { types: ["Steel", "Dragon"], isEvolved: true },
  Kingambit: { types: ["Dark", "Steel"], isEvolved: true },
  Scizor: { types: ["Bug", "Steel"], isEvolved: true },
  "Iron-Crown": { types: ["Steel", "Psychic"], isEvolved: true },
  Aegislash: { types: ["Steel", "Ghost"], isEvolved: true },

  // Fairy
  Sylveon: { types: ["Fairy"], isEvolved: true },
  Clefairy: { types: ["Fairy"], isEvolved: false },
  Clefable: { types: ["Fairy"], isEvolved: true },
  Gardevoir: { types: ["Psychic", "Fairy"], isEvolved: true },
  Fezandipiti: { types: ["Poison", "Fairy"], isEvolved: true },
  Hatterene: { types: ["Psychic", "Fairy"], isEvolved: true },

  // Ice
  "Chien-Pao": { types: ["Dark", "Ice"], isEvolved: true },
  Baxcalibur: { types: ["Dragon", "Ice"], isEvolved: true },
  "Calyrex-Ice": { types: ["Psychic", "Ice"], isEvolved: true },
  "Iron-Bundle": { types: ["Ice", "Water"], isEvolved: true },
  Kyurem: { types: ["Dragon", "Ice"], isEvolved: true },
  Cetitan: { types: ["Ice"], isEvolved: true },

  // Fighting
  Koraidon: { types: ["Fighting", "Dragon"], isEvolved: true },
  Sneasler: { types: ["Poison", "Fighting"], isEvolved: true },
  Zamazenta: { types: ["Fighting", "Steel"], isEvolved: true },
  Lucario: { types: ["Steel", "Fighting"], isEvolved: true },

  // Psychic
  Indeedee: { types: ["Psychic", "Normal"], isEvolved: true },
  "Indeedee-F": { types: ["Psychic", "Normal"], isEvolved: true },
  Farigiraf: { types: ["Normal", "Psychic"], isEvolved: true },

  // Poison
  Glimmora: { types: ["Rock", "Poison"], isEvolved: true },
  Overqwil: { types: ["Dark", "Poison"], isEvolved: true },
  Toxapex: { types: ["Water", "Poison"], isEvolved: true },

  // Dragon
  "Roaring-Moon": { types: ["Dragon", "Dark"], isEvolved: true },

  // Rock
  Tyranitar: { types: ["Rock", "Dark"], isEvolved: true },
  "Ogerpon-Cornerstone": { types: ["Grass", "Rock"], isEvolved: true },

  // Dark
  Grimmsnarl: { types: ["Dark", "Fairy"], isEvolved: true },
  Darkrai: { types: ["Dark"], isEvolved: true },
  Yveltal: { types: ["Dark", "Flying"], isEvolved: true },

  // Normal
  Maushold: { types: ["Normal"], isEvolved: true },
  Smeargle: { types: ["Normal"], isEvolved: true },
  Porygon2: { types: ["Normal"], isEvolved: false },
  Blissey: { types: ["Normal"], isEvolved: true },
  Chansey: { types: ["Normal"], isEvolved: false },

  // LC Popular First Stages
  Bulbasaur: { types: ["Grass", "Poison"], isEvolved: false },
  Charmander: { types: ["Fire"], isEvolved: false },
  Squirtle: { types: ["Water"], isEvolved: false },
  Gligar: { types: ["Ground", "Flying"], isEvolved: false },
  Sneasel: { types: ["Dark", "Ice"], isEvolved: false },
  Porygon: { types: ["Normal"], isEvolved: false },
  Growlithe: { types: ["Fire"], isEvolved: false },
  Vulpix: { types: ["Fire"], isEvolved: false },
  "Vulpix-Alola": { types: ["Ice"], isEvolved: false },
  Foongus: { types: ["Grass", "Poison"], isEvolved: false },
  Mienfoo: { types: ["Fighting"], isEvolved: false },
  Pawniard: { types: ["Dark", "Steel"], isEvolved: false },
  Tinkatink: { types: ["Steel", "Fairy"], isEvolved: false },
  Frigibax: { types: ["Dragon", "Ice"], isEvolved: false },
  Sprigatito: { types: ["Grass"], isEvolved: false },
  Fuecoco: { types: ["Fire"], isEvolved: false },
  Quaxly: { types: ["Water"], isEvolved: false },
  Glimmet: { types: ["Rock", "Poison"], isEvolved: false },
  Mudbray: { types: ["Ground"], isEvolved: false },
  Mareanie: { types: ["Water", "Poison"], isEvolved: false },
  Shellos: { types: ["Water"], isEvolved: false },
  Drilbur: { types: ["Ground"], isEvolved: false },
  Timburr: { types: ["Fighting"], isEvolved: false },
  Grookey: { types: ["Grass"], isEvolved: false },
  Scraggy: { types: ["Dark", "Fighting"], isEvolved: false },
  Girafarig: { types: ["Normal", "Psychic"], isEvolved: false },
  Dunsparce: { types: ["Normal"], isEvolved: false },
  Stunky: { types: ["Poison", "Dark"], isEvolved: false },
  Gastly: { types: ["Ghost", "Poison"], isEvolved: false },
  Magnemite: { types: ["Electric", "Steel"], isEvolved: false },
  Rufflet: { types: ["Normal", "Flying"], isEvolved: false },
  Toedscool: { types: ["Ground", "Grass"], isEvolved: false },
  Wattrel: { types: ["Electric", "Flying"], isEvolved: false },
};

// Clasificaciones de Pokémon especiales para validaciones de formato
const RESTRICTED_LEGENDARIES = new Set([
  "mewtwo", "lugia", "hooh", "kyogre", "groudon", "rayquaza", "dialga", "palkia", "giratina",
  "reshiram", "zekrom", "kyurem", "xerneas", "yveltal", "zygarde", "cosmog", "cosmoem",
  "solgaleo", "lunala", "necrozma", "zacian", "zamazenta", "eternatus", "calyrex",
  "koraidon", "miraidon", "terapagos"
]);

const SUB_LEGENDARIOS = new Set([
  "articuno", "zapdos", "moltres", "raikou", "entei", "suicune", "regirock", "regice", "registeel",
  "latias", "latios", "uxie", "mesprit", "azelf", "heatran", "regigigas", "cresselia", "cobalion",
  "terrakion", "virizion", "tornadus", "thundurus", "landorus", "enamorus", "typenull", "silvally",
  "tapukoko", "tapulele", "tapubulu", "tapufini", "nihilego", "buzzwole", "pheromosa", "xurkitree",
  "celesteela", "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon", "kubfu",
  "urshifu", "regieleki", "regidrago", "glastrier", "spectrier", "okidogi", "munkidori",
  "fezandipiti", "ogerpon"
]);

const TREASURES_OF_RUIN = new Set([
  "wochien", "chienpao", "tinglu", "chiyu"
]);

const PARADOX_POKEMON = new Set([
  "greattusk", "screamtail", "brutebonnet", "fluttermane", "slitherwing", "sandyshocks", "roaringmoon",
  "gougingfire", "ragingbolt", "walkingwake", "irontreads", "ironbundle", "ironhands", "ironjugulis",
  "ironmoth", "ironthorns", "ironvaliant", "ironcrown", "ironboulder", "ironleaves"
]);

const MYTHICAL_POKEMON = new Set([
  "mew", "celebi", "jirachi", "deoxys", "phione", "manaphy", "darkrai", "shaymin", "arceus",
  "victini", "keldeo", "meloetta", "genesect", "diancie", "hoopa", "volcanion", "magearna",
  "marshadow", "zeraora", "meltan", "melmetal", "zarude", "pecharunt"
]);

// Regulación estricta de National Dex (Smogon)
const NATDEX_OU_BANS = {
  species: new Set([
    "calyrex", "calyrex-ice", "calyrex-shadow", "chi-yu", "chien-pao", "deoxys", "deoxys-attack",
    "dialga", "dialga-origin", "eternatus", "flutter-mane", "giratina", "giratina-origin",
    "groudon", "ho-oh", "koraidon", "miraidon", "terapagos", "palafin", "shedinja", "spectrier", "urshifu",
    "calyrexshadow", "calyrexice", "chiyu", "chienpao", "deoxysattack", "dialgaorigin", "fluttermane",
    "giratinaorigin", "kyuremblack", "kyuremwhite", "landorus", "necrozmadm", "necrozmadw",
    "palkiaorigin", "urshifubase", "zaciancrowned", "zamazentabase", "urshifurapidstrike",
    "urshifusinglestrike", "magearna"
  ]),
  items: new Set([
    "gengarite", "mawilite", "salamencite", "metagrossite", "king's rock", "kings rock", "razor fang", "razorfang"
  ]),
  abilities: new Set([
    "shadow tag", "shadowtag", "arena trap", "arenatrap", "moody"
  ]),
  moves: new Set([
    "assist", "shed tail", "shedtail"
  ])
};

// Regulación de National Dex Doubles (Smogon)
const NATDEX_DOUBLES_BANS = {
  species: new Set([
    "arceus", "calyrex-ice", "calyrex-shadow", "dialga", "eternatus", "genesect", "giratina", "giratina-origin",
    "groudon", "ho-oh", "koraidon", "kyogre", "kyurem-white", "lugia", "lunala", "magearna", "melmetal", "mewtwo",
    "miraidon", "necrozma-dawn-wings", "necrozma-dusk-mane", "palkia", "rayquaza", "reshiram", "solgaleo", "xerneas",
    "yveltal", "zacian", "zacian-crowned", "zamazenta-crowned", "zekrom", "zygarde",
    "calyrexice", "calyrexshadow", "giratinaorigin", "kyuremwhite", "necrozmadawnwings", "necrozmaduskmane",
    "zaciancrowned", "zamazentacrowned", "annihilape", "deoxys-attack", "deoxysattack", "metagross-mega",
    "metagrossmeg", "shedinja", "stakataka", "urshifu", "urshifu-rapid-strike", "urshifu-single-strike",
    "urshifurapidstrike", "urshifusinglestrike"
  ]),
  abilities: new Set([
    "commander", "power construct", "powerconstruct", "sand veil", "sandveil", "snow cloak", "snowcloak", "shadow tag", "shadowtag"
  ]),
  moves: new Set([
    "fissure", "guillotine", "horn drill", "sheer cold", "double team", "minimize", "assist", "coaching", "dark void", "swagger",
    "fisura", "guillotina", "perforador", "frio polar", "doble equipo", "reduccion", "refuerzo", "coaching", "brecha negra", "contoneo"
  ]),
  items: new Set([])
};

// Especies dominantes de National Dex OU para regular en UU
const NATDEX_OU_SPECIES = new Set([
  "greattusk", "gholdengo", "kingambit", "dragapult", "rillaboom", "landorustherian", "darkrai",
  "garganacl", "gliscor", "ironvaliant", "samurotthisui", "sneasler", "volcarona", "zamazenta",
  "roaringmoon", "garchomp", "heatran", "corviknight", "clodsire", "alomomola", "kyurem",
  "toxapex", "hatterene", "meowscarada", "zapdos", "glimmora", "weavile", "serperior", "cinderace",
  "torkoal", "venusaur", "excadrill", "latios", "latias", "alakazam", "charizard", "scizor",
  "slowkinggalar", "kartana", "lopunny", "medicham", "mawile", "diancie", "banette", "absol",
  "pinsir", "gengar", "aerodactyl", "beedrill",
  "great-tusk", "landorus-therian", "samurott-hisui", "roaring-moon", "slowking-galar", "venusaur-mega",
  "charizard-mega-x", "charizard-mega-y", "scizor-mega", "lopunny-mega", "medicham-mega", "mawile-mega",
  "diancie-mega", "banette-mega", "absol-mega", "pinsir-mega", "gengar-mega", "aerodactyl-mega", "beedrill-mega"
]);

// Especies dominantes de National Dex UU para regular en RU
const NATDEX_UU_SPECIES = new Set([
  "aegislash", "skeledirge", "hydrapple", "kleavor", "moltres", "moltresgalar",
  "tinkaton", "ursaluna", "tornadustherian", "zapdosgalar", "cresselia", "enamorustherian",
  "hippowdon", "krookodile", "lokix", "maushold", "mamoswine", "ogerpon", "rotomwash",
  "sinistcha", "sandyshocks", "regieleki", "gyarados", "sableye", "salamence", "altaria",
  "gallade", "gardevoir", "sharpedo", "camerupt", "glalie", "steelix", "pidgeot", "audino",
  "moltres-galar", "tornadus-therian", "zapdos-galar", "enamorus-therian", "rotom-wash",
  "sableye-mega", "salamence-mega", "altaria-mega", "gallade-mega", "gardevoir-mega",
  "sharpedo-mega", "camerupt-mega", "glalie-mega", "steelix-mega", "pidgeot-mega", "audino-mega"
]);

// Normalizar nombres de Pokémon (reemplaza espacios por guiones para la DB)
export function getSpeciesData(species: string): { types: string[]; isEvolved: boolean } {
  const normalized = species.trim().replace(/\s+/g, "-");
  
  // 1. Intentar buscar en el Dex oficial de @pkmn/dex
  const sp = Dex.species.get(normalized);
  if (sp && sp.exists) {
    const canEvolve = (sp.evos && sp.evos.length > 0) || sp.nfe;
    const isFirstStage = !sp.prevo && canEvolve;
    return {
      types: sp.types,
      isEvolved: !isFirstStage
    };
  }
  
  // 2. Buscar coincidencia exacta
  const exactKey = Object.keys(COMPETITIVE_SPECIES_DB).find(k => k.toLowerCase() === normalized.toLowerCase());
  if (exactKey) {
    return COMPETITIVE_SPECIES_DB[exactKey];
  }
  
  // 3. Coincidencias de prefijos (por ejemplo, Ogerpon-*, Calyrex-*, Incineroar-*, etc.)
  const foundKey = Object.keys(COMPETITIVE_SPECIES_DB).find(k => 
    normalized.toLowerCase().startsWith(k.toLowerCase()) || 
    k.toLowerCase().startsWith(normalized.toLowerCase())
  );
  
  if (foundKey) {
    return COMPETITIVE_SPECIES_DB[foundKey];
  }

  // 4. Fallback heurístico inteligente
  const types: string[] = ["Normal"];
  const lName = normalized.toLowerCase();
  
  if (lName.includes("water") || lName.includes("fish") || lName.includes("sea")) {
    types[0] = "Water";
  } else if (lName.includes("fire") || lName.includes("sun") || lName.includes("flame")) {
    types[0] = "Fire";
  } else if (lName.includes("grass") || lName.includes("leaf") || lName.includes("bloom")) {
    types[0] = "Grass";
  } else if (lName.includes("bolt") || lName.includes("volt") || lName.includes("spark") || lName.includes("electric")) {
    types[0] = "Electric";
  } else if (lName.includes("iron") || lName.includes("steel") || lName.includes("metal")) {
    types[0] = "Steel";
  } else if (lName.includes("shadow") || lName.includes("ghost") || lName.includes("spectre")) {
    types[0] = "Ghost";
  } else if (lName.includes("dragon") || lName.includes("drake")) {
    types[0] = "Dragon";
  } else if (lName.includes("fairy") || lName.includes("pixie") || lName.includes("mane")) {
    types[0] = "Fairy";
  } else if (lName.includes("ice") || lName.includes("frost") || lName.includes("snow")) {
    types[0] = "Ice";
  }

  return {
    types,
    isEvolved: true
  };
}

export function getSpeciesBaseStats(species: string): { HP: number; Atk: number; Def: number; SpA: number; SpD: number; Spe: number } {
  const normalized = species.trim().replace(/\s+/g, "-");
  
  // 1. Intentar buscar en el Dex oficial de @pkmn/dex
  const sp = Dex.species.get(normalized);
  if (sp && sp.exists && sp.baseStats) {
    return {
      HP: sp.baseStats.hp,
      Atk: sp.baseStats.atk,
      Def: sp.baseStats.def,
      SpA: sp.baseStats.spa,
      SpD: sp.baseStats.spd,
      Spe: sp.baseStats.spe
    };
  }
  
  const exactKey = Object.keys(SPECIES_BASE_STATS).find(k => k.toLowerCase() === normalized.toLowerCase());
  if (exactKey) {
    return SPECIES_BASE_STATS[exactKey];
  }
  
  const foundKey = Object.keys(SPECIES_BASE_STATS).find(k => 
    normalized.toLowerCase().startsWith(k.toLowerCase()) || 
    k.toLowerCase().startsWith(normalized.toLowerCase())
  );
  
  if (foundKey) {
    return SPECIES_BASE_STATS[foundKey];
  }
  
  return { HP: 80, Atk: 80, Def: 80, SpA: 80, SpD: 80, Spe: 80 };
}

export function validateTeam(
  members: PokemonBuild[],
  format: string = "gen9vgc2025regb",
  customRules?: any
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const fmt = format.toLowerCase();

  // Cargar reglas customizadas si aplica
  const isCustom = fmt.startsWith("custom") || !!customRules;
  const rules = isCustom ? {
    speciesClause: customRules?.speciesClause ?? customRules?.reglas?.speciesClause ?? true,
    itemClause: customRules?.itemClause ?? customRules?.reglas?.itemClause ?? false,
    allowMega: customRules?.allowMega ?? customRules?.reglas?.allowMega ?? true,
    allowZMove: customRules?.allowZMove ?? customRules?.reglas?.allowZMove ?? true,
    allowTera: customRules?.allowTera ?? customRules?.reglas?.allowTera ?? true,
    maxLevel: customRules?.maxLevel ?? customRules?.reglas?.maxLevel ?? 100,
    minLevel: customRules?.minLevel ?? customRules?.reglas?.minLevel ?? 1,
    bans: customRules?.bans ?? customRules?.reglas?.bans ?? { pokemon: [], items: [], moves: [], abilities: [] },
  } : null;

  // 0. Caso especial: Anything Goes (NatDex AG o similar) - APAGAR TODOS LOS FILTROS EXCEPTO LOS BÁSICOS
  const isAnythingGoes = fmt.includes("ag") || fmt.includes("anythinggoes");

  if (!members || members.length === 0) {
    return { valid: false, errors: ["El equipo está vacío."], warnings: [], suggestions: [] };
  }

  if (members.length > 6) {
    errors.push("El equipo no puede tener más de 6 Pokémon.");
  }

  const speciesList = members.map(m => m.species.trim().toLowerCase()).filter(Boolean);
  const itemsList = members.map(m => m.item.trim().toLowerCase()).filter(Boolean);

  // 1. Species Clause (Desactivado en AG)
  if (isCustom) {
    if (rules?.speciesClause) {
      const uniqueSpecies = new Set(speciesList);
      if (uniqueSpecies.size < speciesList.length) {
        errors.push("Violación de Species Clause: No puedes tener Pokémon duplicados de la misma especie en este formato.");
      }
    }
  } else if (!isAnythingGoes) {
    const uniqueSpecies = new Set(speciesList);
    if (uniqueSpecies.size < speciesList.length) {
      errors.push("Violación de Species Clause: No puedes tener Pokémon duplicados de la misma especie en este formato.");
    }
  }

  // 2. Item Clause (Activado solo en formatos oficiales VGC, 2v2 y 1v1; desactivado en OU, UU, RU, NU, PU, Ubers)
  const isVgcOrDoubles = fmt.includes("vgc") || fmt.includes("doubles") || fmt.includes("2v2") || fmt.includes("regulation") || fmt.includes("championship") || fmt.includes("reg");
  const isSmogonClassicalSingles = (fmt.includes("ou") || fmt.includes("uu") || fmt.includes("ru") || fmt.includes("nu") || fmt.includes("pu") || fmt.includes("nationaldex") || fmt.includes("natdex")) && !fmt.includes("doubles");
  const isLittleCup = fmt.includes("lc") || fmt.includes("littlecup");
  const isSmogonTiers = isSmogonClassicalSingles || fmt.includes("ubers") || isLittleCup;
  const is1v1 = fmt.includes("1v1");
  const isMonotype = fmt.includes("monotype") || !!customRules?.monotype || !!customRules?.reglas?.monotype;
  const isAAA = fmt.includes("almost-any-ability") || fmt.includes("aaa");
  const isHackmons = fmt.includes("hackmons") || fmt.includes("bh") || fmt.includes("ph");
  const isSTABmons = fmt.includes("stabmons");
  const isMixAndMega = fmt.includes("mix-and-mega") || fmt.includes("mixandmega");

  // Configuración de restricciones según el formato de regulación seleccionado
  let maxRestricted = 999;
  let allowParadox = true;
  let allowSubLegendaries = true;
  let allowTreasuresOfRuin = true;
  let allowMythicals = true;

  const isNatDex = fmt.includes("natdex") || fmt.includes("nationaldex");

  if (fmt === "regulation-h") {
    maxRestricted = 0;
    allowParadox = false;
    allowSubLegendaries = false;
    allowTreasuresOfRuin = false;
    allowMythicals = false;
  } else if (fmt === "regulation-g") {
    maxRestricted = 1;
    allowParadox = true;
    allowSubLegendaries = true;
    allowTreasuresOfRuin = true;
    allowMythicals = false;
  } else if (fmt === "regulation-f" || fmt === "regulation-e" || fmt === "regulation-d") {
    maxRestricted = 0;
    allowParadox = true;
    allowSubLegendaries = true;
    allowTreasuresOfRuin = true;
    allowMythicals = false;
  } else if (fmt === "regulation-c") {
    maxRestricted = 0;
    allowParadox = true;
    allowSubLegendaries = false;
    allowTreasuresOfRuin = true;
    allowMythicals = false;
  } else if (fmt === "championship-series" || fmt.includes("reg")) {
    maxRestricted = 1;
    allowMythicals = false;
  } else if (fmt.includes("ubers")) {
    maxRestricted = 999;
    allowMythicals = true;
  } else if (isSmogonClassicalSingles || fmt.includes("smogon-doubles-ou")) {
    const isUbersNatDex = fmt.includes("ubers") && isNatDex;
    maxRestricted = isUbersNatDex ? 999 : 0;
    allowMythicals = true;
  } else if (isLittleCup) {
    maxRestricted = 0;
    allowParadox = false;
    allowSubLegendaries = false;
    allowTreasuresOfRuin = false;
    allowMythicals = false;
  }

  // Reglas estructurales de Monotipo
  if (isMonotype) {
    maxRestricted = 0;
    allowMythicals = isNatDex ? true : false;
  }

  let restrictedCount = 0;
  
  // Smogon Doubles OU no tiene Item Clause, pero VGC, 1v1 y Mix & Mega sí
  const enforceItemClause = (isVgcOrDoubles && !fmt.includes("doublesou") && !fmt.includes("doubles-ou") && !fmt.includes("doubles")) || is1v1 || isMixAndMega;

  if (isCustom) {
    if (rules?.itemClause) {
      const activeItems = itemsList.filter(item => item !== "none" && item !== "no item" && item !== "");
      const uniqueItems = new Set(activeItems);
      if (uniqueItems.size < activeItems.length) {
        errors.push("Violación de Item Clause: Este formato prohíbe equipar el mismo objeto en múltiples Pokémon del equipo.");
      }
    }
  } else if (enforceItemClause && !isAnythingGoes) {
    const activeItems = itemsList.filter(item => item !== "none" && item !== "no item" && item !== "");
    const uniqueItems = new Set(activeItems);
    if (uniqueItems.size < activeItems.length) {
      errors.push("Violación de Item Clause: Este formato prohíbe equipar el mismo objeto en múltiples Pokémon del equipo.");
    }
  }

  // 3. Megas & Z-Crystals Clause (National Dex / Mix and Mega)
  if (isNatDex || isMixAndMega) {
    const megaStones = itemsList.filter(item => (item.endsWith("ite") && item.toLowerCase() !== "eviolite") || item.includes("ite ") || item === "red orb" || item === "blue orb" || item === "redorb" || item === "blueorb");
    const zCrystals = itemsList.filter(item => item.endsWith("ium z") || item.endsWith("ium-z"));
    
    if (megaStones.length > 1) {
      errors.push("Límite de Megaevolución: Tienes equipadas múltiples Mega Piedras. Solo se permite una activación de Mega por combate.");
    }
    if (zCrystals.length > 1) {
      errors.push("Límite de Movimiento Z: Tienes múltiples Cristales Z equipados. Solo se permite un Movimiento Z por combate.");
    }
  }

  // 4. Little Cup checks
  if (isLittleCup) {
    let hasEvioliteOrBerryJuice = false;

    members.forEach((m) => {
      const name = m.species;
      const data = getSpeciesData(m.species);

      // Especies no LC
      if (data.isEvolved) {
        errors.push(`Violación de Little Cup: ${name} no es una primera etapa evolutiva apta para este formato.`);
      }

      // Block restricted/paradox/sub-legendary/Ruins/mythicals in Little Cup
      const lookupNameLC = m.species.trim().toLowerCase().replace(/[\s\-_]+/g, "");
      if (
        RESTRICTED_LEGENDARIES.has(lookupNameLC) ||
        SUB_LEGENDARIOS.has(lookupNameLC) ||
        MYTHICAL_POKEMON.has(lookupNameLC) ||
        PARADOX_POKEMON.has(lookupNameLC) ||
        TREASURES_OF_RUIN.has(lookupNameLC)
      ) {
        errors.push(`Violación de Little Cup: ${name} es un Pokémon legendario, singular, sub-legendario, paradoja o de la ruina, lo cual está completamente prohibido en Little Cup.`);
      }

      // Check level (defaults to 5 in LC if undefined)
      const level = (m as any).level !== undefined ? (m as any).level : 5;
      if (!isCustom && level > 5) {
        errors.push(`Violación de Little Cup: ${name} tiene un nivel de ${level}, superando el límite de Nivel 5 del formato.`);
      }

      const itemLower = m.item.toLowerCase();
      if (itemLower.includes("eviolite") || itemLower.includes("mineral evolutivo") || itemLower.includes("berry juice") || itemLower.includes("zumo baya") || itemLower.includes("zumo de baya")) {
        hasEvioliteOrBerryJuice = true;
      }
    });

    if (!hasEvioliteOrBerryJuice) {
      warnings.push("Little Cup Warning: Careces de 'Eviolite' (Mineral Evolutivo) o 'Berry Juice' en tu equipo, pilares defensivos críticos del formato.");
    }
  }

  // 5. Monotype Clause
  if (isMonotype) {
    const targetType = customRules?.monotype || customRules?.reglas?.monotype;
    const allMemberTypes = members.map(m => getSpeciesData(m.species).types);
    if (allMemberTypes.length > 0) {
      if (targetType) {
        const targetLower = targetType.toLowerCase();
        const invalidMembers = members.filter((m, idx) => {
          const types = allMemberTypes[idx].map(t => t.toLowerCase());
          return !types.includes(targetLower);
        });
        if (invalidMembers.length > 0) {
          errors.push(`Violación de Monotype Clause: Todos los integrantes del equipo deben poseer el tipo elemental "${targetType}". Los siguientes miembros no lo tienen: ${invalidMembers.map(m => m.species).join(", ")}.`);
        }
      } else {
        // Encontrar la intersección de todos los tipos elementales del equipo
        let commonTypes = [...allMemberTypes[0]];
        for (let i = 1; i < allMemberTypes.length; i++) {
          commonTypes = commonTypes.filter(t => allMemberTypes[i].includes(t));
        }
        if (commonTypes.length === 0) {
          errors.push("Violación de Monotype Clause: Todos los integrantes del equipo deben compartir al menos un tipo elemental común (ej. Todos tipo Agua).");
        }
      }
    }
  }

  // 6. Formato 1v1 Pivot support ban
  if (is1v1) {
    members.forEach((m) => {
      const moves = m.moves.map(mv => mv.toLowerCase().trim());
      const forbidden1v1 = ["wish", "baton pass", "teleport", "deseo", "relevo", "teletransporte"];
      forbidden1v1.forEach((forbidden) => {
        if (moves.includes(forbidden)) {
          errors.push(`Ilegalidad 1v1: ${m.species} lleva '${forbidden}', movimiento de soporte a relevos prohibido en este formato.`);
        }
      });
    });
  }

  // 7. Almost Any Ability (AAA) bans
  if (isAAA) {
    members.forEach((m) => {
      const abilityLower = m.ability.toLowerCase().trim();
      if (AAA_BANNED_ABILITIES.has(abilityLower)) {
        errors.push(`Ilegalidad de Almost Any Ability: La habilidad '${m.ability}' está prohibida en este formato debido a su impacto centralizador.`);
      }
    });
  }

  // 8. Auditoría Pokémon por Pokémon (Red Teaming Engine)
  let weathers: string[] = [];
  let terrains: string[] = [];
  let teamWeaknesses: Record<string, { count: number; immuneCount: number }> = {};
  const elementTypes = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
    "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
    "Dragon", "Dark", "Steel", "Fairy"
  ];
  
  elementTypes.forEach(t => {
    teamWeaknesses[t] = { count: 0, immuneCount: 0 };
  });

  let hasSpeedControl = false;
  let hasHazardControl = false;
  let hasSmogonHazardControl = false;
  let hasChoiceScarfOrFastUser = false;
  let protectCount = 0;
  const isDoubles = isVgcOrDoubles || fmt.includes("doubles-ou") || fmt.includes("doublesou");

  members.forEach((m, idx) => {
    const name = m.species || `Slot ${idx + 1}`;
    const moves = m.moves.filter(move => move && move.trim() !== "").map(mv => mv.toLowerCase().trim());
    const itemLower = m.item.toLowerCase().trim();
    const abilityLower = m.ability.toLowerCase().trim();
    const speciesData = getSpeciesData(m.species);

    // Validar restricciones de categoría por formato
    const lookupName = m.species.trim().toLowerCase().replace(/[\s\-_]+/g, "");

    if (RESTRICTED_LEGENDARIES.has(lookupName)) {
      restrictedCount++;
      if (maxRestricted === 0) {
        errors.push(`Ilegalidad de Regulación (${format.toUpperCase()}): ${name} es un Legendario Restringido prohibido en este formato.`);
      }
    }
    if (PARADOX_POKEMON.has(lookupName) && !allowParadox) {
      errors.push(`Ilegalidad de Regulación (${format.toUpperCase()}): ${name} es un Pokémon Paradoja prohibido en este formato.`);
    }
    if (SUB_LEGENDARIOS.has(lookupName) && !allowSubLegendaries) {
      errors.push(`Ilegalidad de Regulación (${format.toUpperCase()}): ${name} es un Sub-Legendario prohibido en este formato.`);
    }
    if (TREASURES_OF_RUIN.has(lookupName) && !allowTreasuresOfRuin) {
      errors.push(`Ilegalidad de Regulación (${format.toUpperCase()}): ${name} es un Tesoro de la Ruina prohibido en este formato.`);
    }
    if (MYTHICAL_POKEMON.has(lookupName) && !allowMythicals) {
      errors.push(`Ilegalidad de Regulación (${format.toUpperCase()}): ${name} es un Pokémon Singular/Mítico prohibido en este formato.`);
    }

    // Regulación detallada de tiers y cláusulas de National Dex (Smogon)
    const isNatDexDoubles = fmt.includes("nationaldexdoubles") || fmt.includes("natdexdoubles") || fmt.includes("nationaldex-doubles") || fmt.includes("natdex-doubles");
    if (isNatDex && !fmt.includes("ubers") && !fmt.includes("ag")) {
      const itemLookup = m.item.trim().toLowerCase().replace(/[\s\-_]+/g, "");

      if (isNatDexDoubles) {
        if (NATDEX_DOUBLES_BANS.species.has(lookupName)) {
          errors.push(`Ilegalidad de National Dex Doubles: ${name} está prohibido en este formato.`);
        }
        if (NATDEX_DOUBLES_BANS.abilities.has(abilityLower)) {
          errors.push(`Ilegalidad de National Dex Doubles: La habilidad '${m.ability}' está prohibida en este formato.`);
        }
        moves.forEach(mv => {
          if (NATDEX_DOUBLES_BANS.moves.has(mv)) {
            errors.push(`Ilegalidad de National Dex Doubles: El movimiento '${mv}' está prohibido en este formato.`);
          }
        });
      } else {
        // Prohibir Megapiedras rotas u objetos prohibidos en OU/UU/RU
        if (NATDEX_OU_BANS.items.has(itemLower) || NATDEX_OU_BANS.items.has(itemLookup)) {
          errors.push(`Ilegalidad de National Dex: El objeto '${m.item}' está prohibido en este formato.`);
        }
        
        // Prohibir habilidades rotas (Shadow Tag, Arena Trap, Moody)
        if (NATDEX_OU_BANS.abilities.has(abilityLower)) {
          errors.push(`Ilegalidad de National Dex: La habilidad '${m.ability}' está prohibida en este formato.`);
        }
        
        // Prohibir movimientos rotos (Assist, Shed Tail)
        moves.forEach(mv => {
          if (NATDEX_OU_BANS.moves.has(mv)) {
            errors.push(`Ilegalidad de National Dex: El movimiento '${mv}' está prohibido en este formato.`);
          }
        });

        // Prohibir especies Uber/banned en NatDex
        if (NATDEX_OU_BANS.species.has(lookupName)) {
          errors.push(`Ilegalidad de National Dex: ${name} está prohibido en el formato estándar debido a su excesivo poder.`);
        }

        // Validaciones específicas de la tier National Dex UU
        const isNatDexUU = fmt.includes("nationaldexuu") || fmt.includes("natdexuu") || fmt.includes("nationaldex-uu") || fmt.includes("natdex-uu");
        if (isNatDexUU) {
          if (NATDEX_OU_SPECIES.has(lookupName)) {
            errors.push(`Violación de Tier National Dex UU: ${name} es un Pokémon dominante en la tier National Dex OU y está prohibido en UU.`);
          }
        }

        // Validaciones específicas de la tier National Dex RU
        const isNatDexRU = fmt.includes("nationaldexru") || fmt.includes("natdexru") || fmt.includes("nationaldex-ru") || fmt.includes("natdex-ru");
        if (isNatDexRU) {
          if (NATDEX_OU_SPECIES.has(lookupName) || NATDEX_UU_SPECIES.has(lookupName)) {
            errors.push(`Violación de Tier National Dex RU: ${name} pertenece a una tier superior (OU/UU) y está prohibido en la tier RU.`);
          }
        }
      }
    }

    // Regulación para formatos personalizados
    if (isCustom) {
      // 1. Megas, Cristales Z, Teracristalización prohibidos
      if (!rules?.allowMega) {
        const isMegaStone = (itemLower.endsWith("ite") && itemLower !== "eviolite") || itemLower.includes("ite ") || itemLower === "red orb" || itemLower === "blue orb" || itemLower === "redorb" || itemLower === "blueorb";
        if (isMegaStone) {
          errors.push(`Violación de Formato Personalizado: Las Mega Evoluciones están prohibidas, pero ${name} lleva una Mega Piedra u Orbe Primigenio.`);
        }
      }
      if (!rules?.allowZMove) {
        const isZCrystal = itemLower.endsWith("ium z") || itemLower.endsWith("ium-z");
        if (isZCrystal) {
          errors.push(`Violación de Formato Personalizado: Los Movimientos Z están prohibidos, pero ${name} lleva un Cristal Z.`);
        }
      }
      if (!rules?.allowTera && m.teraType && m.teraType.toLowerCase() !== "none" && m.teraType.toLowerCase() !== "") {
        warnings.push(`Advertencia de Formato Personalizado: La Teracristalización está prohibida en este formato, por lo que el Teratipo de ${name} (${m.teraType}) será ignorado.`);
      }

      // 2. Level limits check
      const defaultLevel = isLittleCup ? 5 : 50;
      const level = (m as any).level !== undefined ? (m as any).level : defaultLevel;
      if (level > (rules?.maxLevel ?? 100)) {
        errors.push(`Violación de Formato Personalizado: ${name} tiene un nivel de ${level}, superando el límite máximo de Nivel ${rules?.maxLevel ?? 100}.`);
      }
      if (level < (rules?.minLevel ?? 1)) {
        errors.push(`Violación de Formato Personalizado: ${name} tiene un nivel de ${level}, por debajo del límite mínimo de Nivel ${rules?.minLevel ?? 1}.`);
      }

      // 3. Custom bans
      if (rules?.bans?.pokemon && rules.bans.pokemon.some((p: string) => p.toLowerCase().trim() === lookupName || p.toLowerCase().trim() === m.species.trim().toLowerCase())) {
        errors.push(`Violación de Formato Personalizado: ${name} está explícitamente prohibido en este formato personalizado.`);
      }
      if (rules?.bans?.items && rules.bans.items.some((i: string) => i.toLowerCase().trim() === itemLower)) {
        errors.push(`Violación de Formato Personalizado: El objeto '${m.item}' está explícitamente prohibido en este formato personalizado.`);
      }
      if (rules?.bans?.abilities && rules.bans.abilities.some((a: string) => a.toLowerCase().trim() === abilityLower)) {
        errors.push(`Violación de Formato Personalizado: La habilidad '${m.ability}' está explícitamente prohibida en este formato personalizado.`);
      }
      moves.forEach(mv => {
        if (rules?.bans?.moves && rules.bans.moves.some((mvBan: string) => mvBan.toLowerCase().trim() === mv)) {
          errors.push(`Violación de Formato Personalizado: El movimiento '${mv}' está explícitamente prohibido en este formato personalizado.`);
        }
      });
    }

    // Registro de climas y terrenos
    if (abilityLower === "drizzle" || abilityLower === "llovizna" || moves.includes("rain dance") || moves.includes("danza lluvia")) weathers.push("Rain");
    if (abilityLower === "drought" || abilityLower === "sequia" || moves.includes("sunny day") || moves.includes("dia soleado")) weathers.push("Sun");
    if (abilityLower === "sand stream" || abilityLower === "chorro arena" || moves.includes("sandstorm") || moves.includes("tormenta arena")) weathers.push("Sand");
    if (abilityLower === "snow warning" || abilityLower === "nevada" || moves.includes("snowscape") || moves.includes("paisaje nevado")) weathers.push("Snow");

    if (abilityLower === "psychic surge" || abilityLower === "duplicado psiquico" || abilityLower === "psicogenesis") terrains.push("Psychic");
    if (abilityLower === "grassy surge" || abilityLower === "herbogenesis") terrains.push("Grassy");
    if (abilityLower === "electric surge" || abilityLower === "hadron engine" || abilityLower === "electrogenesis") terrains.push("Electric");
    if (abilityLower === "misty surge" || abilityLower === "nebulogenesis") terrains.push("Misty");

    // Registro de movimientos clave
    const isProtectMove = (mv: string) => 
      ["protect", "detect", "spiky shield", "baneful bunker", "silk trap", "burning bulwark", "king's shield", "proteccion", "deteccion", "escudo espinoso", "barrera nociva", "escudo real"].includes(mv);
    
    if (moves.some(isProtectMove)) protectCount++;

    const isSpeedControlMove = (mv: string) =>
      ["tailwind", "trick room", "icy wind", "electroweb", "scary face", "viento afin", "espacio raro", "viento hielo", "red electrogene", "cara susto", "red viscosa", "sticky web"].includes(mv);
    if (moves.some(isSpeedControlMove)) hasSpeedControl = true;

    const isHazardClearMove = (mv: string) =>
      ["defog", "rapid spin", "mortal spin", "tidy up", "court change", "despejar", "giro rapido", "giro mortal", "limpieza"].includes(mv);
    if (moves.some(isHazardClearMove)) hasHazardControl = true;

    const isSmogonHazardClearMove = (mv: string) =>
      ["defog", "rapid spin", "mortal spin", "despejar", "giro rapido", "giro mortal"].includes(mv);
    if (moves.some(isSmogonHazardClearMove)) hasSmogonHazardControl = true;

    // Revenge killer check (Choice Scarf or base speed >= 110)
    const isChoiceScarf = itemLower.includes("scarf") || itemLower.includes("pañuelo");
    const baseStats = getSpeciesBaseStats(m.species);
    if (isChoiceScarf || baseStats.Spe >= 110) {
      hasChoiceScarfOrFastUser = true;
    }

    // A. Nivel 1: Assault Vest + Status moves (Ilegalidad binaria)
    if (itemLower === "assault vest" || itemLower === "chaleco asalto") {
      const statusMoves = [
        "protect", "detect", "swords dance", "nasty plot", "will-o-wisp", "will o wisp", "spore", "thunder wave", 
        "defog", "tailwind", "trick room", "substitute", "calm mind", "recover", "roost", "toxic", 
        "stealth rock", "spikes", "sticky web", "helping hand", "follow me", "rage powder", "yawn",
        "taunt", "parting shot", "ultima palabra", "última palabra", "roar", "rugido", "haze", "niebla",
        "encore", "otra vez", "disable", "anulacion", "anulación", "destiny bond", "mismo destino",
        "light screen", "pantalla luz", "pantalla de luz", "reflect", "reflejo", "aurora veil", "velo aurora",
        "safeguard", "velo sagrado", "ally switch", "cambio de banda", "wide guard", "vasta guardia",
        "quick guard", "anticipo", "coaching", "entrenamiento", "heal pulse", "pulso cura", "trick", "truco",
        "switcheroo", "trapicheo", "teleport", "teletransporte", "wish", "deseo", "baton pass", "relevo",
        "healing wish", "deseo cura", "lunar dance", "danza lunar", "sunny day", "dia soleado", "día soleado",
        "rain dance", "danza lluvia", "sandstorm", "tormenta arena", "snowscape", "paisaje nevado",
        "chilly reception", "fria acogida", "fría acogida", "sleep powder", "somnifero", "somnífero",
        "stun spore", "paralizador", "glare", "mirada mala", "whirlwind", "remolino", "toxic spikes", 
        "puas toxicas", "púas tóxicas", "quiver dance", "danza aleteo", "dragon dance", "danza dragon", 
        "danza dragón", "bulk up", "corpulencia", "iron defense", "defensa ferrea", "defensa férrea", 
        "cosmic power", "masa cosmica", "masa cósmica", "double team", "doble equipo", "minimize", 
        "reduccion", "reducción", "spiky shield", "escudo espinoso", "baneful bunker", "barrera nociva", 
        "silk trap", "red de seda", "burning bulwark", "escudo ardiente", "barrera ardiente", 
        "king's shield", "escudo real", "obstruct", "obstruccion", "obstrucción", "spite", "rancor", 
        "despecho", "grudge", "rabia", "curse", "maldicion", "maldición", "painsplit", "divide dolor", "pain split",
        "proteccion", "deteccion", "danza espada", "maquinacion", "fuego fatuo", "espora", "onda trueno",
        "despejar", "viento afin", "espacio raro", "sustituto", "paz mental", "recuperacion", "respiro",
        "toxico", "trampa rocas", "púas", "red viscosa", "refuerzo", "señuelo", "polvo ira", "bostezo"
      ];
      const matchingStatus = moves.filter(mv => statusMoves.includes(mv));
      if (matchingStatus.length > 0) {
        warnings.push(`Advertencia Mecánica (Chaleco Asalto): ${name} lleva Assault Vest equipado, pero tiene movimientos de estado activos: [${matchingStatus.join(", ")}]. No podrás usar estos movimientos en batalla.`);
      }
    }

    // B. Nivel 2: Choice Item + Protect (Choice Lock syndrome)
    if (itemLower.includes("choice") || itemLower.includes("eleccion")) {
      const lockStatusMoves = [
        "protect", "detect", "spiky shield", "baneful bunker", "silk trap", "burning bulwark", 
        "swords dance", "nasty plot", "dragon dance", "quiver dance", "calm mind", "bulk up", 
        "iron defense", "agility", "rock polish", "shell smash", "geomancy",
        "proteccion", "deteccion", "danza espada", "maquinacion", "danza dragon", "danza dragón", 
        "danza aleteo", "paz mental", "corpulencia", "defensa ferrea", "defensa férrea", "agilidad", 
        "pulido", "rompecoraza", "geocontrol", "escudo espinoso", "barrera nociva", "red de seda", 
        "escudo ardiente", "barrera ardiente", "king's shield", "escudo real", "obstruct", 
        "obstruccion", "obstrucción"
      ];
      const matchingLock = moves.filter(mv => lockStatusMoves.includes(mv));
      if (matchingLock.length > 0) {
        warnings.push(`Advertencia Mecánica (Choque de Elección): ${name} lleva un objeto de elección (${m.item}) con movimientos de protección o boost: [${matchingLock.join(", ")}]. Quedarás atrapado en Protect si lo usas.`);
      }
    }

    // STABmons move checks
    if (isSTABmons) {
      moves.forEach((move) => {
        const moveType = MOVES_TYPE_DB[move];
        if (moveType && moveType !== "Normal") {
          // If move element does not match species types
          if (!speciesData.types.includes(moveType)) {
            errors.push(`Ilegalidad de STABmons: ${name} (tipo ${speciesData.types.join("/")}) no puede aprender '${move}' de tipo ${moveType} porque no coincide con su afinidad elemental.`);
          }
        }
      });
    }

    // C. Cómputo de debilidades elementales acumuladas
    elementTypes.forEach((attackType) => {
      const eff = getTypeEffectiveness(attackType, speciesData.types);
      
      let isImmune = eff === 0;
      if (attackType === "Ground" && (abilityLower === "levitate" || abilityLower === "levitacion")) isImmune = true;
      if (attackType === "Electric" && (abilityLower === "volt absorb" || abilityLower === "lightning rod" || abilityLower === "motor drive" || abilityLower === "absorbe electricidad" || abilityLower === "pararrayos")) isImmune = true;
      if (attackType === "Water" && (abilityLower === "water absorb" || abilityLower === "storm drain" || abilityLower === "dry skin" || abilityLower === "absorbe agua" || abilityLower === "colector" || abilityLower === "piel seca")) isImmune = true;
      if (attackType === "Fire" && (abilityLower === "flash fire" || abilityLower === "well-baked body" || abilityLower === "absorbe fuego" || abilityLower === "cuerpo horneado")) isImmune = true;

      if (isImmune) {
        teamWeaknesses[attackType].immuneCount++;
      } else if (eff > 1.0) {
        teamWeaknesses[attackType].count++;
      }
    });

    // Validaciones básicas de Showdown (Movimientos)
    if (moves.length === 0) {
      errors.push(`${name}: Debe aprender al menos 1 movimiento.`);
    } else if (moves.length > 4) {
      errors.push(`${name}: No puede aprender más de 4 movimientos.`);
    }
    const uniqueMoves = new Set(moves);
    if (uniqueMoves.size < moves.length) {
      errors.push(`${name}: Tiene movimientos repetidos en su set.`);
    }

    // Validación de EVs (Bypassed entirely in Hackmons)
    if (!isHackmons) {
      const evHP = m.evs?.HP || 0;
      const evAtk = m.evs?.Atk || 0;
      const evDef = m.evs?.Def || 0;
      const evSpA = m.evs?.SpA || 0;
      const evSpD = m.evs?.SpD || 0;
      const evSpe = m.evs?.Spe || 0;
      const totalEVs = evHP + evAtk + evDef + evSpA + evSpD + evSpe;

      if (totalEVs > 510) {
        errors.push(`${name}: La suma de sus EVs (${totalEVs}) excede el límite permitido de 510.`);
      }
      if (evHP > 252 || evAtk > 252 || evDef > 252 || evSpA > 252 || evSpD > 252 || evSpe > 252) {
        errors.push(`${name}: Ninguna estadística individual puede superar los 252 EVs.`);
      }
      if (totalEVs < 508 && totalEVs > 0) {
        suggestions.push(`${name}: Tiene repartidos ${totalEVs} EVs, lo cual está por debajo del óptimo de 508/510.`);
      }
    }
  });

  if (restrictedCount > maxRestricted) {
    errors.push(`Exceso de Legendarios Restringidos: Tu equipo tiene ${restrictedCount} Legendarios Restringidos, pero el formato ${format.toUpperCase()} sólo permite un máximo de ${maxRestricted}.`);
  }

  // D. Nivel 2: Climas Cruzados (Guerra Civil del Clima)
  const uniqueWeathers = Array.from(new Set(weathers));
  if (uniqueWeathers.length > 1 && isDoubles && !isAnythingGoes) {
    warnings.push(`Guerra Civil de Climas: Tu equipo cuenta con activadores para ${uniqueWeathers.join(" y ")} al mismo tiempo. Se pisarán la manguera elementales entre sí durante el combate.`);
  }

  // E. Nivel 2: Terreno Psíquico bloqueando prioridad propia
  const hasPsychicTerrain = terrains.includes("Psychic");
  if (hasPsychicTerrain && !isAnythingGoes) {
    members.forEach((m) => {
      const moves = m.moves.map(mv => mv.toLowerCase().trim());
      if (moves.includes("fake out") || moves.includes("sorpresa")) {
        warnings.push(`Advertencia de Terreno: ${m.species} lleva 'Fake Out' (Sorpresa), pero tu equipo activa Terreno Psíquico. Bajo Terreno Psíquico, los movimientos con prioridad fallan automáticamente contra objetivos en el suelo.`);
      }
    });
  }

  // F. Nivel 2: Ubers weather control warning
  if (fmt.includes("ubers") && uniqueWeathers.length === 0 && terrains.length === 0) {
    warnings.push("Validación de Clima Ubers: 🟡 WARNING agresivo. El meta gira fuertemente en torno a Koraidon (Sol), Kyogre (Lluvia) y Miraidon (Terreno Eléctrico). Tu equipo carece de clima o terreno propio; Hexacore te advierte que debes asegurar un clima propio o una respuesta contundente.");
  }

  // G. Nivel 3: Stacking de debilidades elementales
  elementTypes.forEach((type) => {
    const data = teamWeaknesses[type];
    if (data.count >= 3 && data.immuneCount === 0) {
      suggestions.push(`Stacking de Debilidades: Tienes ${data.count} Pokémon débiles al tipo ${type} y ninguna inmunidad activa para absorberlo. Un atacante ofensivo de tipo ${type} barrerá tu equipo con facilidad.`);
    }
  });

  // H. Nivel 3: Speed Control & Protect Clause (VGC vs. Singles)
  if (isDoubles) {
    if (!hasSpeedControl && !isAnythingGoes) {
      errors.push("Deficiencia Crítica (Control de Velocidad): En formatos de Dobles/VGC, carecer de Tailwind, Trick Room, Icy Wind o Electroweb te dejará a merced del posicionamiento rápido del rival.");
    }
    if (protectCount < 3 && !isAnythingGoes) {
      warnings.push(`Deficiencia de Protección (VGC): Tu equipo lleva solo ${protectCount} movimientos de Protect/Detect. En VGC, se recomienda al menos 3 Pokémon con Protect para mitigar turnos ofensivos.`);
    }
  } else if (isSmogonClassicalSingles) {
    // Hazards control requirement in standard 6v6 Singles
    if (!hasSmogonHazardControl && !isAnythingGoes) {
      errors.push("Deficiencia Crítica (Trampas/Spikes): En formato Singles 6v6 standard (OU/UU/RU/NU/PU), es absolutamente obligatorio contar con un limpiador de Hazards (Defog, Rapid Spin o Mortal Spin) para no debilitar tu equipo al entrar al campo.");
    }
    // Speed control / revenge killer check
    if (!hasChoiceScarfOrFastUser && !isAnythingGoes) {
      warnings.push("Deficiencia de Speed Control (Singles): 🟡 WARNING. Tu equipo no cuenta con un revenge killer rápido natural (Velocidad Base >= 110) ni un usuario de Choice Scarf. En formatos singles clásicos se necesita control de velocidad para revenge kill.");
    }
  }

  // Extracción de debilidades e inmunidades para el Resumen Técnico
  const weaknesses: string[] = [];
  const immunities: string[] = [];
  elementTypes.forEach((type) => {
    const data = teamWeaknesses[type];
    if (data) {
      if (data.count >= 2) weaknesses.push(type);
      if (data.immuneCount > 0) immunities.push(type);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    stats: {
      weathers: Array.from(new Set(weathers)),
      terrains: Array.from(new Set(terrains)),
      hasSpeedControl,
      hasHazardControl,
      protectCount,
      immunities,
      weaknesses,
    }
  };

}
