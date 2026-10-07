import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bookChapters, getChapter, kindLabel } from "@/lib/book";

export function generateStaticParams() {
  return bookChapters().map(({ chapter }) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const found = getChapter(chapter);
  if (!found) return { title: "Chapter" };
  return { title: found.chapter.title, description: found.chapter.intro };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const found = getChapter(slug);
  if (!found) notFound();
  const { part, chapter } = found;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Link href="/book" className="hover:text-foreground">
            Blueprint Book
          </Link>
          <span> · {part.title}</span>
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {chapter.title}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {chapter.intro}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {chapter.assets.map((asset) => (
          <li key={asset.slug}>
            <Link
              href={`/book/${chapter.slug}/${asset.slug}`}
              className="block rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-brand/50"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-mono text-sm font-medium">{asset.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {kindLabel(asset.kind)}
                  {asset.graphs.length > 0
                    ? ` · ${asset.graphs.length} graphs with nodes`
                    : ""}
                  {asset.emptyGraphCount > 0
                    ? ` · ${asset.emptyGraphCount} empty`
                    : ""}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {asset.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
