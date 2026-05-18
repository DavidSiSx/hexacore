import { z } from "zod";

export const PokemonSlotSchema = z.object({
  species: z.string(),
  item: z.string().optional(),
  ability: z.string().optional(),
  teraType: z.string().optional(),
  nature: z.string().optional(),
  evs: z.record(z.string(), z.number()).optional(),
  ivs: z.record(z.string(), z.number()).optional(),
  moves: z.array(z.string()).max(4),
  level: z.number().min(1).max(100).default(50),
});

export const TeamSchema = z.object({
  name: z.string().min(1).max(50),
  format: z.string().default("gen9vgc2025regb"),
  pokemon: z.array(PokemonSlotSchema).max(6),
  public: z.boolean().default(true),
});

export type PokemonSlot = z.infer<typeof PokemonSlotSchema>;
export type Team = z.infer<typeof TeamSchema>;

export const PokemonBuildSchema = z.object({
  species: z.string(),
  item: z.string(),
  ability: z.string(),
  nature: z.string(),
  evs: z.record(z.string(), z.number().optional()).optional().default({}),
  ivs: z.record(z.string(), z.number().optional()).optional().default({}),
  moves: z.array(z.string()).max(4),
  teraType: z.string(),
  role: z.string(),
  synergyScore: z.number().optional(),
  synergyReason: z.string().optional(),
});

export const AITeamSchema = z.object({
  teamName: z.string(),
  format: z.string(),
  strategy: z.string(),
  members: z.array(PokemonBuildSchema),
  modelUsed: z.string().optional(),
});

export type PokemonBuild = z.infer<typeof PokemonBuildSchema>;
export type AITeam = z.infer<typeof AITeamSchema>;

export const TeamGenerationOptionsSchema = z.object({
  forcePokemon: z.array(z.string()).optional(),
  banPokemon: z.array(z.string()).optional(),
  monotype: z.string().optional(),
  bannedMoves: z.array(z.string()).optional(),
  format: z.string().optional(),
  archetype: z.string().optional(),
  blacklistTypes: z.array(z.string()).optional(),
});

export type TeamGenerationOptions = z.infer<typeof TeamGenerationOptionsSchema>;

