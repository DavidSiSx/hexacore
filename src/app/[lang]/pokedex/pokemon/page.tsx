import { getDictionary } from "@/lib/dictionaries";
import { getAllPokemon } from "@/app/actions/pokedex";
import PokemonGridClient from "./client";

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ lang: "en" | "es" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  // Pre-fetch inicial para SSR (Cero fricción)
  const initialData = await getAllPokemon(1, 48, { lang });

  return <PokemonGridClient lang={lang} dict={dict} initialData={initialData} />;
}
