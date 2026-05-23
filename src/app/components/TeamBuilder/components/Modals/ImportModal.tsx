import { X } from "lucide-react";
import { TranslationType } from "../../locales";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationType;

  showdownInput: string;
  setShowdownInput: (val: string) => void;
  onImport: () => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  t,
  showdownInput,
  setShowdownInput,
  onImport,
}: ImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-955 border-4 border-[var(--border)] p-6
                      shadow-[8px_8px_0px_#000000] z-10 text-left">
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-zinc-900">
          <h3 className="text-base font-black uppercase tracking-tighter text-white">
            {t.importTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 border-2 border-zinc-800 hover:bg-red-500 hover:border-red-500 hover:text-black transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-zinc-550 text-[10px] font-black uppercase mb-4 leading-normal">
          {t.importDesc}
        </p>

        <textarea
          value={showdownInput}
          onChange={(e) => setShowdownInput(e.target.value)}
          placeholder={`Gengar @ Choice Specs\nAbility: Cursed Body\nLevel: 50\nTera Type: Ghost\nEVs: 4 HP / 252 SpA / 252 Spe\nTimid Nature\n- Shadow Ball\n- Sludge Bomb\n- Dazzling Gleam\n- Trick`}
          className="w-full h-64 bg-black border-2 border-zinc-850 p-3.5 text-xs font-mono font-bold 
                     text-zinc-150 placeholder:text-zinc-850 focus:outline-none focus:border-[var(--border)] normal-case"
        />

        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border-2 border-zinc-800 text-xs font-black uppercase text-zinc-400
                       hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            {t.importCancel}
          </button>
          <button
            onClick={onImport}
            disabled={!showdownInput.trim()}
            className="px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)]
                       text-xs font-black uppercase
                       shadow-[3px_3px_0px_#000000]
                       hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#00FF66]
                       hover:bg-emerald-500 hover:border-emerald-400 hover:text-black
                       disabled:opacity-20 disabled:pointer-events-none disabled:shadow-none
                       transition-all cursor-pointer"
          >
            {t.importLoad}
          </button>
        </div>
      </div>
    </div>
  );
}
