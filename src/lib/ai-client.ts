import Anthropic from "@anthropic-ai/sdk";
import { log, logError } from "@/lib/logger";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Add it to your .env file."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Send a prompt to Claude and get a structured JSON response.
 */
export async function aiJsonRequest<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<T> {
  const anthropic = getClient();
  const maxTokens = options?.maxTokens ?? 4096;

  log("INFO", "ai-client", `Sending request (max ${maxTokens} tokens)`);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Extract JSON from response (handle markdown code blocks with any language tag)
  let jsonStr = textBlock.text.trim();
  const jsonMatch = jsonStr.match(/```\w*\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // If still not starting with { or [, try to find the first JSON object
  if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
    const objStart = jsonStr.indexOf("{");
    const arrStart = jsonStr.indexOf("[");
    const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart);
    if (start !== -1) {
      jsonStr = jsonStr.slice(start);
    }
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    logError("ai-client:parse", err);
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Send a prompt to Claude and get a plain text response.
 */
export async function aiTextRequest(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const anthropic = getClient();
  const maxTokens = options?.maxTokens ?? 4096;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return textBlock.text;
}
