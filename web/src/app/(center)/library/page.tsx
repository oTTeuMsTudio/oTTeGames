import type { Metadata } from "next";
import { GameCard } from "@/components/game-center/game-card";
import { games } from "@/lib/games";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  const owned = games.filter((game) => game.status === "playable");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">My Library</h1>
        <p className="text-sm text-muted-foreground">
          Installed and owned titles on this account.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {owned.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
