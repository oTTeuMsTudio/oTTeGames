import type { Metadata } from "next";
import Link from "next/link";
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
          <CardTitle>Where is the Blueprint Book?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Open Book in the top menu, or Blueprint Book in the left menu. The
            menu is the book&apos;s contents: three parts, then each chapter.
            Open a chapter and its Blueprints appear underneath.
          </p>
          <p>
            Pages only repeat what the editor dump stored. Parent classes,
            widget trees, and enum display names were blank, and BP_Keyport did
            not load. The{" "}
            <Link href="/book" className="underline underline-offset-4">
              overview
            </Link>{" "}
            explains that, and Downloads has the PDF.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Where is my library?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Open Library in the top or left menu. Playable titles appear there,
          the Blueprint Book is under Reading, and coming-soon prototypes stay
          on the store.
        </CardContent>
      </Card>
    </div>
  );
}
