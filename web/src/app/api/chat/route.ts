import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

const instructions = `You are oTTe Bot, the in-app concierge for the oTTeGames game center.

Studio facts:
- oTTeGames is an independent game studio.
- The live catalog currently features FGIU, a third-person 3D platformer built in Unreal Engine 5.8 for Windows.
- FGIU is a playable Windows build with floating-island platforming.
- Studio Lab is a coming-soon holding bay for prototypes, not a playable game.

Be concise, practical, and friendly. Help players pick a game, explain FGIU, and point them to Library, Downloads, News, Community, or Support. If you do not know something, say so instead of inventing patch notes or prices.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: process.env.XAI_API_KEY ? xai.responses("grok-4.6") : "xai/grok-4.6",
    instructions,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
