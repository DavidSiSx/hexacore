import Link from "next/link";
import { prisma } from "@/lib/db";

async function getCounts() {
  const [pokemon, moves, abilities, items, fakemons] = await Promise.all([
    prisma.criatura.count({ where: { es_fakemon: false } }),
    prisma.movimiento.count(),
    prisma.habilidad.count(),
    prisma.objeto.count(),
    prisma.criatura.count({ where: { es_fakemon: true } }),
  ]);
  return { pokemon, moves, abilities, items, fakemons };
}

const CARDS = [
  { href: "/pokedex/pokemon",   icon: "🔴", es: "Pokémon",      en: "Pokémon",    color: "from-red-500/20 to-red-900/10",    border: "hover:border-red-500/40" },
  { href: "/pokedex/moves",     icon: "⚔️", es: "Movimientos",   en: "Moves",      color: "from-blue-500/20 to-blue-900/10",  border: "hover:border-blue-500/40" },
  { href: "/pokedex/abilities", icon: "✨", es: "Habilidades",   en: "Abilities",  color: "from-purple-500/20 to-purple-900/10", border: "hover:border-purple-500/40" },
  { href: "/pokedex/items",     icon: "🎒", es: "Objetos",       en: "Items",      color: "from-amber-500/20 to-amber-900/10", border: "hover:border-amber-500/40" },
  { href: "/pokedex/types",     icon: "🔥", es: "Tabla Tipos",   en: "Type Chart", color: "from-orange-500/20 to-orange-900/10", border: "hover:border-orange-500/40" },
  { href: "/pokedex/fakemons",  icon: "🎨", es: "Fakemons",      en: "Fakemons",   color: "from-green-500/20 to-green-900/10", border: "hover:border-green-500/40" },
  { href: "/pokedex/calc",      icon: "🧮", es: "Calculadora",   en: "Calculator", color: "from-cyan-500/20 to-cyan-900/10",   border: "hover:border-cyan-500/40" },
];

export default async function PokedexHub() {
  const counts = await getCounts();
  const countMap: Record<string, string> = {
    "Pokémon":      `${counts.pokemon.toLocaleString()} species`,
    "Movimientos":  `${counts.moves.toLocaleString()} moves`,
    "Habilidades":  `${counts.abilities.toLocaleString()} abilities`,
    "Objetos":      `${counts.items.toLocaleString()} items`,
    "Tabla Tipos":  "18 types + chart",
    "Fakemons":     `${counts.fakemons} CAPs`,
    "Calculadora":  "Gen 9 Damage",
  };

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full animate-fade-in">
      <h1 className="text-3xl font-bold mb-1">
        <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
          Enciclopedia Competitiva
        </span>
      </h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Tu referencia competitiva completa. — Your complete competitive reference.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {CARDS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`glass-card p-5 flex items-center gap-4 group transition-all ${s.border}`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl
                            group-hover:scale-110 transition-transform shrink-0`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors">
                {s.es}
              </h2>
              <p className="text-xs text-[var(--text-muted)] truncate">{countMap[s.es]}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
