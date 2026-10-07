import type { Metadata } from "next";
import Link from "next/link";
import { NodeGraph } from "@/components/game-center/node-graph";
import { Button } from "@/components/ui/button";
import { tutorial } from "@/lib/tutorial";

export const metadata: Metadata = {
  title: "Top-Down Tutorial",
  description:
    "Build a top-down puzzle adventure from the Designer and Art Pass graphs.",
};

export default function TutorialPage() {
  const { stats } = tutorial;
  const preview = tutorial.lessons.flatMap((lesson) =>
    lesson.figures.slice(0, 1).map((figure) => ({
      lesson,
      figure,
    })),
  ).slice(0, 3);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {tutorial.title}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {tutorial.subtitle}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {stats.lessons} lessons, {stats.blueprints} Blueprints, and{" "}
          {stats.graphs} graphs from the Designer track and the Art Pass. Read
          on {tutorial.dated}. The camera is a spring arm. The puzzles stay on
          the floor.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/tutorial/${tutorial.lessons[0]?.slug ?? ""}`}>
              Start lesson 1
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/book">Blueprint Book</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground">
        {tutorial.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {preview.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-medium">Graphs you will build</h2>
          <div className="grid gap-4">
            {preview.map(({ lesson, figure }) => (
              <div key={`${lesson.slug}-${figure.label}`} className="space-y-2">
                <p className="text-sm font-medium">
                  <Link href={`/tutorial/${lesson.slug}`} className="hover:underline">
                    {lesson.number}. {figure.label}
                  </Link>
                </p>
                <NodeGraph graph={figure.graph} label={figure.label} compact />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-medium">Lessons</h2>
        <ol className="grid gap-2">
          {tutorial.lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/tutorial/${lesson.slug}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-brand/50"
              >
                <p className="text-sm font-medium">
                  {lesson.number}. {lesson.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{lesson.source}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {lesson.summary}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
