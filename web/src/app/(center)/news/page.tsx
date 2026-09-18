import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "News" };

const posts = [
  {
    title: "FGIU Windows build is in the center",
    date: "September 2026",
    body: "The packaged Unreal 5.8 platformer now has a store page, library slot, and a studio bot that can answer questions about it.",
  },
  {
    title: "oTTeGames game center opens",
    date: "September 2026",
    body: "Store, library, and support live under one roof — with oTTe Bot on the right for quick help.",
  },
];

export default function NewsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">News</h1>
        <p className="text-sm text-muted-foreground">Studio updates and build notes.</p>
      </header>
      {posts.map((post) => (
        <Card key={post.title}>
          <CardHeader>
            <p className="text-xs text-muted-foreground">{post.date}</p>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{post.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
