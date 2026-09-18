import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Center preferences. Dark mode is the default for the game center.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The shell stays dark so game art can lead. The oTTeGames mark sits on
          a white pad at the top left so the logo stays true to its background.
        </CardContent>
      </Card>
    </div>
  );
}
