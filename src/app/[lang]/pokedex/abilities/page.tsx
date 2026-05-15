import { getAllAbilities } from "@/app/actions/encyclopedia";
import AbilitiesList from "./AbilitiesList";
import { Brain } from "lucide-react";

export default async function AbilitiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "es";
  const isEs = lang === "es";

  const initialData = await getAllAbilities(1, 60, { lang });

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8">
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3">
          <Brain className="w-10 h-10 text-[var(--accent)] stroke-[2.5]" />
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isEs ? "HABILIDADES" : "ABILITIES"}
          </h1>
        </div>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">
          {isEs 
            ? "Catálogo de rasgos pasivos, activaciones y mecánicas de campo." 
            : "Catalog of passive traits, activations, and field mechanics."}
        </p>
      </div>

      <AbilitiesList lang={lang} initialData={initialData} />
    </div>
  );
}
