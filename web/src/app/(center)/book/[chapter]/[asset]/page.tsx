import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NodeGraph } from "@/components/game-center/node-graph";
import { book, getAsset, kindLabel, neighbors, readingOrder } from "@/lib/book";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return readingOrder().map(({ chapter, asset }) => ({
    chapter: chapter.slug,
    asset: asset.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string; asset: string }>;
}): Promise<Metadata> {
  const { chapter, asset } = await params;
  const found = getAsset(chapter, asset);
  if (!found) return { title: "Blueprint" };
  return {
    title: found.asset.name,
    description: found.asset.summary,
  };
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ chapter: string; asset: string }>;
}) {
  const { chapter, asset: assetSlug } = await params;
  const found = getAsset(chapter, assetSlug);
  if (!found) notFound();
  const { part, chapter: chapterData, asset } = found;
  const { previous, next } = neighbors(chapter, assetSlug);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Link href="/book" className="hover:text-foreground">
            Blueprint Book
          </Link>
          <span> · </span>
          <Link href={`/book/${chapterData.slug}`} className="hover:text-foreground">
            {chapterData.title}
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold">{asset.name}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {kindLabel(asset.kind)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{part.title}</p>
        {asset.package ? (
          <p className="font-mono text-xs break-all text-muted-foreground">
            {asset.package}
          </p>
        ) : null}
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {asset.summary}
        </p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {chapterData.intro}
        </p>
      </header>

      {asset.graphs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-medium">Graphs with nodes</h2>
          <ul className="flex flex-col gap-2">
            {asset.graphs.map((graph, index) => (
              <li
                key={`${graph.name}-${index}`}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-mono text-sm">{graph.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {graph.nodes.toLocaleString("en-US")}{" "}
                    {graph.nodes === 1 ? "node" : "nodes"}
                  </p>
                </div>
                {graph.picture ? (
                  <div className="mt-3">
                    <NodeGraph
                      graph={graph}
                      label={`${asset.name} · ${graph.name}`}
                    />
                  </div>
                ) : null}
                {graph.calls.length > 0 ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {graph.calls.join(", ")}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No call, event, cast, or timeline titles were pulled from this graph.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {asset.emptyGraphCount > 0 ? (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">Named graphs with no nodes</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {asset.emptyGraphNames.join(", ")}
            {asset.emptyGraphCount > asset.emptyGraphNames.length
              ? `, and ${asset.emptyGraphCount - asset.emptyGraphNames.length} more`
              : ""}
            .
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <a href={book.pdf} download>
            Download the PDF
          </a>
        </Button>
      </div>

      <nav className="grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={`/book/${previous.chapter.slug}/${previous.asset.slug}`}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="font-mono text-sm">{previous.asset.name}</p>
            <p className="text-xs text-muted-foreground">{previous.chapter.title}</p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/book/${next.chapter.slug}/${next.asset.slug}`}
            className="rounded-xl border border-border bg-card px-4 py-3 sm:text-right"
          >
            <p className="text-xs text-muted-foreground">Next</p>
            <p className="font-mono text-sm">{next.asset.name}</p>
            <p className="text-xs text-muted-foreground">{next.chapter.title}</p>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}

