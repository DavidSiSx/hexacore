import { use } from "react";
import { getAllItems } from "@/app/actions/encyclopedia";
import ItemsList from "./ItemsList";
import { Briefcase } from "lucide-react";

export default async function ItemsPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "es";
  const isEs = lang === "es";

  // Pre-fetch inicial para SSR (Cero fricción)
  const initialData = await getAllItems(1, 60, { lang });

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8">
      {/* Top Header Brutalista (SSR) */}
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3">
          <Briefcase className="w-10 h-10 text-[var(--accent)] stroke-[2.5]" />
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isEs ? "OBJETOS COMPETITIVOS" : "COMPETITIVE ITEMS"}
          </h1>
        </div>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">
          {isEs 
            ? "Catálogo íntegro de equipamiento, modificadores de combate y bayas estratégicas." 
            : "Complete catalog of equipment, battle modifiers, and strategic berries."}
        </p>
      </div>

      <ItemsList lang={lang} initialData={initialData} />
    </div>
  );
}
