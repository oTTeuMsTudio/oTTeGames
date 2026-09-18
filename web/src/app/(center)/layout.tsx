import { GameCenterShell } from "@/components/game-center/shell";

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GameCenterShell>{children}</GameCenterShell>;
}
