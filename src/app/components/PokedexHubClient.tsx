"use client";

import Link from "next/link";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Database, Swords, Sparkles, Briefcase, Flame, Palette, Calculator } from "lucide-react";

interface PokedexHubClientProps {
  lang: string;
  counts: {
    pokemon: number;
    moves: number;
    abilities: number;
    items: number;
    fakemons: number;
  };
}

export function PokedexHubClient({ lang, counts }: PokedexHubClientProps) {
  const { activeTheme: globalTheme } = useTheme();

  // Mapeamos las clases para mantener consistencia con los nombres de tokens visuales
  const activeTheme = {
    bg: "bg-transparent",
    cardBg: globalTheme.cardBgClass || "bg-black/40",
    border: globalTheme.borderClass,
    accent: globalTheme.accentClass,
    textMain: globalTheme.textMainClass,
    textMuted: globalTheme.textMutedClass,
    badgeBg: globalTheme.badgeBgClass,
    name: globalTheme.name,
  };

  const CARDS = [
    {
      href: `/${lang}/pokedex/pokemon`,
      titleEs: "POKÉMON",
      titleEn: "POKÉMON",
      descEs: "Catálogo completo con aserciones Gmax, Megas y formas regionales.",
      descEn: "Complete catalog with Gmax, Megas, and regional forms.",
      count: counts.pokemon,
      label: "ESPECIES",
      icon: <Database className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/moves`,
      titleEs: "MOVIMIENTOS",
      titleEn: "MOVES",
      descEs: "Prioridades, potencias base, precisiones y metadatos de banderas.",
      descEn: "Priorities, base powers, accuracies, and flag metadata.",
      count: counts.moves,
      label: "ATAQUES",
      icon: <Swords className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/abilities`,
      titleEs: "HABILIDADES",
      titleEn: "ABILITIES",
      descEs: "Efectos mecánicos puros y descripciones bilingües integradas.",
      descEn: "Pure mechanical effects and integrated bilingual entries.",
      count: counts.abilities,
      label: "PASIVAS",
      icon: <Sparkles className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/items`,
      titleEs: "OBJETOS",
      titleEn: "ITEMS",
      descEs: "Equipamiento estratégico competitivo y bayas con sus modificadores.",
      descEn: "Competitive strategic equipment and berries with modifiers.",
      count: counts.items,
      label: "ARTEFACTOS",
      icon: <Briefcase className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/types`,
      titleEs: "TABLA TIPOS",
      titleEn: "TYPE CHART",
      descEs: "Matriz inmutable de efectividades y multiplicadores defensivos.",
      descEn: "Immutable effectiveness matrix and defensive multipliers.",
      count: 18,
      label: "ELEMENTOS",
      icon: <Flame className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/fakemons`,
      titleEs: "FAKEMONS / CAP",
      titleEn: "FAKEMONS / CAP",
      descEs: "Criaturas experimentales de la comunidad Create-A-Pokémon.",
      descEn: "Experimental community Create-A-Pokémon creatures.",
      count: counts.fakemons,
      label: "PROYECTOS",
      icon: <Palette className="w-8 h-8 stroke-[2.5]" />,
    },
    {
      href: `/${lang}/pokedex/calc`,
      titleEs: "CALCULADORA",
      titleEn: "CALCULATOR",
      descEs: "Motor de predicción de daño Showdown para la Generación 9.",
      descEn: "Showdown damage prediction engine for Generation 9.",
      count: 9,
      label: "GENERACIÓN",
      icon: <Calculator className="w-8 h-8 stroke-[2.5]" />,
    },
  ];

  return (
    <div className={`min-h-full w-full transition-colors duration-500 p-6 md:p-12 flex flex-col items-center`}>
      <div className="w-full max-w-7xl flex flex-col gap-12">
        
        {/* Top Header without local Theme Switcher */}
        <div className="flex flex-col justify-between items-start gap-4 border-b-4 border-zinc-800 pb-8 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-black px-2 py-1 uppercase tracking-widest border border-current ${activeTheme.badgeBg}`}>
                {activeTheme.name}
              </span>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                HEXACORE HUB v2.0
              </span>
            </div>
            <h1 className={`text-5xl md:text-8xl font-black uppercase tracking-tighter ${activeTheme.textMain}`}>
              INICIO <span className={activeTheme.accent}>/</span> DEX
            </h1>
            <p className={`text-xs md:text-base font-bold uppercase tracking-widest mt-2 ${activeTheme.textMuted}`}>
              {lang === "es" 
                ? "Navegación cinemática multitema de la inteligencia competitiva." 
                : "Multi-theme cinematic navigation of competitive intelligence."}
            </p>
          </div>
        </div>

        {/* Hero Feature Box (WOW-inducing Banner) */}
        <div className={`relative overflow-hidden border-4 ${activeTheme.border} ${activeTheme.cardBg} p-8 md:p-12 transition-colors duration-500`}>
          {/* Decorative Mesh Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${activeTheme.border} ${activeTheme.accent} mb-4 inline-block`}>
                {lang === "es" ? "ESTADO DE LA BÓVEDA" : "VAULT STATUS"}
              </span>
              <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 ${activeTheme.textMain}`}>
                {counts.pokemon.toLocaleString()} {lang === "es" ? "POKÉMON VECTORIZADOS" : "VECTORIZED POKÉMON"}
              </h2>
              <p className={`text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed ${activeTheme.textMuted}`}>
                {lang === "es"
                  ? "El motor RAG ha completado la ingesta exhaustiva. Las formas base conviven armónicamente con sus aserciones evolutivas Gigamax y distribuciones estadísticas de Smogon."
                  : "The RAG engine has completed full ingestion. Base forms live seamlessly alongside Gigantamax evolutionary assertions and Smogon usage stats."}
              </p>
            </div>

            {/* Total Metric Badge */}
            <div className={`flex flex-col items-center justify-center p-6 border-4 ${activeTheme.border} bg-black/60 shrink-0 min-w-[180px]`}>
              <span className="text-5xl font-black text-white">{counts.moves + counts.abilities}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activeTheme.accent}`}>
                {lang === "es" ? "MECÁNICAS TOTALES" : "TOTAL MECHANICS"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {CARDS.map((card, idx) => {
            const isFeatured = idx === 0;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative flex flex-col justify-between border-4 ${activeTheme.border} ${activeTheme.cardBg} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:translate-x-1 ${
                  isFeatured ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Top Row: Label & Count */}
                <div className="flex justify-between items-start gap-4 mb-8">
                  <span className={`text-3xl group-hover:scale-125 transition-transform duration-300`}>
                    {card.icon}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black leading-none ${activeTheme.textMain}`}>
                      {card.count.toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMuted}`}>
                      {card.label}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Title & Description */}
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tighter mb-2 group-hover:${activeTheme.accent} transition-colors ${activeTheme.textMain}`}>
                    {lang === "es" ? card.titleEs : card.titleEn}
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-wider leading-relaxed line-clamp-2 ${activeTheme.textMuted}`}>
                    {lang === "es" ? card.descEs : card.descEn}
                  </p>
                </div>

                {/* Corner Hover Arrow Accent */}
                <div className={`absolute bottom-2 right-2 text-lg opacity-0 group-hover:opacity-100 transition-opacity ${activeTheme.accent} font-black`}>
                  ↗
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
