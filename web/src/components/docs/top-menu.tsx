"use client";

import { useState } from "react";

export type DocLink = {
  title: string;
  href: string;
  children?: DocLink[];
};

const linkClass =
  "rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

export function TopMenu({
  menu,
  menuLinks,
}: {
  menu: DocLink[];
  menuLinks: number;
}) {
  const [categoryHref, setCategoryHref] = useState<string | null>(null);
  const [groupHref, setGroupHref] = useState<string | null>(null);
  const category = menu.find((item) => item.href === categoryHref) ?? null;
  const group = category?.children?.find((item) => item.href === groupHref) ?? null;

  function chooseCategory(href: string) {
    setCategoryHref((current) => (current === href ? null : href));
    setGroupHref(null);
  }

  return (
    <header className="shrink-0 border-b border-border bg-white">
      <div className="flex h-11 items-center gap-3">
        <a href="#sheet" className="shrink-0 text-sm font-semibold tracking-tight">
          oTTeGames
        </a>
        <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          Unreal Engine 5.8
        </p>
        <p className="ml-auto shrink-0 text-xs text-muted-foreground">
          {menuLinks > 0 ? `${menuLinks.toLocaleString()} docs` : "Docs"}
        </p>
      </div>
      <nav aria-label="Unreal Engine documentation" className="flex flex-wrap gap-1 pb-2">
        {menu.map((section) => {
          const selected = section.href === categoryHref;
          return (
            <button
              key={section.href}
              type="button"
              aria-expanded={selected}
              onClick={() => chooseCategory(section.href)}
              className={`rounded-md px-2 py-1 text-left text-sm ${
                selected ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </nav>
      {category ? (
        <div className="flex max-h-32 flex-wrap content-start gap-1 overflow-y-auto border-t border-border py-2">
          <a href={category.href} target="_blank" rel="noreferrer" className={linkClass}>
            {category.title}
          </a>
          {(category.children ?? []).map((child) => {
            const nested = child.children ?? [];
            if (nested.length === 0) {
              return (
                <a
                  key={child.href}
                  href={child.href}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  {child.title}
                </a>
              );
            }
            const selected = child.href === groupHref;
            return (
              <button
                key={child.href}
                type="button"
                aria-expanded={selected}
                onClick={() => setGroupHref(selected ? null : child.href)}
                className={`rounded-md px-2 py-1 text-left text-sm ${
                  selected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {child.title}
              </button>
            );
          })}
        </div>
      ) : null}
      {group && (group.children?.length ?? 0) > 0 ? (
        <div className="flex max-h-28 flex-wrap content-start gap-1 overflow-y-auto border-t border-border py-2">
          {group.children?.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              {link.title}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
