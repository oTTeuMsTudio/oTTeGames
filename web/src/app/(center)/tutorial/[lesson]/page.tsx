import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NodeGraph } from "@/components/game-center/node-graph";
import { Button } from "@/components/ui/button";
import { getLesson, lessonNeighbors, tutorial } from "@/lib/tutorial";

export function generateStaticParams() {
  return tutorial.lessons.map((lesson) => ({ lesson: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lesson: string }>;
}): Promise<Metadata> {
  const { lesson: slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Tutorial" };
  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson: slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { previous, next } = lessonNeighbors(slug);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Link href="/tutorial" className="hover:text-foreground">
            {tutorial.title}
          </Link>
          <span> · Lesson {lesson.number}</span>
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-xs text-muted-foreground">{lesson.source}</p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {lesson.summary}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-medium">Build this</h2>
        <ol className="max-w-3xl list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
          {lesson.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-medium">What changes from above</h2>
        <ul className="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {lesson.topDown.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      {lesson.figures.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-medium">Graphs</h2>
          {lesson.figures.map((figure) => (
            <div key={figure.label} className="space-y-2">
              <p className="font-mono text-sm">{figure.label}</p>
              <NodeGraph graph={figure.graph} label={figure.label} />
            </div>
          ))}
        </section>
      ) : null}

      {lesson.assets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-medium">Blueprints in this lesson</h2>
          <ul className="flex flex-col gap-2">
            {lesson.assets.map((asset) => (
              <li
                key={asset.name}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-sm font-medium">{asset.name}</p>
                  {asset.bookHref ? (
                    <Link
                      href={asset.bookHref}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Open in the book
                    </Link>
                  ) : null}
                </div>
                {asset.graphs.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {asset.graphs.map((graph) => (
                      <li key={graph.name}>
                        {graph.name} · {graph.nodes} nodes
                        {graph.calls.length > 0
                          ? ` · ${graph.calls.slice(0, 4).join(", ")}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No filled graph in this lesson.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="flex flex-wrap justify-between gap-2">
        {previous ? (
          <Button asChild variant="outline">
            <Link href={`/tutorial/${previous.slug}`}>
              {previous.number}. {previous.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link href={`/tutorial/${next.slug}`}>
              {next.number}. {next.title}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/tutorial">Back to the tutorial</Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
