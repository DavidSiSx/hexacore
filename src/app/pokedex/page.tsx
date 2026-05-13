import Link from "next/link";
import { prisma } from "@/lib/db";

async function getCounts() {
  const [pokemon, moves, abilities, fakemons] = await Promise.all([
    prisma.criatura.count({ where: { es_fakemon: false } }),
    prisma.movimiento.count(),
    prisma.habilidad.count(),
    prisma.criatura.count({ where: { es_fakemon: true } }),
  ]);
  return { pokemon, moves, abilities, fakemons };
}

const SECTIONS = [
  { href: "/pokedex/pokemon", icon: "🔴", label: "Pokémon", color: "from-red-500/20 to-red-900/10", border: "hover:border-red-500/40" },
  { href: "/pokedex/moves", icon: "⚔️", label: "Movimientos", color: "from-blue-500/20 to-blue-900/10", border: "hover:border-blue-500/40" },
  { href: "/pokedex/abilities", icon: "✨", label: "Habilidades", color: "from-purple-500/20 to-purple-900/10", border: "hover:border-purple-500/40" },
  { href: "/pokedex/types", icon: "🔥", label: "Tipos", color: "from-orange-500/20 to-orange-900/10", border: "hover:border-orange-500/40" },
  { href: "/pokedex/fakemons", icon: "🎨", label: "Fakemons", color: "from-green-500/20 to-green-900/10", border: "hover:border-green-500/40" },
  { href: "/pokedex/calc", icon: "🧮", label: "Calculadora", color: "from-cyan-500/20 to-cyan-900/10", border: "hover:border-cyan-500/40" },
];

export default async function PokedexHub() {
  const counts = await getCounts();
  const countMap: Record<string, string> = {
    "Pokémon": `${counts.pokemon.toLocaleString()} especies`,
    "Movimientos": `${counts.moves.toLocaleString()} movimientos`,
    "Habilidades": `${counts.abilities.toLocaleString()} habilidades`,
    "Tipos": "18 tipos + chart",
    "Fakemons": `${counts.fakemons} creaciones`,
    "Calculadora": "Daño Gen 9",
  };

  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-5xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-2">
        <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
          Enciclopedia
        </span>
      </h1>
      <p className="text-[var(--text-muted)] text-sm mb-10">
        Tu referencia competitiva completa. Busca, filtra y aprende.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full stagger-children">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`glass-card p-6 flex flex-col gap-3 group transition-all ${s.border}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl
                            group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors">
                {s.label}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">{countMap[s.label]}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
