"use client";

import { useState } from "react";

export type DocLink = {
  title: string;
  href: string;
  children?: DocLink[];
};

const row =
  "flex gap-1.5 overflow-x-auto overscroll-x-contain py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const chip =
  "min-h-11 shrink-0 rounded-full px-3 py-2 text-sm font-medium lg:min-h-0 lg:px-2.5 lg:py-1";

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
    <header className="shrink-0 border-b border-sky-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-12 items-center gap-2">
        <a
          href="#sheet"
          className="shrink-0 bg-gradient-to-r from-sky-700 via-indigo-600 to-orange-600 bg-clip-text text-base font-bold tracking-tight text-transparent"
        >
          oTTeGames
        </a>
        <p className="hidden shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800 sm:block">
          Unreal Engine 5.8
        </p>
        <p className="ml-auto shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900">
          {menuLinks > 0 ? `${menuLinks.toLocaleString()} docs` : "Docs"}
        </p>
      </div>
      <nav
        aria-label="Unreal Engine documentation"
        className={`${row} lg:flex-wrap lg:overflow-visible`}
      >
        {menu.map((section) => {
          const selected = section.href === categoryHref;
          return (
            <button
              key={section.href}
              type="button"
              aria-expanded={selected}
              onClick={() => chooseCategory(section.href)}
              className={`${chip} ${
                selected
                  ? "bg-sky-700 text-white shadow-sm"
                  : "bg-white text-sky-950 ring-1 ring-sky-200 hover:bg-sky-50"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </nav>
      {category ? (
        <div
          className={`${row} border-t border-amber-100 lg:max-h-32 lg:flex-wrap lg:overflow-x-hidden lg:overflow-y-auto`}
        >
          <a
            href={category.href}
            target="_blank"
            rel="noreferrer"
            className={`${chip} bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200 hover:bg-emerald-100`}
          >
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
                  className={`${chip} bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200 hover:bg-emerald-100`}
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
                className={`${chip} ${
                  selected
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-950 ring-1 ring-amber-200 hover:bg-amber-100"
                }`}
              >
                {child.title}
              </button>
            );
          })}
        </div>
      ) : null}
      {group && (group.children?.length ?? 0) > 0 ? (
        <div
          className={`${row} border-t border-emerald-100 lg:max-h-28 lg:flex-wrap lg:overflow-x-hidden lg:overflow-y-auto`}
        >
          {group.children?.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`${chip} bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200 hover:bg-emerald-100`}
            >
              {link.title}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
