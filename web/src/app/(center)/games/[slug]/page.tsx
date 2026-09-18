import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { games, getGame } from "@/lib/games";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game" };
  return { title: game.title, description: game.tagline };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10">
        <div className="relative aspect-[16/7] min-h-56">
          <Image
            src={game.hero}
            alt={`${game.title} key art`}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 960px"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-semibold">{game.title}</h1>
            <Badge variant={game.status === "playable" ? "default" : "secondary"}>
              {game.status === "playable" ? "Playable" : "Coming soon"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{game.tagline}</p>
          <p className="text-sm text-muted-foreground">
            {game.genre}
            {game.engine ? ` · ${game.engine}` : ""} · {game.platforms.join(", ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={game.status === "playable" ? "/library" : "/wishlist"}>
              {game.status === "playable" ? "In library" : "On wishlist"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to store</Link>
          </Button>
        </div>
      </div>

      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {game.description}
      </p>
      <ul className="grid gap-2 text-sm sm:grid-cols-3">
        {game.highlights.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border bg-card px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
