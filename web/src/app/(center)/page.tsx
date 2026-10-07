import Image from "next/image";
import Link from "next/link";
import { GameCard } from "@/components/game-center/game-card";
import { NodeGallery } from "@/components/game-center/node-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { featuredNodeFigures, searchBook } from "@/lib/book";
import { featuredGame, games } from "@/lib/games";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const visible = query
    ? games.filter((game) =>
        `${game.title} ${game.genre} ${game.tagline} ${game.description}`
          .toLowerCase()
          .includes(query),
      )
    : games;
  const bookHits = query ? searchBook(query) : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <section className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10">
        <div className="relative aspect-[16/8] min-h-64">
          <Image
            src={featuredGame.hero}
            alt={`${featuredGame.title} key art`}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 960px"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-6">
            <Badge>Featured</Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {featuredGame.title}
            </h1>
            <p className="max-w-xl text-sm text-white/80 md:text-base">
              {featuredGame.tagline} {featuredGame.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="!bg-white !text-black hover:!bg-white/90">
                <Link href={`/games/${featuredGame.slug}`}>View game</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="!border-white/70 !bg-transparent !text-white hover:!bg-white/15"
              >
                <Link href="/library">Open library</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {query ? null : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-4">
          <div>
            <p className="text-sm font-medium">Adventure Artist Blueprint Book</p>
            <p className="text-sm text-muted-foreground">
              Every Blueprint in the project, with a menu for each part and chapter.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/book">Open the book</Link>
          </Button>
        </section>
      )}

      {query ? null : (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-medium">Blueprint nodes</h2>
            <p className="text-sm text-muted-foreground">
              Graphs from Adventure Artist, drawn from the editor dump. Open a
              picture to read that Blueprint.
            </p>
          </div>
          <NodeGallery figures={featuredNodeFigures()} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-medium">Store</h2>
            <p className="text-sm text-muted-foreground">
              {query ? `Results for “${q}”` : "Games from the oTTe bench."}
            </p>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games match that search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        )}
      </section>

      {bookHits.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-medium">In the Blueprint Book</h2>
          <ul className="flex flex-col gap-2">
            {bookHits.map((hit) => (
              <li key={hit.href}>
                <Link
                  href={hit.href}
                  className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-brand/50"
                >
                  <p className="text-sm font-medium">{hit.title}</p>
                  <p className="text-xs text-muted-foreground">{hit.detail}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
