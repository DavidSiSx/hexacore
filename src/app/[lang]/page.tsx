import TeamBuilder from "@/app/components/TeamBuilder";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TeamBuilder />

      {/* Footer Brutalista */}
      <footer className="w-full text-center py-8 border-t-4 border-[var(--border)] bg-[var(--muted)]">
        <p className="text-[var(--foreground)] text-xs font-black uppercase tracking-widest mb-2">
          Hexacore — AI-Powered Competitive Pokemon Team Builder
        </p>
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
          Pokemon is a trademark of Nintendo / Game Freak. Strategy data by Smogon University.
        </p>
      </footer>
    </div>
  );
}
