import { TopMenu, type DocLink } from "@/components/docs/top-menu";
import menu from "@/data/ue-menu.json";
import meta from "@/data/ue-meta.json";

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh justify-center px-3 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:h-dvh lg:overflow-hidden lg:px-6 lg:py-0">
      <div className="flex w-full max-w-5xl flex-col lg:h-full">
        <TopMenu menu={menu as DocLink[]} menuLinks={meta.menuLinks} />
        <main className="flex flex-col py-3 lg:min-h-0 lg:flex-1">{children}</main>
      </div>
    </div>
  );
}
