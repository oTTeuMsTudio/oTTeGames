import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { bookFacts } from "@/lib/book";
import { tutorialFacts } from "@/lib/tutorial";

export const maxDuration = 30;

const instructions = `You are oTTe Bot, the in-app concierge for the oTTeGames game center.

Studio facts:
- oTTeGames is an independent game studio.
- The live catalog currently features FGIU, a third-person 3D platformer built in Unreal Engine 5.8 for Windows.
- FGIU is a playable Windows build with floating-island platforming.
- Studio Lab is a coming-soon holding bay for prototypes, not a playable game.
- Adventure Artist is a readable Blueprint Book on this site, not a downloadable game build.
- First Ten Million is a top-down tutorial at /tutorial. It is a reading path, not a downloadable build.

${bookFacts()}

${tutorialFacts()}

Be concise, practical, and friendly. Help players pick a game, explain FGIU, and explain the Blueprint Book using only the facts above. Point them to Library, Downloads, News, Community, Support, or /book. If you do not know something, say so instead of inventing patch notes, prices, or Blueprint details the dump left blank.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: process.env.XAI_API_KEY ? xai.responses("grok-4.6") : "xai/grok-4.6",
    instructions,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
