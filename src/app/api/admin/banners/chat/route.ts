import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { buildBannerTools } from "@/lib/canva/agent-tools";

// Canva export polling is async/slow — give the function room.
export const maxDuration = 60;

const MODEL = "anthropic/claude-opus-4-8";

const SYSTEM_PROMPT = `You are the banner studio assistant for Hyperdome Car Wash,
a hand-finished car wash and detailing business in Logan, Queensland (locations at
Shailer Park and Loganholme, inside Hyperdome Shopping Centre).

Your job: help an admin design a promotional website banner, then create it in Canva.

How to work:
- Briefly confirm the banner's purpose, headline, any offer/price, and the call to
  action. Keep the brand voice clean, confident and local. Don't over-ask — if the
  request is clear, proceed.
- When you have the copy, call create_banner_design, then immediately call
  export_banner with the returned bannerId to render and store it.
- After export_banner succeeds, tell the admin the banner is ready to preview and
  that they can click "Set live" to publish it to the homepage.
- Write concise alt text describing the finished banner for accessibility.
- If a tool reports the design was blank (no brand template configured), say so
  plainly so the admin knows to set up CANVA_BRAND_TEMPLATE_ID.`;

export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await currentUser();
  const createdBy = user?.primaryEmailAddress?.emailAddress ?? "admin";

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: buildBannerTools({ createdBy }),
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}