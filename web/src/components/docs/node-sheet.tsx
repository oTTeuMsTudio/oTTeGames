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
const CARD_HEIGHT = 92;
const PHONE_QUERY = "(max-width: 1023px)";
const COLUMNS =
  "grid-cols-[3.25rem_7.5rem_minmax(9rem,1.1fr)_minmax(11rem,1.4fr)_6.5rem]";

const KIND_LABEL: Record<Kind, string> = {
  b: "Node",
  c: "Blueprint",
  r: "Node reference",
};

const KIND_SHORT: Record<Kind, string> = {
  b: "Node",
  c: "Blueprint",
  r: "Reference",
};

const KIND_STYLE: Record<Kind, string> = {
  b: "bg-sky-100 text-sky-950 ring-sky-300",
  c: "bg-amber-100 text-amber-950 ring-amber-300",
  r: "bg-violet-100 text-violet-950 ring-violet-300",
};

const KIND_BAR: Record<Kind, string> = {
  b: "border-l-sky-600",
  c: "border-l-amber-600",
  r: "border-l-violet-600",
};

const FILTERS: { id: "all" | Kind; label: string; on: string }[] = [
  { id: "all", label: "All", on: "bg-indigo-700 text-white" },
  { id: "b", label: "Nodes", on: "bg-sky-700 text-white" },
  { id: "c", label: "Blueprints", on: "bg-amber-700 text-white" },
  { id: "r", label: "Reference", on: "bg-violet-700 text-white" },
];

function docUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${DOC}${path}`;
}

function KindPill({ kind }: { kind: Kind }) {
  return (
    <span
      title={KIND_LABEL[kind]}
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${KIND_STYLE[kind]}`}
    >
      {KIND_SHORT[kind]}
    </span>
  );
}

function OpenLink({ path, tall = false }: { path: string; tall?: boolean }) {
  return (
    <a
      href={docUrl(path)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-orange-700 font-semibold text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
        tall ? "h-11 px-4 text-sm" : "h-6 px-2.5 text-[11px]"
      }`}
    >
      Open
    </a>
  );
}

export function NodeSheet() {
  const [rows, setRows] = useState<NodeRow[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [desktopScroll, setDesktopScroll] = useState(0);
  const [desktopViewport, setDesktopViewport] = useState(640);
  const [mobileScroll, setMobileScroll] = useState(0);
  const [mobileViewport, setMobileViewport] = useState(800);
  const scroller = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () => setDesktopViewport(element.clientHeight || 640);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [rows]);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const list = listRef.current;
        const listTop = list ? list.getBoundingClientRect().top + window.scrollY : 0;
        const next = Math.max(0, window.scrollY - listTop);
        const height = window.innerHeight;
        setMobileScroll((prev) => (prev === next ? prev : next));
        setMobileViewport((prev) => (prev === height ? prev : height));
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
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

  function resetScroll() {
    if (scroller.current) scroller.current.scrollTop = 0;
    setDesktopScroll(0);
    setMobileScroll(0);
    if (window.matchMedia(PHONE_QUERY).matches && window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }

  const desktopStart = Math.max(0, Math.floor(desktopScroll / ROW_HEIGHT) - 8);
  const desktopCount = Math.ceil(desktopViewport / ROW_HEIGHT) + 16;
  const desktopVisible = filtered.slice(desktopStart, desktopStart + desktopCount);
  const mobileStart = Math.max(0, Math.floor(mobileScroll / CARD_HEIGHT) - 6);
  const mobileCount = Math.ceil(mobileViewport / CARD_HEIGHT) + 12;
  const mobileVisible = filtered.slice(mobileStart, mobileStart + mobileCount);

  return (
    <section
      id="sheet"
      className="flex w-full flex-col rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-900/10 lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-hidden"
    >
      <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-2 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 px-3 py-3 lg:static">
        <label className="sr-only" htmlFor="node-search">
          Search nodes and blueprints
        </label>
        <input
          id="node-search"
          value={query}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(event) => {
            setQuery(event.target.value);
            resetScroll();
          }}
          placeholder="Search nodes and blueprints"
          className="h-11 w-full rounded-full border border-sky-200 bg-white px-4 text-base text-sky-950 outline-none focus-visible:ring-2 focus-visible:ring-sky-600 lg:h-9 lg:min-w-56 lg:flex-1 lg:text-sm"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Kind">
            {FILTERS.map((item) => {
              const selected = kind === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setKind(item.id);
                    resetScroll();
                  }}
                  className={`h-11 rounded-full px-3 text-sm font-semibold lg:h-8 ${
                    selected
                      ? item.on
                      : "bg-white text-sky-950 ring-1 ring-sky-200 hover:bg-sky-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-900 lg:ml-auto">
            {rows ? `${filtered.length.toLocaleString()} rows` : "Loading index"}
          </p>
        </div>
      </div>

      {error ? (
        <p className="px-3 py-6 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {!error && rows && filtered.length === 0 ? (
        <p className="px-3 py-6 text-sm text-sky-800">
          No nodes or blueprints match this search.
        </p>
      ) : null}

      <div className="hidden min-h-0 min-w-0 lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden">
        <div
          ref={scroller}
          className="h-full overflow-auto overscroll-contain"
          onScroll={(event) => setDesktopScroll(event.currentTarget.scrollTop)}
        >
          <div className="min-w-[44rem]">
            <div
              className={`sticky top-0 z-10 grid ${COLUMNS} bg-gradient-to-r from-sky-700 via-indigo-600 to-violet-700 text-xs font-semibold tracking-wide text-white uppercase`}
            >
              <div className="px-3 py-2">#</div>
              <div className="px-3 py-2">Kind</div>
              <div className="px-3 py-2">Group</div>
              <div className="px-3 py-2">Name</div>
              <div className="px-3 py-2">Explanation</div>
            </div>

            <div style={{ height: filtered.length * ROW_HEIGHT, position: "relative" }}>
              {desktopVisible.map((row, index) => {
                const rowIndex = desktopStart + index;
                return (
                  <div
                    key={`${row.p}:${row.n}:${rowIndex}`}
                    className={`absolute right-0 left-0 grid ${COLUMNS} items-center border-b border-sky-100 text-sm hover:bg-amber-50 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-sky-50"
                    }`}
                    style={{ top: rowIndex * ROW_HEIGHT, height: ROW_HEIGHT }}
                  >
                    <div className="truncate px-3 text-sky-700 tabular-nums">
                      {rowIndex + 1}
                    </div>
                    <div className="px-3">
                      <KindPill kind={row.k} />
                    </div>
                    <div className="truncate px-3 text-sky-950/80" title={row.g}>
                      {row.g}
                    </div>
                    <div className="truncate px-3 font-medium text-slate-950" title={row.n}>
                      {row.n}
                    </div>
                    <div className="px-3">
                      <OpenLink path={row.p} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="relative lg:hidden"
        style={{ height: filtered.length * CARD_HEIGHT }}
      >
        {mobileVisible.map((row, index) => {
          const rowIndex = mobileStart + index;
          return (
            <article
              key={`${row.p}:${row.n}:${rowIndex}`}
              className={`absolute right-0 left-0 overflow-hidden border-b border-l-4 border-sky-100 px-3 ${KIND_BAR[row.k]} ${
                rowIndex % 2 === 0 ? "bg-white" : "bg-sky-50"
              }`}
              style={{ top: rowIndex * CARD_HEIGHT, height: CARD_HEIGHT }}
            >
              <div className="flex h-full items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-xs font-semibold text-sky-700 tabular-nums">
                      {rowIndex + 1}
                    </span>
                    <KindPill kind={row.k} />
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-950" title={row.n}>
                    {row.n}
                  </p>
                  <p className="truncate text-xs text-sky-900/70" title={row.g}>
                    {row.g}
                  </p>
                </div>
                <OpenLink path={row.p} tall />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
