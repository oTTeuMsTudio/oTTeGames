"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { book } from "@/lib/book";

export function BookMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const chapterSlug = segments[0] === "book" ? segments[1] : undefined;
  const assetSlug = segments[0] === "book" ? segments[2] : undefined;
  const overview = pathname === "/book";

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="px-3 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        Blueprint Book
      </p>
      <Link
        href="/book"
        onClick={onNavigate}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm font-medium",
          overview
            ? "bg-brand/15 text-foreground ring-1 ring-brand/40"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-current={overview ? "page" : undefined}
      >
        Overview
      </Link>
      {book.parts.map((part) => (
        <div key={part.key} className="mt-2">
          <p className="px-3 pt-1 text-[10px] leading-4 font-medium tracking-wide text-muted-foreground uppercase">
            {part.title}
          </p>
          {part.chapters.map((chapter) => {
            const open = chapter.slug === chapterSlug;
            const chapterHref = `/book/${chapter.slug}`;
            return (
              <div key={chapter.slug}>
                <Link
                  href={chapterHref}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-lg px-3 py-1.5 text-xs leading-4",
                    open
                      ? "bg-brand/15 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={open && !assetSlug ? "page" : undefined}
                >
                  {chapter.title}
                </Link>
                {open
                  ? chapter.assets.map((asset) => {
                      const href = `${chapterHref}/${asset.slug}`;
                      const active = asset.slug === assetSlug;
                      return (
                        <Link
                          key={asset.slug}
                          href={href}
                          onClick={onNavigate}
                          className={cn(
                            "block rounded-md py-1 pr-2 pl-6 font-mono text-[11px] leading-4",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          {asset.name}
                        </Link>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
