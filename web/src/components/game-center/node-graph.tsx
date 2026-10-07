import Link from "next/link";
import type { BookGraph, NodeFigure } from "@/lib/book";

const kinds: Record<string, { header: string; label: string }> = {
  event: { header: "#c23737", label: "Event" },
  function: { header: "#9f1239", label: "Function" },
  call: { header: "#1d4f91", label: "Call" },
  set: { header: "#1d4f91", label: "Set" },
  variable: { header: "#1f7a45", label: "Get" },
  pure: { header: "#1f7a45", label: "Pure" },
  flow: { header: "#4b5563", label: "Flow" },
  timeline: { header: "#6d28d9", label: "Timeline" },
  cast: { header: "#0f766e", label: "Cast" },
  anim: { header: "#1e40af", label: "Anim" },
};

type DrawnNode = {
  id: string;
  title: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function placeNodes(graph: BookGraph): DrawnNode[] {
  const sized = (graph.picture?.nodes ?? []).map((node) => {
    const title = node.title || "Node";
    return {
      ...node,
      title,
      w: Math.min(220, Math.max(148, Math.min(title.length, 28) * 7.2 + 28)),
      h: 52,
    };
  });
  if (sized.length === 0) return [];

  const ids = new Set(sized.map((node) => node.id));
  const outgoing = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const node of sized) {
    outgoing.set(node.id, []);
    indeg.set(node.id, 0);
  }
  for (const wire of graph.picture?.wires ?? []) {
    if (!ids.has(wire.from) || !ids.has(wire.to) || wire.from === wire.to) continue;
    outgoing.get(wire.from)?.push(wire.to);
    indeg.set(wire.to, (indeg.get(wire.to) ?? 0) + 1);
  }

  const column = new Map<string, number>();
  const remaining = new Map(indeg);
  const queue = sized
    .filter((node) => (indeg.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  for (const id of queue) column.set(id, 0);

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) break;
    const col = column.get(id) ?? 0;
    for (const next of outgoing.get(id) ?? []) {
      column.set(next, Math.max(column.get(next) ?? 0, col + 1));
      const left = (remaining.get(next) ?? 1) - 1;
      remaining.set(next, left);
      if (left === 0) queue.push(next);
    }
  }

  for (const node of sized) {
    if (!column.has(node.id)) column.set(node.id, 0);
  }

  const groups = new Map<number, DrawnNode[]>();
  for (const node of sized) {
    const col = column.get(node.id) ?? 0;
    const group = groups.get(col) ?? [];
    group.push(node);
    groups.set(col, group);
  }

  const gapX = 48;
  const gapY = 22;
  let x = 0;
  const placed: DrawnNode[] = [];
  for (const col of [...groups.keys()].sort((a, b) => a - b)) {
    const group = groups.get(col) ?? [];
    group.sort((a, b) => a.y - b.y || a.x - b.x);
    const colWidth = Math.max(...group.map((node) => node.w));
    group.forEach((node, row) => {
      const y = group
        .slice(0, row)
        .reduce((sum, item) => sum + item.h + gapY, 0);
      placed.push({ ...node, x, y });
    });
    x += colWidth + gapX;
  }
  return placed;
}

export function NodeGraph({
  graph,
  label,
  compact = false,
}: {
  graph: BookGraph;
  label: string;
  compact?: boolean;
}) {
  const nodes = placeNodes(graph);
  if (nodes.length === 0) return null;

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const pad = 36;
  const minX = Math.min(...nodes.map((node) => node.x)) - pad;
  const minY = Math.min(...nodes.map((node) => node.y)) - pad;
  const width = Math.max(...nodes.map((node) => node.x + node.w)) - minX + pad;
  const height = Math.max(...nodes.map((node) => node.y + node.h)) - minY + pad;
  const wires = (graph.picture?.wires ?? []).flatMap((wire) => {
    const from = byId.get(wire.from);
    const to = byId.get(wire.to);
    if (!from || !to) return [];
    return [{ ...wire, fromNode: from, toNode: to }];
  });
  const clipId = `nodes-${label.replace(/[^a-z0-9]+/gi, "-")}`;

  const frameHeight = compact ? Math.min(256, height) : undefined;

  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-border bg-white">
      <div
        className={compact ? "overflow-hidden" : "max-h-[36rem] overflow-auto"}
        style={frameHeight ? { height: frameHeight } : undefined}
      >
        <svg
          role="img"
          aria-label={label}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="max-w-none bg-white"
        >
          <defs>
            <pattern id={`${clipId}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#d5dde8" />
            </pattern>
            {nodes.map((node) => (
              <clipPath id={`${clipId}-${node.id}`} key={node.id}>
                <rect
                  x={node.x - minX}
                  y={node.y - minY}
                  width={node.w}
                  height={node.h}
                  rx="8"
                />
              </clipPath>
            ))}
          </defs>
          <rect width={width} height={height} fill={`url(#${clipId}-grid)`} />
          <g>
            {wires.map((wire) => {
              const x1 = wire.fromNode.x + wire.fromNode.w - minX;
              const y1 = wire.fromNode.y + wire.fromNode.h / 2 - minY;
              const x2 = wire.toNode.x - minX;
              const y2 = wire.toNode.y + wire.toNode.h / 2 - minY;
              const backward = x2 < x1 - 8;
              const bend = Math.max(48, Math.abs(x2 - x1) * 0.45);
              const drop = backward ? 48 : 0;
              return (
                <path
                  key={`${wire.from}-${wire.to}-${wire.kind}`}
                  d={`M ${x1} ${y1} C ${x1 + bend} ${y1 + drop}, ${x2 - bend} ${y2 + drop}, ${x2} ${y2}`}
                  fill="none"
                  stroke={wire.kind === "exec" ? "#1f2937" : "#94a3b8"}
                  strokeWidth={wire.kind === "exec" ? 2.5 : 1.25}
                />
              );
            })}
            {nodes.map((node) => {
              const kind = kinds[node.kind] ?? { header: "#334155", label: "Node" };
              const x = node.x - minX;
              const y = node.y - minY;
              const cardId = `${clipId}-${node.id}`;
              const title =
                node.title.length > 28 ? `${node.title.slice(0, 27)}…` : node.title;
              return (
                <g key={node.id}>
                  <g clipPath={`url(#${cardId})`}>
                    <rect x={x} y={y} width={node.w} height={node.h} fill="#ffffff" />
                    <rect x={x} y={y} width={node.w} height="24" fill={kind.header} />
                    <text
                      x={x + 10}
                      y={y + 16}
                      fill="#ffffff"
                      fontSize="12"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {title}
                    </text>
                    <text
                      x={x + 10}
                      y={y + 40}
                      fill="#526173"
                      fontSize="11"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {kind.label}
                    </text>
                  </g>
                  <rect
                    x={x}
                    y={y}
                    width={node.w}
                    height={node.h}
                    rx="8"
                    fill="none"
                    stroke="#c5ced9"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

export function NodeGallery({ figures }: { figures: NodeFigure[] }) {
  if (figures.length === 0) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {figures.map((figure) => (
        <Link
          key={`${figure.href}-${figure.graph.name}`}
          href={figure.href}
          className="block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <NodeGraph
            graph={figure.graph}
            compact
            label={`${figure.assetName} · ${figure.graph.name}`}
          />
        </Link>
      ))}
    </div>
  );
}
