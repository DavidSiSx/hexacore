import { getAbilityBySlug } from "@/app/actions/encyclopedia";
import { prisma } from "@/lib/db";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { T } from "@/lib/lang";

async function getPokemonWithAbility(abilityName: string) {
  const criaturas = await prisma.criatura.findMany({
    where: {
      es_fakemon: false,
      atributos_de_combate: { path: ["habilidades"], array_contains: abilityName },
    },
    orderBy: { nombre: "asc" },
    take: 100,
  });
  return criaturas.map(c => {
    const attrs = c.atributos_de_combate as any;
    return { nombre: c.nombre, slug: c.slug, tipos: attrs?.tipos || [] };
  });
}

export default async function AbilityDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const ability = await getAbilityBySlug(slug);
  if (!ability) notFound();

  const isEs = lang === "es";
  const pokemonList = await getPokemonWithAbility(ability.nombre);
  const displayName = isEs && ability.nombres?.es ? ability.nombres.es : ability.nombre;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full animate-fade-in flex flex-col gap-8">
      <Link href={`/${lang}/pokedex/abilities`} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent)] inline-flex items-center transition-colors">
        ← <T es="VOLVER" en="BACK" />
      </Link>

      <div className="bg-[var(--background)] border-4 border-[var(--border)] p-8 flex flex-col gap-8">
        <div className="border-b-4 border-current pb-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--foreground)]">{displayName}</h1>
        </div>

        <div className="bg-[var(--accent)] p-6 border-4 border-[var(--accent)]">
          <h2 className="text-[var(--accent-foreground)] font-black uppercase tracking-widest text-xs mb-2">
            <T es="EFECTO" en="EFFECT" />
          </h2>
          <p className="text-[var(--accent-foreground)] font-bold uppercase leading-tight md:text-lg">
            "{((ability.descripciones as any)?.[lang] || (ability.descripciones as any)?.en || "No description available.")}"
          </p>
        </div>

        {/* Pokémon with this ability */}
        {pokemonList.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">
              <T es="Pokémon con esta Habilidad" en="Pokémon with this Ability" />
              <span className="opacity-40 ml-2">({pokemonList.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pokemonList.map(p => (
                <Link 
                  key={p.nombre} 
                  href={`/${lang}/pokedex/pokemon/${p.slug}`}
                  className="flex flex-col items-center gap-2 p-3 bg-black/5 border-2 border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)] transition-all group"
                >
                  <SpriteImg species={p.nombre} width={64} height={64}
                    className="group-hover:scale-110 transition-transform rendering-pixelated" />
                  <div className="text-center w-full">
                    <p className="text-[10px] font-black uppercase truncate">{p.nombre}</p>
                    <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                      {p.tipos.map((t: string) => <TypeBadge key={t} type={t} size="sm" />)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
