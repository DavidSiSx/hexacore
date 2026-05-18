import { getItemBySlug } from "@/app/actions/encyclopedia";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Info, Tag } from "lucide-react";
import { T } from "@/lib/lang";

function getItemSpriteUrl(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://play.pokemonshowdown.com/sprites/itemicons/${cleaned}.png`;
}

export default async function ItemDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  
  const item = await getItemBySlug(slug);
  
  if (!item) notFound();

  const isEs = lang === "es";
  const displayName = isEs && item.nombres?.es ? item.nombres.es : item.nombre;
  const displayDesc = isEs && item.descripciones?.es ? item.descripciones.es : (item.descripciones?.en || "No description available.");
  const sprite = item.sprite_url || getItemSpriteUrl(item.nombre);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full animate-fade-in flex flex-col gap-8">
      <Link href={`/${lang}/pokedex/items`} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent)] inline-flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-3 h-3" /> <T es="VOLVER A OBJETOS" en="BACK TO ITEMS" />
      </Link>

      <div className="bg-[var(--background)] border-4 border-[var(--border)] p-8 flex flex-col md:flex-row gap-12 items-start relative overflow-hidden">
        {/* Acento Brutalista */}
        <div className="absolute top-0 right-0 w-16 h-16 border-b-4 border-l-4 border-[var(--border)] opacity-10" />

        {/* Item Icon & Identity */}
        <div className="flex flex-col items-center gap-6 w-full md:w-1/3">
          <div className={`w-32 h-32 flex items-center justify-center bg-black/5 border-4 border-[var(--border)] relative group`}>
             <Briefcase className={`w-12 h-12 absolute text-[var(--foreground)] opacity-20`} strokeWidth={3} />
             {sprite && (
               <img 
                 src={sprite} 
                 alt={item.nombre} 
                 className="w-20 h-20 object-contain rendering-pixelated relative z-10 group-hover:scale-110 transition-transform" 
               />
             )}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--foreground)]">{displayName}</h1>
            <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
              <Tag className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{(item.atributos as Record<string, unknown>)?.category as string || "ITEM"}</span>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="relative">
            <div className="bg-[var(--accent)] p-6 border-4 border-[var(--accent)] relative z-10">
              <h2 className="text-[var(--background)] font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
                <Info className="w-3 h-3 fill-current" /> <T es="EFECTO DEL OBJETO" en="ITEM EFFECT" />
              </h2>
              <p className="text-[var(--background)] font-bold uppercase leading-tight text-lg italic">
                &quot;{displayDesc}&quot;
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-[var(--border)] -z-0" />
          </div>

          <div className="bg-black/5 border-2 border-[var(--border)] p-6">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">TECHNICAL DATA</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[9px] font-bold opacity-60 mb-1">INTERNAL ID</p>
                    <p className="font-mono text-xs font-black uppercase">{item.nombre.replace(/ /g, "_")}</p>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
