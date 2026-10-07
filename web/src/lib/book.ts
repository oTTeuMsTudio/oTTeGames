import catalog from "@/data/blueprint-book.json";

export type NodePictureNode = {
  id: string;
  title: string;
  kind: string;
  x: number;
  y: number;
};

export type NodePictureWire = {
  from: string;
  to: string;
  kind: "exec" | "data";
};

export type NodePicture = {
  nodes: NodePictureNode[];
  wires: NodePictureWire[];
};

export type BookGraph = {
  name: string;
  nodes: number;
  calls: string[];
  picture?: NodePicture;
};

export type BookAsset = {
  name: string;
  slug: string;
  kind: string;
  package: string;
  summary: string;
  nodeCount: number;
  graphs: BookGraph[];
  emptyGraphCount: number;
  emptyGraphNames: string[];
};

export type BookChapter = {
  slug: string;
  title: string;
  intro: string;
  assets: BookAsset[];
};

export type BookPart = {
  key: string;
  title: string;
  summary: string;
  chapters: BookChapter[];
};

export type BlueprintBook = {
  title: string;
  subtitle: string;
  dated: string;
  pdf: string;
  preface: string[];
  stats: {
    records: number;
    blueprints: number;
    graphs: number;
    nodes: number;
    chapters: number;
  };
  parts: BookPart[];
};

export const book = catalog as BlueprintBook;

export function kindLabel(kind: string) {
  if (kind === "blueprint") return "Blueprint";
  if (kind === "enum") return "Enum";
  if (kind === "struct") return "Struct";
  if (kind === "error") return "Not loaded";
  return kind;
}

export function bookChapters() {
  return book.parts.flatMap((part) =>
    part.chapters.map((chapter) => ({ part, chapter })),
  );
}

export function getChapter(slug: string) {
  return bookChapters().find((item) => item.chapter.slug === slug);
}

export function getAsset(chapterSlug: string, assetSlug: string) {
  const found = getChapter(chapterSlug);
  if (!found) return undefined;
  const asset = found.chapter.assets.find((item) => item.slug === assetSlug);
  if (!asset) return undefined;
  return { ...found, asset };
}

export type ReadingEntry = {
  part: BookPart;
  chapter: BookChapter;
  asset: BookAsset;
};

export function readingOrder(): ReadingEntry[] {
  return book.parts.flatMap((part) =>
    part.chapters.flatMap((chapter) =>
      chapter.assets.map((asset) => ({ part, chapter, asset })),
    ),
  );
}

export function neighbors(chapterSlug: string, assetSlug: string) {
  const order = readingOrder();
  const index = order.findIndex(
    (item) =>
      item.chapter.slug === chapterSlug && item.asset.slug === assetSlug,
  );
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: index > 0 ? order[index - 1] : undefined,
    next: index < order.length - 1 ? order[index + 1] : undefined,
  };
}

export type BookHit = {
  href: string;
  title: string;
  detail: string;
};

export function searchBook(query: string): BookHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const hits: BookHit[] = [];
  for (const { part, chapter } of bookChapters()) {
    const chapterHay =
      `${chapter.title} ${chapter.intro} ${part.title}`.toLowerCase();
    if (chapterHay.includes(needle)) {
      hits.push({
        href: `/book/${chapter.slug}`,
        title: chapter.title,
        detail: part.title,
      });
    }
    for (const asset of chapter.assets) {
      const hay =
        `${asset.name} ${asset.summary} ${asset.package} ${chapter.title}`.toLowerCase();
      if (hay.includes(needle)) {
        hits.push({
          href: `/book/${chapter.slug}/${asset.slug}`,
          title: asset.name,
          detail: `${chapter.title} · ${part.title}`,
        });
      }
    }
  }
  return hits.slice(0, 12);
}

export type NodeFigure = {
  href: string;
  assetName: string;
  chapterTitle: string;
  graph: BookGraph;
};

const featuredNodePicks: [string, string][] = [
  ["BP_Key", "EventGraph"],
  ["BP_Switch", "UserConstructionScript"],
  ["BP_TrapBase", "fnApplyDamageToTarget"],
  ["BP_BGM", "EventGraph"],
];

function pictureFits(graph: BookGraph) {
  const count = graph.picture?.nodes.length ?? 0;
  return count >= 3 && count <= 14;
}

function graphWithPicture(asset: BookAsset, graphName: string) {
  const named = asset.graphs.find(
    (graph) => graph.name === graphName && pictureFits(graph),
  );
  if (named) return named;
  return asset.graphs.find((graph) => pictureFits(graph));
}

export function featuredNodeFigures(): NodeFigure[] {
  const figures: NodeFigure[] = [];
  for (const [assetName, graphName] of featuredNodePicks) {
    for (const { chapter, asset } of readingOrder()) {
      if (asset.name !== assetName) continue;
      const graph = graphWithPicture(asset, graphName);
      if (!graph) continue;
      figures.push({
        href: `/book/${chapter.slug}/${asset.slug}`,
        assetName: asset.name,
        chapterTitle: chapter.title,
        graph,
      });
    }
  }
  return figures;
}

export function bookFacts() {
  const lines = [
    `Adventure Artist, The Blueprint Book, is at /book. The PDF is ${book.pdf}. Dated ${book.dated}.`,
    `${book.stats.blueprints} Blueprints, ${book.stats.records} records, ${book.stats.graphs} graphs, ${book.stats.nodes} nodes, across ${book.stats.chapters} chapters.`,
    "The menu is built from this catalog. Part I is the adventure. Part II is the template and prototypes. Part III is the arena shooter.",
  ];
  for (const part of book.parts) {
    lines.push(`${part.title} — ${part.summary}`);
    for (const chapter of part.chapters) {
      lines.push(
        `/book/${chapter.slug} ${chapter.title}: ${chapter.assets.map((asset) => asset.name).join(", ")}.`,
      );
    }
  }
  lines.push(
    "Each Blueprint page draws the graphs that have nodes. Pictures use the titles and wires from the dump. Reroute knots are omitted and the wires jump across them.",
    "Parent classes, component trees, variable defaults, widget trees, and enum display names were blank in the dump. Do not invent them. BP_Keyport failed to load. Many control-rig graphs are named and have no nodes.",
  );
  return lines.join("\n");
}
