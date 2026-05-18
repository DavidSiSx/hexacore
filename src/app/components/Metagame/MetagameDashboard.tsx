"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Swords, Zap, Activity, Users, Target } from "lucide-react";
import { getMetagameStats, SmogonUsageStat, MetagameData } from "@/app/actions/metagame";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

interface MetagameDashboardProps {
  lang: string;
  initialData: MetagameData;
}

const FORMATS = [
  { id: "gen9ou", name: "Gen 9 OU", color: "bg-blue-500" },
  { id: "gen9uu", name: "Gen 9 UU", color: "bg-green-500" },
  { id: "gen9uber", name: "Gen 9 Ubers", color: "bg-purple-500" },
  { id: "gen9vgc2025regg", name: "VGC 2025 Reg G", color: "bg-orange-500" },
];

export function MetagameDashboard({ lang, initialData }: MetagameDashboardProps) {
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
    <div className="flex flex-col gap-8 pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase">
            Metagame <br />
            <span className={activeTheme.accentClass}>Intelligence</span>
          </h1>
          <p className="text-sm font-bold opacity-70 mt-2 uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" /> 
            {lang === "es" ? "Datos en tiempo real de Smogon University" : "Real-time data from Smogon University"}
          </p>
        </div>

        <div className="flex gap-2 bg-black/20 p-1 border-2 border-current">
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFormatChange(f.id)}
              className={`px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeFormat === f.id 
                ? `${f.color} text-white scale-105 shadow-[4px_4px_0px_black]` 
                : 'hover:bg-white/10'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-4 border-current p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black opacity-60 uppercase">Battles Sample</span>
          <span className="text-2xl font-black">{data.totalBattles.toLocaleString()}</span>
        </div>
        <div className="border-4 border-current p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black opacity-60 uppercase">Tier Cutoff</span>
          <span className="text-2xl font-black">1695 Glicko</span>
        </div>
        <div className="border-4 border-current p-4 flex flex-col gap-1 bg-yellow-400 text-black">
          <span className="text-[10px] font-black opacity-60 uppercase">Meta Stability</span>
          <span className="text-2xl font-black">HIGH</span>
        </div>
        <div className="border-4 border-current p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black opacity-60 uppercase">Last Update</span>
          <span className="text-2xl font-black uppercase">MAY 2025</span>
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((poke, idx) => (
          <motion.div
            key={poke.pokemon}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedPoke(poke)}
            className={`relative p-6 border-4 border-current cursor-pointer group overflow-hidden ${
              idx === 0 ? 'md:scale-105 z-10 bg-zinc-900 text-white' : 'bg-white/5'
            }`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <span className="text-9xl font-black italic">#{poke.rank}</span>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className={`text-4xl font-black italic ${idx === 0 ? 'text-yellow-400' : ''}`}>
                  0{poke.rank}
                </span>
                <div className="flex items-center gap-1 text-green-400 font-bold text-xs">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative">
                  <img 
                    src={poke.spriteUrl} 
                    alt={poke.pokemon}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {poke.pokemon}
                  </h3>
                  <div className="mt-1 flex gap-1">
                    <div className="h-1 w-12 bg-current opacity-20 rounded-full overflow-hidden">
                      <div className="h-full bg-current" style={{ width: `${poke.usage}%` }} />
                    </div>
                    <span className="text-[10px] font-black">{poke.usage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 border-2 border-current/20 text-[10px] font-bold">
                  <span className="opacity-50 block uppercase">Main Item</span>
                  {Object.keys(poke.items)[0] || "None"}
                </div>
                <div className="p-2 border-2 border-current/20 text-[10px] font-bold">
                  <span className="opacity-50 block uppercase">Main Move</span>
                  {Object.keys(poke.moves)[0] || "None"}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Table */}
      <div className="border-4 border-current overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-current text-[var(--bg)]">
              <th className="p-3 text-xs font-black uppercase italic">Rank</th>
              <th className="p-3 text-xs font-black uppercase italic">Pokémon</th>
              <th className="p-3 text-xs font-black uppercase italic">Usage %</th>
              <th className="p-3 text-xs font-black uppercase italic hidden md:table-cell">Top Item</th>
              <th className="p-3 text-xs font-black uppercase italic hidden md:table-cell text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse opacity-20 border-b-2 border-current/10">
                    <td colSpan={5} className="p-6 h-12 bg-current/5" />
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
                    <td className="p-3 font-black italic opacity-50 group-hover:opacity-100">{poke.rank}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={poke.spriteUrl} alt="" className="w-8 h-8 object-contain pixelated group-hover:scale-125 transition-transform" />
                        <span className="font-black uppercase tracking-tighter">{poke.pokemon}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px] h-2 bg-current/10 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-current transition-all duration-1000" 
                            style={{ width: `${(poke.usage / top3[0].usage) * 100}%` }} 
                          />
                        </div>
                        <span className="text-xs font-black">{poke.usage.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs font-bold opacity-70 group-hover:opacity-100 hidden md:table-cell uppercase">
                      {Object.keys(poke.items)[0] || "---"}
                    </td>
                    <td className="p-3 text-right hidden md:table-cell">
                      <button className="px-3 py-1 border-2 border-current text-[10px] font-black group-hover:bg-[var(--background)] group-hover:text-[var(--foreground)] transition-colors">
                         {lang === "es" ? "ANALIZAR" : "ANALYZE"}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Sidebar Detail (Overlay) */}
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
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--bg)] border-l-8 border-current z-[101] overflow-y-auto p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src={selectedPoke.spriteUrl} alt="" className="w-20 h-20 object-contain pixelated" />
                    <div>
                      <h2 className="text-4xl font-black uppercase italic leading-none">{selectedPoke.pokemon}</h2>
                      <span className="text-xs font-bold opacity-50 uppercase">Global Usage Analysis</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPoke(null)} className="p-2 border-2 border-current hover:bg-red-500 hover:text-white transition-colors">
                    <span className="text-xl font-bold">×</span>
                  </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-current/20 flex flex-col">
                     <span className="text-[10px] font-black opacity-50 uppercase flex items-center gap-1">
                       <Target className="w-3 h-3" /> Popularity
                     </span>
                     <span className="text-2xl font-black">{selectedPoke.usage.toFixed(2)}%</span>
                  </div>
                  <div className="p-4 border-2 border-current/20 flex flex-col">
                     <span className="text-[10px] font-black opacity-50 uppercase flex items-center gap-1">
                       <Users className="w-3 h-3" /> Core Partners
                     </span>
                     <span className="text-2xl font-black">{Object.keys(selectedPoke.teammates).length}</span>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="flex flex-col gap-6">
                  {/* Moves */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-black uppercase flex items-center gap-2">
                      <Swords className="w-4 h-4" /> Top Moves
                    </h4>
                    <div className="flex flex-col gap-2">
                      {Object.entries(selectedPoke.moves).slice(0, 5).map(([move, usage]) => (
                        <div key={move} className="flex justify-between items-center p-2 bg-black/5 border-l-4 border-blue-500">
                          <span className="text-xs font-bold uppercase">{move}</span>
                          <span className="text-xs font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-black uppercase flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Recommended Items
                    </h4>
                    <div className="flex flex-col gap-2">
                      {Object.entries(selectedPoke.items).slice(0, 4).map(([item, usage]) => (
                        <div key={item} className="flex justify-between items-center p-2 bg-black/5 border-l-4 border-yellow-500">
                          <span className="text-xs font-bold uppercase">{item}</span>
                          <span className="text-xs font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teammates */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-black uppercase flex items-center gap-2">
                      <Users className="w-4 h-4" /> Synergies & Teammates
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedPoke.teammates).slice(0, 6).map(([partner, usage]) => (
                        <div key={partner} className="p-2 border-2 border-current/10 flex justify-between items-center bg-black/5">
                           <span className="text-[10px] font-bold uppercase truncate">{partner}</span>
                           <span className="text-[10px] font-black">{usage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-4 bg-current text-[var(--bg)] font-black text-center uppercase italic cursor-pointer hover:scale-[1.02] transition-transform">
                   {lang === "es" ? "VER PERFIL COMPLETO" : "VIEW FULL PROFILE"}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
