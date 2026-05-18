"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { Sparkles, Compass, ShieldAlert, Cpu, ArrowRight, Zap, Terminal as TermIcon } from "lucide-react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

export default function LandingPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { activeTheme } = useTheme();
  
  const isEs = lang === "es";

  const features = [
    {
      num: "01",
      title: isEs ? "CONSTRUCTOR DE IA" : "AI TEAM BUILDER",
      desc: isEs 
        ? "Consulta información semántica en tiempo real y genera sinergias competitivas impecables gracias a Gemini 2.5."
        : "Query semantic data in real-time and generate perfect competitive synergies using Gemini 2.5.",
      icon: Cpu,
    },
    {
      num: "02",
      title: isEs ? "ENCICLOPEDIA VGC" : "VGC POKEDEX",
      desc: isEs
        ? "Estadísticas de uso oficial de Smogon, habilidades, objetos y movimientos con traducción bilingüe completa."
        : "Official Smogon usage stats, abilities, items, and moves with complete bilingual support.",
      icon: Compass,
    },
    {
      num: "03",
      title: isEs ? "CALCULADORA DAÑO" : "DAMAGE CALCULATOR",
      desc: isEs
        ? "El motor de cálculo de Showdown integrado con diseño brutalista de alto contraste y precisión absoluta."
        : "The Showdown calculation engine integrated with high-contrast brutalist design and absolute precision.",
      icon: ShieldAlert,
    },
    {
      num: "04",
      title: isEs ? "TABLA DE TIPOS" : "TYPE CALCULATOR",
      desc: isEs
        ? "Evalúa fortalezas y debilidades elementales de tu equipo completo de forma instantánea."
        : "Instantly evaluate elemental strengths and weaknesses of your entire team in seconds.",
      icon: Zap,
    },
  ];

  const pokemonList = [
    "dragapult", "charizard", "gengar", "pikachu", "lucario", "mewtwo", 
    "rayquaza", "zacian", "fluttermane", "ogerpon", "urshifu-rapidstrike", "incineroar"
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* 1. Ticker / Marquee Superior */}
      <div className={`w-full border-b-4 ${activeTheme.borderClass} bg-[var(--muted)] py-3 overflow-hidden select-none`}>
        <Marquee speed={65} gradient={false} play={true}>
          {pokemonList.map((pkmn, idx) => (
            <div key={idx} className="flex items-center gap-4 mx-12">
              <img 
                src={`https://play.pokemonshowdown.com/sprites/ani/${pkmn}.gif`}
                alt={pkmn}
                onError={(e) => {
                  // Fallback sprite si el gif animado no se encuentra
                  (e.target as HTMLImageElement).src = `https://play.pokemonshowdown.com/sprites/dex/${pkmn}.png`;
                }}
                className="h-10 w-auto object-contain [image-rendering:pixelated]"
              />
              <span className={`text-xs font-black uppercase tracking-widest ${activeTheme.accentClass}`}>
                {pkmn.replace("-", " ")}
              </span>
              <span className="text-zinc-600 font-bold">//</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* 2. Hero Section */}
      <section className="relative w-full py-20 px-6 flex flex-col items-center justify-center text-center border-b-4 border-dashed border-zinc-800">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(var(--foreground)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className={`border-2 ${activeTheme.borderClass} ${activeTheme.badgeBgClass} text-[9px] font-black uppercase tracking-widest px-3 py-1`}>
            VGC GEN 9 READY
          </span>
          <span className={`border-2 ${activeTheme.borderClass} bg-black text-[9px] font-black uppercase tracking-widest text-[var(--accent)] px-3 py-1 flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5" /> GEMINI 2.5 PRO
          </span>
          <span className={`border-2 ${activeTheme.borderClass} bg-black text-[9px] font-black uppercase tracking-widest text-zinc-400 px-3 py-1`}>
            BETA V1.2
          </span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--accent)]">
            HEXACORE
          </span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg font-bold uppercase tracking-wider text-[var(--text-muted)] leading-relaxed mb-12">
          {isEs 
            ? "El centro de mando definitivo para el metajuego de Pokémon. Construye equipos competitivos con inteligencia artificial, consulta dinámicas de uso y domina a tus rivales."
            : "The ultimate command center for the competitive Pokémon metagame. Build champion teams with strategic AI, analyze usage trends, and dominate your opponents."}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center relative z-10">
          <Link
            href={`/${lang}/builder`}
            className={`flex-1 text-center bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--accent)]
                       font-black uppercase tracking-widest text-xs py-4 px-6 hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]
                       active:scale-95 transition-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isEs ? "CONSTRUIR CON IA" : "BUILD WITH AI"}
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </Link>
          <Link
            href={`/${lang}/pokedex`}
            className={`flex-1 text-center border-4 ${activeTheme.borderClass} text-[var(--foreground)] bg-black
                       font-black uppercase tracking-widest text-xs py-4 px-6 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                       active:scale-95 transition-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isEs ? "ENCICLOPEDIA" : "POKEDEX"}
          </Link>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="w-full max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            {isEs ? "SISTEMA INTEGRAL COMPETITIVO" : "INTEGRATED COMPETITIVE SYSTEM"}
          </h2>
          <div className={`w-32 h-1.5 mx-auto bg-[var(--accent)] border-2 ${activeTheme.borderClass}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass || "bg-zinc-950"} p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all`}
              >
                <div className={`text-4xl font-black ${activeTheme.accentClass} opacity-20 group-hover:opacity-100 transition-opacity mb-4`}>
                  {feat.num}
                </div>
                <div className={`w-12 h-12 border-4 ${activeTheme.borderClass} flex items-center justify-center bg-[var(--background)] mb-6`}>
                  <Icon className={`w-6 h-6 ${activeTheme.accentClass}`} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-3">
                  {feat.title}
                </h3>
                <p className={`${activeTheme.textMutedClass || "text-zinc-400"} text-xs font-bold leading-relaxed`}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Terminal Interactive Teaser Section */}
      <section className="w-full max-w-5xl mx-auto pb-24 px-6">
        <div className={`border-4 ${activeTheme.borderClass} bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
          {/* Top Title Bar */}
          <div className={`border-b-4 ${activeTheme.borderClass} bg-zinc-900 px-6 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <TermIcon className={`w-4 h-4 ${activeTheme.accentClass}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {isEs ? "Consola IA — Hexacore" : "AI Terminal — Hexacore"}
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
            </div>
          </div>

          {/* Console Content */}
          <div className="p-8 font-mono text-xs md:text-sm text-zinc-300 flex flex-col gap-4 bg-zinc-950">
            <div>
              <span className={`text-[var(--accent)] font-bold`}>guest@hexacore:~#</span>{" "}
              <span>/generar --nucleo dragapult --formato vgc2024</span>
            </div>
            <div className="text-zinc-500">
              {isEs 
                ? "[INFO] Consultando base de datos semántica..." 
                : "[INFO] Querying semantic competitive knowledge base..."}
            </div>
            <div className="text-zinc-500">
              {isEs 
                ? "[INFO] Sinergias encontradas. Alimentando a Gemini 2.5 Pro..." 
                : "[INFO] Symmetries found. Feeding Gemini 2.5 Pro..."}
            </div>
            <div className="text-[var(--accent)] font-bold pl-4">
              {isEs ? ">> Equipo sugerido compilado exitosamente!" : ">> Suggested team compiled successfully!"}
            </div>
            
            {/* Visual Team Mock */}
            <div className={`mt-2 border-2 border-dashed ${activeTheme.borderClass} bg-black/40 p-4 rounded-none flex flex-col gap-2`}>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">[1]</span>
                <span className="text-white font-black">Dragapult</span>
                <span className="text-zinc-500">@ Choice Band | Tera Fire</span>
              </div>
              <div className="text-zinc-400 pl-6 text-xs">
                - Dragon Arrow / Phantom Force / U-turn / Tera Blast
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">[2]</span>
                <span className="text-white font-black">Incineroar</span>
                <span className="text-zinc-500">@ Safety Goggles | Tera Ghost</span>
              </div>
              <div className="text-zinc-400 pl-6 text-xs">
                - Flare Blitz / Knock Off / Parting Shot / Fake Out
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer Brutalista */}
      <footer className={`w-full text-center py-10 border-t-4 ${activeTheme.borderClass} bg-[var(--muted)]`}>
        <p className="text-[var(--foreground)] text-xs font-black uppercase tracking-widest mb-3">
          Hexacore — AI-Powered Competitive Pokemon Team Builder
        </p>
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest max-w-xl mx-auto leading-relaxed px-4">
          Pokemon is a trademark of Nintendo / Game Freak. Strategy data by Smogon University.
        </p>
      </footer>
    </div>
  );
}
