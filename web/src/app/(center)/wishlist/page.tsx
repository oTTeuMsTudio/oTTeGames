import type { Metadata } from "next";
import { GameCard } from "@/components/game-center/game-card";
import { games } from "@/lib/games";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  const upcoming = games.filter((game) => game.status === "coming-soon");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          Titles you are watching. Studio Lab sits here until it ships.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {upcoming.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
