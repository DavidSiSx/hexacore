import { z } from 'zod';

export const PokemonBuildSchema = z.object({
  species: z.string().describe("Nombre exacto del Pokémon (ej. Charizard, Ogerpon-Hearthflame)"),
  item: z.string().describe("Objeto equipado competitivo (ej. Choice Specs, Focus Sash)"),
  ability: z.string().describe("Habilidad competitiva ideal"),
  nature: z.string().describe("Naturaleza (ej. Timid, Jolly, Modest)"),
  evs: z.object({
    HP: z.number().optional(),
    Atk: z.number().optional(),
    Def: z.number().optional(),
    SpA: z.number().optional(),
    SpD: z.number().optional(),
    Spe: z.number().optional(),
  }).describe("Distribución de EVs (máximo 508 en total)."),
  ivs: z.object({
    HP: z.number().optional(),
    Atk: z.number().optional(),
    Def: z.number().optional(),
    SpA: z.number().optional(),
    SpD: z.number().optional(),
    Spe: z.number().optional(),
  }).optional().describe("Distribución de IVs. Se asume 31 en todo si se omite, útil para Trick Room (Spe: 0)."),
  moves: z.array(z.string()).length(4).describe("Exactamente 4 movimientos legales y competitivos"),
  teraType: z.string().describe("Tipo Teracristal ideal"),
  role: z.string().describe("Breve explicación de su rol en el equipo (ej. Sweeper, Tailwind setter, Wallbreaker)")
});

export const TeamSchema = z.object({
  teamName: z.string().describe("Un nombre llamativo para el equipo"),
  format: z.string().describe("Formato para el que fue diseñado (ej. VGC Series 2, OU)"),
  strategy: z.string().describe("Explicación general de la sinergia y cómo se juega el equipo"),
  members: z.array(PokemonBuildSchema).length(6).describe("Los 6 integrantes del equipo")
});

export type PokemonBuild = z.infer<typeof PokemonBuildSchema>;
export type Team = z.infer<typeof TeamSchema>;
