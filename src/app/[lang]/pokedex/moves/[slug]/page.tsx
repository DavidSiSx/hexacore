import { getMoveBySlug } from "@/app/actions/encyclopedia";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { T } from "@/lib/lang";

const CAT_ES: Record<string, string> = { Physical: "FÍSICO", Special: "ESPECIAL", Status: "ESTADO" };

export default async function MoveDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const move = await getMoveBySlug(slug);
  if (!move) notFound();

  const displayName = lang === "es" && move.nombres?.es ? `${move.nombres.es} [${move.nombre}]` : move.nombre;
  const displayDesc = move.descripciones?.[lang] || move.descripciones?.en || move.descripciones;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full animate-fade-in flex flex-col gap-8">
      <Link href={`/${lang}/pokedex/moves`} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent)] inline-flex items-center transition-colors">
        ← <T es="VOLVER" en="BACK" />
      </Link>

      <div className="bg-[var(--background)] border-4 border-[var(--border)] p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-zinc-800 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[var(--foreground)] leading-none break-words">{displayName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <TypeBadge type={move.tipo} size="lg" />
              <span className="text-xs px-3 py-1 bg-black/10 border-2 border-[var(--border)] text-[var(--foreground)] opacity-60 font-black uppercase tracking-widest">
                <T es={CAT_ES[move.categoria] || move.categoria} en={move.categoria} />
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/5 border-2 border-[var(--border)] p-4 flex flex-col justify-center items-center">
            <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mb-1"><T es="CATEGORÍA" en="CATEGORY" /></p>
            <p className="text-[var(--accent)] font-black text-lg uppercase"><T es={CAT_ES[move.categoria] || move.categoria} en={move.categoria} /></p>
          </div>
          <div className="bg-black/5 border-2 border-[var(--border)] p-4 flex flex-col justify-center items-center">
            <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mb-1"><T es="PODER" en="POWER" /></p>
            <p className="text-[var(--foreground)] font-black text-2xl uppercase">{move.potencia || "—"}</p>
          </div>
          <div className="bg-black/5 border-2 border-[var(--border)] p-4 flex flex-col justify-center items-center">
            <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mb-1"><T es="PRECISIÓN" en="ACCURACY" /></p>
            <p className="text-[var(--foreground)] font-black text-2xl uppercase">{move.precision ? `${move.precision}%` : "—"}</p>
          </div>
          <div className="bg-black/5 border-2 border-[var(--border)] p-4 flex flex-col justify-center items-center">
            <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mb-1"><T es="PRIORIDAD" en="PRIORITY" /></p>
            <p className="text-[var(--foreground)] opacity-60 font-black text-2xl uppercase">{move.atributos?.priority || 0}</p>
          </div>
        </div>
 
        {/* Description */}
        <div className="bg-[var(--accent)] p-6 border-4 border-[var(--accent)]">
          <h2 className="text-[var(--accent-foreground)] font-black uppercase tracking-widest text-xs mb-2"><T es="EFECTO" en="EFFECT" /></h2>
          <p className="text-[var(--accent-foreground)] font-bold uppercase leading-tight md:text-lg">
            "{displayDesc}"
          </p>
        </div>
      </div>
    </div>
  );
}
