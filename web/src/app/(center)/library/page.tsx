import type { Metadata } from "next";
import { GameCard } from "@/components/game-center/game-card";
import { games } from "@/lib/games";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  const owned = games.filter((game) => game.status === "playable");
  const reading = games.filter((game) => game.status === "readable");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">My Library</h1>
        <p className="text-sm text-muted-foreground">
          Playable builds, plus the Blueprint Book you can read on this site.
        </p>
      </header>
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Playable</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {owned.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
      {reading.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-medium">Reading</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reading.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
