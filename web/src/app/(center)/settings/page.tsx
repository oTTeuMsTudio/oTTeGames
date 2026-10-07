import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Center preferences. The page background is white.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The shell is white so the page stays bright. Game art stays in the
          covers and heroes. The oTTeGames mark sits on a white pad at the top
          left so the logo stays true to its background.
        </CardContent>
      </Card>
    </div>
  );
}
