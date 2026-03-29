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
 * Extract the outermost JSON object/array from a string using bracket matching.
 * Handles nested brackets inside JSON string values correctly.
 */
function extractJson(text: string): string {
  const startIdx = text.search(/[{[]/);
  if (startIdx === -1) throw new Error("No JSON object found in response");

  const openChar = text[startIdx];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(startIdx, i + 1);
      }
    }
  }

  // If we hit the end without closing, the response was likely truncated.
  // Return what we have and let JSON.parse report the specific error.
  return text.slice(startIdx);
}

/**
 * Send a prompt to Claude and get a structured JSON response.
 * Uses the prefill technique to force pure JSON output.
 */
export async function aiJsonRequest<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<T> {
  const anthropic = getClient();
  const maxTokens = options?.maxTokens ?? 4096;

  log("INFO", "ai-client", `Sending request (max ${maxTokens} tokens)`);

  // Use prefill: start the assistant response with "{" to force JSON mode
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt },
      { role: "assistant", content: "{" },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Prepend the "{" we used as prefill
  const rawResponse = "{" + textBlock.text;

  try {
    // First try: direct parse (works when the AI returns clean JSON)
    return JSON.parse(rawResponse) as T;
  } catch {
    // Second try: extract JSON using bracket matching
    try {
      const extracted = extractJson(rawResponse);
      return JSON.parse(extracted) as T;
    } catch (err) {
      // Log first 500 chars of the response for debugging
      log(
        "ERROR",
        "ai-client:parse",
        `Failed to parse. Response starts with: ${rawResponse.slice(0, 500)}`
      );
      logError("ai-client:parse", err);
      throw new Error("Failed to parse AI response as JSON");
    }
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
