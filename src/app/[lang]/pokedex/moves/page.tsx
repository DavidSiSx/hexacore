import { getAllMoves } from "@/app/actions/encyclopedia";
import MovesList from "./MovesList";
import { Swords } from "lucide-react";

export default async function MovesPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "es";
  const isEs = lang === "es";

  const initialData = await getAllMoves(1, 60, { lang });

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8">
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3">
          <Swords className="w-10 h-10 text-[var(--accent)] stroke-[2.5]" />
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isEs ? "MOVIMIENTOS" : "MOVES"}
          </h1>
        </div>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">
          {isEs 
            ? "Base de datos técnica de ataques, estados y efectos de campo." 
            : "Technical database of attacks, states, and field effects."}
        </p>
      </div>

      <MovesList lang={lang} initialData={initialData} />
    </div>
  );
}
