import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Support</h1>
        <p className="text-sm text-muted-foreground">
          Common answers. Ask oTTe Bot on the right for anything else.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>FGIU will not launch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            FGIU is a Windows Unreal Engine 5.8 build. Run the packaged
            executable on a machine with up-to-date GPU drivers. Visual C++
            redistributables ship beside the build.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Where is my library?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Open Library in the top or left menu. Playable titles appear there;
          coming-soon prototypes stay on the store.
        </CardContent>
      </Card>
    </div>
  );
}
