import { getMoveByName } from "@/app/actions/encyclopedia";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MoveDetail({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const move = await getMoveByName(decodeURIComponent(name));
  if (!move) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <Link href="/pokedex/moves" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-4 inline-block">
        ← Volver a movimientos
      </Link>
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">{move.nombre}</h1>
          <TypeBadge type={move.tipo} size="md" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--surface-2)] rounded-xl p-4 text-center">
            <p className="text-[var(--text-muted)] text-xs mb-1">Categoría</p>
            <p className="text-white font-semibold">{move.categoria}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl p-4 text-center">
            <p className="text-[var(--text-muted)] text-xs mb-1">Poder</p>
            <p className="text-white font-semibold font-mono">{move.potencia || "—"}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl p-4 text-center">
            <p className="text-[var(--text-muted)] text-xs mb-1">Precisión</p>
            <p className="text-white font-semibold font-mono">{move.precision ? `${move.precision}%` : "—"}</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Descripción</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{move.descripcion}</p>
        </div>
      </div>
    </div>
  );
}
