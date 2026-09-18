"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import type { NavItem } from "@/lib/nav";

export function NavLink({
  item,
  variant,
}: {
  item: NavItem;
  variant: "top" | "left";
}) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (variant === "top") {
    return (
      <Link
        href={item.href}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
          active
            ? "bg-white/10 text-foreground"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand/15 text-foreground ring-1 ring-brand/40"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}
