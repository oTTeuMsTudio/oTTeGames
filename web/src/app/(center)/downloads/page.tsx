import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Downloads" };

export default function DownloadsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Downloads</h1>
        <p className="text-sm text-muted-foreground">
          Local Windows builds stay on your machine. This page tracks status.
        </p>
      </header>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>FGIU · Windows</CardTitle>
          <Badge>Ready locally</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Packaged Unreal build detected in the studio workspace. Launch from
          your Windows package folder — it is not hosted as a browser download.
        </CardContent>
      </Card>
    </div>
  );
}
