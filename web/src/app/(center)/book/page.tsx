import type { Metadata } from "next";
import Link from "next/link";
import { NodeGallery } from "@/components/game-center/node-graph";
import { book, featuredNodeFigures } from "@/lib/book";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blueprint Book",
  description:
    "Every Blueprint in Adventure Artist, arranged as the adventure, the template, and the arena shooter.",
};

export default function BookPage() {
  const { stats } = book;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {book.title}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {book.subtitle}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {stats.blueprints.toLocaleString("en-US")} Blueprints,{" "}
          {stats.graphs.toLocaleString("en-US")} graphs, and{" "}
          {stats.nodes.toLocaleString("en-US")} nodes. Read from the editor dump
          on {book.dated}. The same text is typeset as a PDF.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={book.pdf} download>
              Download the PDF
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/games/adventure-artist">Game page</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium">Nodes from the dump</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          These pictures use the node titles and wires stored for each graph.
          Reroute knots are left out. The wires jump across them.
        </p>
        <NodeGallery figures={featuredNodeFigures()} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-medium">How this center is organized</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium">Store, library, studio</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The top menu is the game center: the store, your library, community,
              news, and support. FGIU stays the playable Windows build. Adventure
              Artist is the reading title.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium">A menu from the book</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The left menu under Blueprint Book is built from the catalog. It
              lists three parts and {stats.chapters} chapters. Open a chapter and
              that chapter&apos;s Blueprints appear under it. A new chapter in the
              catalog shows up here without a hand-written link.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium">One page per record</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each chapter explains its group. Each Blueprint, enum, and struct
              has a page with the graphs the dump actually stored. Search on the
              store looks through those names as well as the games.
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-medium">How to read it</h2>
        <div className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
          {book.preface.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium">Contents</h2>
        {book.parts.map((part) => (
          <article key={part.key} id={part.key} className="space-y-3">
            <div>
              <h3 className="font-heading text-lg font-medium">{part.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{part.summary}</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {part.chapters.map((chapter) => (
                <li key={chapter.slug}>
                  <Link
                    href={`/book/${chapter.slug}`}
                    className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-brand/50"
                  >
                    <p className="text-sm font-medium">{chapter.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {chapter.assets.length} records
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
