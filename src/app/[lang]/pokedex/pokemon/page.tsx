import { getDictionary } from "@/lib/dictionaries";
import PokemonGridClient from "./client";

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ lang: "en" | "es" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <PokemonGridClient lang={lang} dict={dict} />;
}
