"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type Kind = "b" | "c" | "r";

type NodeRow = {
  k: Kind;
  g: string;
  n: string;
  p: string;
};

const DOC = "https://dev.epicgames.com/documentation/unreal-engine/";
const ROW_HEIGHT = 34;
const COLUMNS =
  "grid-cols-[3.25rem_7.5rem_minmax(9rem,1.1fr)_minmax(11rem,1.4fr)_6.5rem]";

const KIND_LABEL: Record<Kind, string> = {
  b: "Node",
  c: "Blueprint",
  r: "Node reference",
};

function docUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${DOC}${path}`;
}

export function NodeSheet() {
  const [rows, setRows] = useState<NodeRow[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(640);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () => setViewport(element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    fetch("/ue-nodes.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Index request failed (${response.status})`);
        return response.json() as Promise<NodeRow[]>;
      })
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load the index");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const deferredQuery = useDeferredValue(query);
  const deferredKind = useDeferredValue(kind);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = deferredQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (deferredKind !== "all" && row.k !== deferredKind) return false;
      if (!needle) return true;
      return (
        row.n.toLowerCase().includes(needle) || row.g.toLowerCase().includes(needle)
      );
    });
  }, [rows, deferredQuery, deferredKind]);

  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 8);
  const count = Math.ceil(viewport / ROW_HEIGHT) + 16;
  const visible = filtered.slice(start, start + count);

  return (
    <section
      id="sheet"
      className="flex h-[min(40rem,calc(100dvh-9rem))] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <label className="sr-only" htmlFor="node-search">
          Search nodes and blueprints
        </label>
        <input
          id="node-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (scroller.current) scroller.current.scrollTop = 0;
            setScrollTop(0);
          }}
          placeholder="Search nodes and blueprints"
          className="h-8 min-w-56 flex-1 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          aria-label="Kind"
          value={kind}
          onChange={(event) => {
            setKind(event.target.value as "all" | Kind);
            if (scroller.current) scroller.current.scrollTop = 0;
            setScrollTop(0);
          }}
          className="h-8 rounded-md border border-input bg-white px-2 text-sm"
        >
          <option value="all">All kinds</option>
          <option value="b">Nodes</option>
          <option value="c">Blueprints</option>
          <option value="r">Node reference</option>
        </select>
        <p className="text-xs text-muted-foreground">
          {rows ? `${filtered.length.toLocaleString()} rows` : "Loading index"}
        </p>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          ref={scroller}
          className="h-full overflow-auto"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div className="min-w-[44rem]">
            <div
              className={`sticky top-0 z-10 grid ${COLUMNS} border-b border-border bg-muted text-xs font-medium tracking-wide text-muted-foreground uppercase`}
            >
              <div className="px-3 py-2">#</div>
              <div className="px-3 py-2">Kind</div>
              <div className="px-3 py-2">Group</div>
              <div className="px-3 py-2">Name</div>
              <div className="px-3 py-2">Explanation</div>
            </div>

            {error ? (
              <p className="px-3 py-6 text-sm text-destructive">{error}</p>
            ) : null}

            {!error && rows && filtered.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">
                No nodes or blueprints match this search.
              </p>
            ) : null}

            <div style={{ height: filtered.length * ROW_HEIGHT, position: "relative" }}>
              {visible.map((row, index) => {
                const rowIndex = start + index;
                return (
                  <div
                    key={`${row.p}:${row.n}:${rowIndex}`}
                    className={`absolute right-0 left-0 grid ${COLUMNS} border-b border-border text-sm hover:bg-muted/70`}
                    style={{ top: rowIndex * ROW_HEIGHT, height: ROW_HEIGHT }}
                  >
                    <div className="truncate px-3 py-1.5 text-muted-foreground tabular-nums">
                      {rowIndex + 1}
                    </div>
                    <div className="truncate px-3 py-1.5">{KIND_LABEL[row.k]}</div>
                    <div className="truncate px-3 py-1.5" title={row.g}>
                      {row.g}
                    </div>
                    <div className="truncate px-3 py-1.5 font-medium" title={row.n}>
                      {row.n}
                    </div>
                    <div className="px-3 py-1.5">
                      <a
                        href={docUrl(row.p)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-700 underline-offset-2 hover:underline"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
