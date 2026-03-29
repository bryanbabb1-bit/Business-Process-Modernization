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

  return text.slice(startIdx);
}

/**
 * Send a prompt to Claude and get a structured JSON response.
 * Uses tool_use for guaranteed valid JSON output.
 */
export async function aiJsonRequest<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<T> {
  const anthropic = getClient();
  const maxTokens = options?.maxTokens ?? 4096;

  log("INFO", "ai-client", `Sending request (max ${maxTokens} tokens)`);

  // Use tool_use to guarantee structured JSON output.
  // We define a tool with a permissive schema and force the model to call it.
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    tools: [
      {
        name: "deliver_json",
        description:
          "Deliver the complete JSON result. You MUST call this tool with your full response as the data parameter.",
        input_schema: {
          type: "object" as const,
          additionalProperties: true,
        },
      },
    ],
    tool_choice: { type: "tool" as const, name: "deliver_json" },
  });

  // Extract the tool_use result
  const toolBlock = message.content.find((b) => b.type === "tool_use");
  if (toolBlock && toolBlock.type === "tool_use") {
    log("INFO", "ai-client", "Got structured tool_use response");
    return toolBlock.input as T;
  }

  // Fallback: if somehow no tool_use block, try text extraction
  log("WARN", "ai-client", "No tool_use block found, falling back to text extraction");
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No response from AI");
  }

  const rawResponse = textBlock.text.trim();

  try {
    return JSON.parse(rawResponse) as T;
  } catch {
    try {
      const extracted = extractJson(rawResponse);
      return JSON.parse(extracted) as T;
    } catch (err) {
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
