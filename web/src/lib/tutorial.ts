import type { BookGraph } from "@/lib/book";
import catalog from "@/data/topdown-tutorial.json";

export type TutorialAsset = {
  name: string;
  slug: string;
  kind: string;
  package: string;
  bookHref?: string | null;
  graphs: BookGraph[];
};

export type TutorialFigure = {
  label: string;
  graph: BookGraph;
};

export type TutorialLesson = {
  slug: string;
  number: number;
  title: string;
  source: string;
  summary: string;
  steps: string[];
  topDown: string[];
  assets: TutorialAsset[];
  figures: TutorialFigure[];
};

export type TopDownTutorial = {
  title: string;
  subtitle: string;
  dated: string;
  intro: string[];
  stats: {
    lessons: number;
    blueprints: number;
    graphs: number;
  };
  lessons: TutorialLesson[];
};

export const tutorial = catalog as TopDownTutorial;

export function getLesson(slug: string) {
  return tutorial.lessons.find((lesson) => lesson.slug === slug);
}

export function lessonNeighbors(slug: string) {
  const index = tutorial.lessons.findIndex((lesson) => lesson.slug === slug);
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: index > 0 ? tutorial.lessons[index - 1] : undefined,
    next:
      index < tutorial.lessons.length - 1
        ? tutorial.lessons[index + 1]
        : undefined,
  };
}

export type TutorialHit = {
  href: string;
  title: string;
  detail: string;
};

export function searchTutorial(query: string): TutorialHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const hits: TutorialHit[] = [];
  for (const lesson of tutorial.lessons) {
    const lessonHay = `${lesson.title} ${lesson.summary} ${lesson.source}`.toLowerCase();
    if (lessonHay.includes(needle)) {
      hits.push({
        href: `/tutorial/${lesson.slug}`,
        title: lesson.title,
        detail: `Lesson ${lesson.number}`,
      });
    }
    for (const asset of lesson.assets) {
      const hay = `${asset.name} ${asset.package} ${lesson.title}`.toLowerCase();
      if (hay.includes(needle)) {
        hits.push({
          href: `/tutorial/${lesson.slug}`,
          title: asset.name,
          detail: `Lesson ${lesson.number} · ${lesson.title}`,
        });
      }
    }
  }
  return hits.slice(0, 12);
}

export function tutorialFacts() {
  const lines = [
    `First Ten Million is a top-down tutorial at /tutorial. Dated ${tutorial.dated}.`,
    `${tutorial.stats.lessons} lessons, ${tutorial.stats.blueprints} Blueprints, ${tutorial.stats.graphs} graphs.`,
    "It starts from the Unreal Top Down template. Keys, doors, switches, platforms, traps, the HUD, materials, MetaSounds, and Niagara carry over. First-person aim and weapon graphs stay in the Blueprint Book.",
  ];
  for (const lesson of tutorial.lessons) {
    const names = lesson.assets.map((asset) => asset.name).join(", ");
    lines.push(
      `/tutorial/${lesson.slug} ${lesson.number}. ${lesson.title}. ${lesson.summary} Assets: ${names || "material and audio graphs"}.`,
    );
  }
  return lines.join("\n");
}
