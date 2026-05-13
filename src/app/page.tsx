import TeamBuilder from "@/app/components/TeamBuilder";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TeamBuilder />

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[var(--text-muted)] text-xs border-t border-[var(--border)]">
        <p>
          ⬡ Hexacore — AI-Powered Competitive Pokémon Team Builder
        </p>
        <p className="mt-1 opacity-60">
          Pokémon is a trademark of Nintendo / Game Freak. Strategy data by Smogon University.
        </p>
      </footer>
    </div>
  );
}
