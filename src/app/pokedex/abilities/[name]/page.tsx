import { getAbilityByName } from "@/app/actions/encyclopedia";
import { prisma } from "@/lib/db";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getPokemonWithAbility(abilityName: string) {
  // Search all Criaturas whose atributos_de_combate.habilidades array contains this ability
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
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <Link href="/pokedex/abilities" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-4 inline-block">
        ← Back / Volver a habilidades
      </Link>
      <div className="glass-card p-6 md:p-8 mb-4">
        <h1 className="text-3xl font-bold text-white mb-4">{ability.nombre}</h1>
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-2">Description / Descripción</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{ability.descripcion}</p>
        </div>
      </div>

      {/* Pokémon with this ability */}
      {pokemonList.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">
            Pokémon with this Ability / Pokémon con esta Habilidad
            <span className="text-[var(--text-muted)] font-normal ml-2">({pokemonList.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 stagger-children">
            {pokemonList.map(p => (
              <Link key={p.nombre} href={`/pokedex/pokemon/${encodeURIComponent(p.nombre)}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <SpriteImg species={p.nombre} width={32} height={32}
                  className="group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{p.nombre}</p>
                  <div className="flex gap-0.5">
                    {p.tipos.map((t: string) => <TypeBadge key={t} type={t} />)}
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
