"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Swords, Zap, Activity, Users, Target, X } from "lucide-react";
import { getMetagameStats, SmogonUsageStat, MetagameData } from "@/app/actions/metagame";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

interface MetagameDashboardProps {
  lang: string;
  initialData: MetagameData;
}

const FORMATS = [
  { id: "gen9ou", name: "Gen 9 OU", color: "bg-blue-500" },
  { id: "gen9uu", name: "Gen 9 UU", color: "bg-green-500" },
  { id: "gen9ubers", name: "Gen 9 Ubers", color: "bg-purple-500" },
  { id: "gen9vgc2025regg", name: "VGC 2025", color: "bg-orange-500" },
  { id: "gen9nationaldex", name: "NatDex OU", color: "bg-red-500" },
  { id: "gen9nationaldexubers", name: "NatDex Ubers", color: "bg-pink-500" },
  { id: "gen9nationaldexuu", name: "NatDex UU", color: "bg-teal-500" },
  { id: "gen9nationaldexru", name: "NatDex RU", color: "bg-indigo-500" },
  { id: "gen9nationaldexmonotype", name: "NatDex Monotype", color: "bg-yellow-600" },
];

// Built-in i18n dictionary
const dict = {
  es: {
    title: "Metagame",
    subtitle: "Intelligence",
    dataSource: "Datos en tiempo real de Smogon University",
    battlesSample: "Batallas Analizadas",
    tierCutoff: "Tier Cutoff",
    metaStability: "Estabilidad",
    lastUpdate: "Actualización",
    high: "ALTA",
    mainItem: "Item Principal",
    mainMove: "Move Principal",
    rank: "Rank",
    pokemon: "Pokémon",
    usage: "Uso %",
    topItem: "Top Item",
    action: "Acción",
    analyze: "ANALIZAR",
    globalAnalysis: "Análisis de uso global",
    popularity: "Popularidad",
    corePartners: "Core Partners",
    topMoves: "Top Moves",
    recommendedItems: "Items Recomendados",
    synergies: "Sinergias & Teammates",
    viewFullProfile: "VER PERFIL COMPLETO",
  },
  en: {
    title: "Metagame",
    subtitle: "Intelligence",
    dataSource: "Real-time data from Smogon University",
    battlesSample: "Battles Sampled",
    tierCutoff: "Tier Cutoff",
    metaStability: "Stability",
    lastUpdate: "Last Update",
    high: "HIGH",
    mainItem: "Main Item",
    mainMove: "Main Move",
    rank: "Rank",
    pokemon: "Pokémon",
    usage: "Usage %",
    topItem: "Top Item",
    action: "Action",
    analyze: "ANALYZE",
    globalAnalysis: "Global Usage Analysis",
    popularity: "Popularity",
    corePartners: "Core Partners",
    topMoves: "Top Moves",
    recommendedItems: "Recommended Items",
    synergies: "Synergies & Teammates",
    viewFullProfile: "VIEW FULL PROFILE",
  },
};

export function MetagameDashboard({ lang, initialData }: MetagameDashboardProps) {
  const t = dict[lang as keyof typeof dict] || dict.en;
  const [activeFormat, setActiveFormat] = useState(initialData.format || "gen9ou");
  const [data, setData] = useState<MetagameData>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedPoke, setSelectedPoke] = useState<SmogonUsageStat | null>(null);
  const { activeTheme } = useTheme();

  const handleFormatChange = (formatId: string) => {
    setActiveFormat(formatId);
    if (formatId !== initialData.format) {
      setLoading(true);
    } else {
      setData(initialData);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFormat !== initialData.format) {
      getMetagameStats(activeFormat).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [activeFormat, initialData.format]);

  const top3 = data.pokemonList.slice(0, 3);
  const rest = data.pokemonList.slice(3, 50);

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-20 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter leading-none uppercase">
            {t.title} <br className="hidden sm:block" />
            <span className={activeTheme.accentClass}>{t.subtitle}</span>
          </h1>
          <p className="text-xs font-bold opacity-70 mt-2 uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" /> 
            {t.dataSource}
          </p>
        </div>

        {/* Format Selector - Responsive */}
        <div className="flex flex-wrap gap-2 bg-black/20 p-1.5 border-4 border-current shadow-[4px_4px_0px_#000000]">
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFormatChange(f.id)}
              className={`px-3 py-2 text-[10px] sm:text-xs font-black transition-all cursor-pointer uppercase tracking-tight ${
                activeFormat === f.id 
                ? `${f.color} text-white scale-105 shadow-[3px_3px_0px_black]` 
                : 'hover:bg-white/10'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview Bar - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="border-4 border-current p-3 lg:p-4 flex flex-col gap-1 shadow-[4px_4px_0px_#000000]">
          <span className="text-[9px] lg:text-[10px] font-black opacity-60 uppercase">{t.battlesSample}</span>
          <span className="text-xl lg:text-2xl font-black">{data.totalBattles.toLocaleString()}</span>
        </div>
        <div className="border-4 border-current p-3 lg:p-4 flex flex-col gap-1 shadow-[4px_4px_0px_#000000]">
          <span className="text-[9px] lg:text-[10px] font-black opacity-60 uppercase">{t.tierCutoff}</span>
          <span className="text-xl lg:text-2xl font-black">1695</span>
        </div>
        <div className="border-4 border-current p-3 lg:p-4 flex flex-col gap-1 bg-yellow-400 text-black shadow-[4px_4px_0px_#000000]">
          <span className="text-[9px] lg:text-[10px] font-black opacity-60 uppercase">{t.metaStability}</span>
          <span className="text-xl lg:text-2xl font-black">{t.high}</span>
        </div>
        <div className="border-4 border-current p-3 lg:p-4 flex flex-col gap-1 shadow-[4px_4px_0px_#000000]">
          <span className="text-[9px] lg:text-[10px] font-black opacity-60 uppercase">{t.lastUpdate}</span>
          <span className="text-xl lg:text-2xl font-black uppercase">MAY 2025</span>
        </div>
      </div>

      {/* Podium - Top 3 - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {top3.map((poke, idx) => (
          <motion.div
            key={poke.pokemon}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedPoke(poke)}
            className={`relative p-4 lg:p-6 border-4 border-current cursor-pointer group overflow-hidden
              shadow-[4px_4px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000000] transition-all
              ${idx === 0 ? 'lg:scale-105 z-10 bg-zinc-900 text-white sm:col-span-2 lg:col-span-1' : 'bg-white/5'}`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <span className="text-7xl lg:text-9xl font-black italic">#{poke.rank}</span>
            </div>
            
            <div className="relative z-10 flex flex-col gap-3 lg:gap-4">
              <div className="flex justify-between items-start">
                <span className={`text-3xl lg:text-4xl font-black italic ${idx === 0 ? 'text-yellow-400' : ''}`}>
                  0{poke.rank}
                </span>
                <div className="flex items-center gap-1 text-green-400 font-bold text-xs">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </div>
              </div>

              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 relative">
                  <img 
                    src={poke.spriteUrl} 
                    alt={poke.pokemon}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter leading-none">
                    {poke.pokemon}
                  </h3>
                  <div className="mt-1 flex gap-1 items-center">
                    <div className="h-1 w-10 lg:w-12 bg-current opacity-20 rounded-full overflow-hidden">
                      <div className="h-full bg-current" style={{ width: `${poke.usage}%` }} />
                    </div>
                    <span className="text-[10px] font-black">{poke.usage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 lg:mt-4">
                <div className="p-2 border-2 border-current/20 text-[9px] lg:text-[10px] font-bold">
                  <span className="opacity-50 block uppercase">{t.mainItem}</span>
                  <span className="truncate block">{Object.keys(poke.items)[0] || "None"}</span>
                </div>
                <div className="p-2 border-2 border-current/20 text-[9px] lg:text-[10px] font-bold">
                  <span className="opacity-50 block uppercase">{t.mainMove}</span>
                  <span className="truncate block">{Object.keys(poke.moves)[0] || "None"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Table - Responsive */}
      <div className="border-4 border-current overflow-hidden shadow-[4px_4px_0px_#000000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-current text-[var(--bg)]">
                <th className="p-2 lg:p-3 text-[10px] lg:text-xs font-black uppercase italic">{t.rank}</th>
                <th className="p-2 lg:p-3 text-[10px] lg:text-xs font-black uppercase italic">{t.pokemon}</th>
                <th className="p-2 lg:p-3 text-[10px] lg:text-xs font-black uppercase italic">{t.usage}</th>
                <th className="p-2 lg:p-3 text-[10px] lg:text-xs font-black uppercase italic hidden md:table-cell">{t.topItem}</th>
                <th className="p-2 lg:p-3 text-[10px] lg:text-xs font-black uppercase italic hidden md:table-cell text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse opacity-20 border-b-2 border-current/10">
                      <td colSpan={5} className="p-4 lg:p-6 h-12 bg-current/5" />
                    </tr>
                  ))
                ) : (
                  rest.map((poke) => (
                    <motion.tr
                      key={poke.pokemon}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedPoke(poke)}
                      className="group hover:bg-current hover:text-[var(--bg)] cursor-pointer border-b-2 border-current/10 transition-colors"
                    >
                      <td className="p-2 lg:p-3 font-black italic opacity-50 group-hover:opacity-100">{poke.rank}</td>
                      <td className="p-2 lg:p-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <img src={poke.spriteUrl} alt="" className="w-6 h-6 lg:w-8 lg:h-8 object-contain pixelated group-hover:scale-125 transition-transform" />
                          <span className="font-black uppercase tracking-tighter text-sm lg:text-base">{poke.pokemon}</span>
                        </div>
                      </td>
                      <td className="p-2 lg:p-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="flex-1 max-w-[60px] lg:max-w-[100px] h-2 bg-current/10 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-current transition-all duration-1000" 
                              style={{ width: `${(poke.usage / top3[0].usage) * 100}%` }} 
                            />
                          </div>
                          <span className="text-[10px] lg:text-xs font-black">{poke.usage.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="p-2 lg:p-3 text-[10px] lg:text-xs font-bold opacity-70 group-hover:opacity-100 hidden md:table-cell uppercase truncate max-w-[120px]">
                        {Object.keys(poke.items)[0] || "---"}
                      </td>
                      <td className="p-2 lg:p-3 text-right hidden md:table-cell">
                        <button className="px-2 lg:px-3 py-1 border-2 border-current text-[9px] lg:text-[10px] font-black group-hover:bg-[var(--background)] group-hover:text-[var(--foreground)] transition-colors">
                           {t.analyze}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sidebar Overlay */}
      <AnimatePresence>
        {selectedPoke && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoke(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:max-w-lg bg-[var(--bg)] border-l-4 lg:border-l-8 border-current z-[101] overflow-y-auto p-4 sm:p-6 lg:p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-6 lg:gap-8">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <img src={selectedPoke.spriteUrl} alt="" className="w-16 h-16 lg:w-20 lg:h-20 object-contain pixelated" />
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic leading-none">{selectedPoke.pokemon}</h2>
                      <span className="text-[10px] lg:text-xs font-bold opacity-50 uppercase">{t.globalAnalysis}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPoke(null)} 
                    className="p-2 border-4 border-current hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors shadow-[3px_3px_0px_#000000]"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={3} />
                  </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-3 lg:p-4 border-4 border-current/20 flex flex-col shadow-[3px_3px_0px_#000000]">
                     <span className="text-[9px] lg:text-[10px] font-black opacity-50 uppercase flex items-center gap-1">
                       <Target className="w-3 h-3" /> {t.popularity}
                     </span>
                     <span className="text-xl lg:text-2xl font-black">{selectedPoke.usage.toFixed(2)}%</span>
                  </div>
                  <div className="p-3 lg:p-4 border-4 border-current/20 flex flex-col shadow-[3px_3px_0px_#000000]">
                     <span className="text-[9px] lg:text-[10px] font-black opacity-50 uppercase flex items-center gap-1">
                       <Users className="w-3 h-3" /> {t.corePartners}
                     </span>
                     <span className="text-xl lg:text-2xl font-black">{Object.keys(selectedPoke.teammates).length}</span>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="flex flex-col gap-5 lg:gap-6">
                  {/* Moves */}
                  <div className="flex flex-col gap-2 lg:gap-3">
                    <h4 className="text-xs lg:text-sm font-black uppercase flex items-center gap-2">
                      <Swords className="w-4 h-4" /> {t.topMoves}
                    </h4>
                    <div className="flex flex-col gap-1.5 lg:gap-2">
                      {Object.entries(selectedPoke.moves).slice(0, 5).map(([move, usage]) => (
                        <div key={move} className="flex justify-between items-center p-2 bg-black/5 border-l-4 border-blue-500">
                          <span className="text-[10px] lg:text-xs font-bold uppercase">{move}</span>
                          <span className="text-[10px] lg:text-xs font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2 lg:gap-3">
                    <h4 className="text-xs lg:text-sm font-black uppercase flex items-center gap-2">
                      <Zap className="w-4 h-4" /> {t.recommendedItems}
                    </h4>
                    <div className="flex flex-col gap-1.5 lg:gap-2">
                      {Object.entries(selectedPoke.items).slice(0, 4).map(([item, usage]) => (
                        <div key={item} className="flex justify-between items-center p-2 bg-black/5 border-l-4 border-yellow-500">
                          <span className="text-[10px] lg:text-xs font-bold uppercase">{item}</span>
                          <span className="text-[10px] lg:text-xs font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teammates */}
                  <div className="flex flex-col gap-2 lg:gap-3">
                    <h4 className="text-xs lg:text-sm font-black uppercase flex items-center gap-2">
                      <Users className="w-4 h-4" /> {t.synergies}
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
                      {Object.entries(selectedPoke.teammates).slice(0, 6).map(([partner, usage]) => (
                        <div key={partner} className="p-2 border-2 border-current/10 flex justify-between items-center bg-black/5">
                           <span className="text-[9px] lg:text-[10px] font-bold uppercase truncate">{partner}</span>
                           <span className="text-[9px] lg:text-[10px] font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-3 lg:p-4 bg-current text-[var(--bg)] font-black text-center uppercase italic cursor-pointer hover:scale-[1.02] transition-transform text-sm lg:text-base shadow-[4px_4px_0px_#000000]">
                   {t.viewFullProfile}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
