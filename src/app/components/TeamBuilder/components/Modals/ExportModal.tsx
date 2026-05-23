import { X, Copy, Check } from "lucide-react";
import { TranslationType } from "../../locales";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationType;

  showdownOutput: string;
  showCopySuccess: boolean;
  onCopy: () => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  t,
  showdownOutput,
  showCopySuccess,
  onCopy,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-955 border-4 border-emerald-500 p-6
                      shadow-[8px_8px_0px_#000000] z-10 text-left">
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-zinc-900">
          <h3 className="text-base font-black uppercase tracking-tighter text-white">
            {t.exportTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 border-2 border-zinc-800 hover:bg-red-500 hover:border-red-500 hover:text-black transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          readOnly
          value={showdownOutput}
          className="w-full h-64 bg-black border-2 border-zinc-850 p-3.5 text-xs font-mono font-bold 
                     text-zinc-150 focus:outline-none normal-case"
        />

        <div className="flex justify-between items-center mt-5 pt-3 border-t border-zinc-900">
          <button
            onClick={onCopy}
            className="px-4 py-2.5 bg-emerald-600 text-white border-2 border-emerald-500
                       text-xs font-black uppercase flex items-center gap-2
                       shadow-[3px_3px_0px_#000000]
                       hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--border)]
                       hover:bg-[var(--accent)]/90 hover:border-[var(--border)] hover:text-[var(--accent-foreground)]
                       transition-all cursor-pointer"
          >
            {showCopySuccess ? (
              <>
                <Check className="w-4 h-4" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t.copyClipboard}
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2.5 border-2 border-zinc-800 text-xs font-black uppercase hover:bg-zinc-900 text-zinc-450 hover:text-white transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
