import { PokemonFilters } from "@/app/actions/pokedex";

export interface FilterProps {
  lang: string;
  dictionary: Record<string, any>;
  filters: PokemonFilters;
  setFilters: (fn: (prev: PokemonFilters) => PokemonFilters) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  sortBy?: string;
  setSortBy?: (s: string) => void;
  sortOrder?: "asc" | "desc";
  setSortOrder?: (o: "asc" | "desc") => void;
  mode?: "normal" | "advanced";
}
