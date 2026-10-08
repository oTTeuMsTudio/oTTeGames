import { TopMenu, type DocLink } from "@/components/docs/top-menu";
import menu from "@/data/ue-menu.json";
import meta from "@/data/ue-meta.json";

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <TopMenu menu={menu as DocLink[]} menuLinks={meta.menuLinks} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
