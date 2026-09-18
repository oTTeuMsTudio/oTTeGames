"use client";

import { Bot, Menu, Search } from "lucide-react";
import { useState } from "react";
import { AiBot } from "@/components/game-center/ai-bot";
import { StudioLogo } from "@/components/game-center/logo";
import { NavLink } from "@/components/game-center/nav-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { leftNav, topNav } from "@/lib/nav";

export function GameCenterShell({ children }: { children: React.ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 border-b border-border">
        <div className="w-16 shrink-0 bg-white md:w-56">
          <StudioLogo />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 bg-card px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setLeftOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
          <nav className="hidden items-center gap-1 md:flex">
            {topNav.map((item) => (
              <NavLink key={item.href} item={item} variant="top" />
            ))}
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <form action="/" className="relative hidden min-w-40 max-w-72 flex-1 sm:block">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search games" className="pl-8" />
            </form>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="xl:hidden"
              onClick={() => setBotOpen(true)}
            >
              <Bot className="size-4" />
              Bot
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <nav className="flex flex-col gap-1 p-3">
            {leftNav.map((item) => (
              <NavLink key={item.href + item.label} item={item} variant="left" />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>

        <aside className="hidden w-80 shrink-0 border-l border-border xl:block">
          <AiBot />
        </aside>
      </div>

      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 pb-4">
            {leftNav.map((item) => (
              <span key={item.href + item.label} onClick={() => setLeftOpen(false)}>
                <NavLink item={item} variant="left" />
              </span>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={botOpen} onOpenChange={setBotOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
          <AiBot />
        </SheetContent>
      </Sheet>
    </div>
  );
}
