import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Game } from "@/lib/games";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} className="block">
      <Card className="gap-0 py-0 transition-transform hover:-translate-y-0.5">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={game.cover}
            alt={`${game.title} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base font-medium">{game.title}</h3>
            <Badge variant={game.status === "playable" ? "default" : "secondary"}>
              {game.status === "playable" ? "Playable" : "Soon"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{game.tagline}</p>
          <p className="text-xs text-muted-foreground">
            {game.genre} · {game.platforms.join(", ")}
          </p>
        </div>
      </Card>
    </Link>
  );
}
