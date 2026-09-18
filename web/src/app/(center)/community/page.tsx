import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Community</h1>
        <p className="text-sm text-muted-foreground">
          Players, patch talk, and studio notes.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>FGIU first sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Share clips, jump routes, and timer resets from the Windows
            platformer build. The board opens as more players land.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
