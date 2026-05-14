import { getAbilityByName } from "@/app/actions/encyclopedia";
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
    return { nombre: c.nombre, tipos: attrs?.tipos || [] };
  });
}

export default async function AbilityDetail({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const ability = await getAbilityByName(decodeURIComponent(name));
  if (!ability) notFound();

  const pokemonList = await getPokemonWithAbility(ability.nombre);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fade-in">
      <Link href="/pokedex/abilities" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-4 inline-block transition-colors">
        ← <T es="Volver a habilidades" en="Back to abilities" />
      </Link>

      <div className="glass-card p-6 md:p-8 mb-5">
        <h1 className="text-3xl font-bold text-white mb-4">{ability.nombre}</h1>
        <div>
          <h2 className="text-sm font-semibold text-white mb-2"><T es="Descripción" en="Description" /></h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-2)]/30 p-4 rounded-xl border border-[var(--border)]">
            {ability.descripcion}
          </p>
        </div>
      </div>

      {/* Pokémon with this ability */}
      {pokemonList.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-white mb-4">
            <T es="Pokémon con esta Habilidad" en="Pokémon with this Ability" />
            <span className="text-[var(--text-muted)] font-normal ml-2">({pokemonList.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {pokemonList.map(p => (
              <Link key={p.nombre} href={`/pokedex/pokemon/${encodeURIComponent(p.nombre)}`}
                className="flex items-center gap-2.5 p-2 bg-[var(--surface-2)]/40 border border-[var(--border)] rounded-xl hover:bg-[var(--surface-3)] hover:border-[var(--border-active)] transition-all group">
                <SpriteImg species={p.nombre} width={40} height={40}
                  className="group-hover:scale-110 transition-transform shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{p.nombre}</p>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap">
                    {p.tipos.map((t: string) => <TypeBadge key={t} type={t} size="sm" />)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
