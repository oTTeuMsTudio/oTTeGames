export type DocLink = {
  title: string;
  href: string;
  children?: DocLink[];
};

function flatten(links: DocLink[] = []): DocLink[] {
  return links.flatMap((link) => [link, ...flatten(link.children)]);
}

export function TopMenu({
  menu,
  menuLinks,
}: {
  menu: DocLink[];
  menuLinks: number;
}) {
  return (
    <header className="shrink-0 border-b border-border bg-white">
      <div className="flex h-11 items-center gap-3 px-3">
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
      <nav
        aria-label="Unreal Engine documentation"
        className="flex h-10 items-center gap-1 overflow-x-auto px-2"
      >
        {menu.map((section) => {
          const links = flatten(section.children);
          return (
            <div key={section.href} className="flex shrink-0 items-center">
              <a
                href={section.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-2 py-1 text-sm font-medium hover:bg-muted"
              >
                {section.title}
              </a>
              {links.map((link) => (
                <a
                  key={`${section.href}:${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {link.title}
                </a>
              ))}
              <span aria-hidden className="mx-1 h-4 w-px bg-border" />
            </div>
          );
        })}
      </nav>
    </header>
  );
}
