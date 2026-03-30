import OpenAI from "openai";
import { env } from "../config/env.ts";

const client = new OpenAI({
  apiKey: env.openaiApiKey,
});

const promptCache = new Map<string, string>();

function makeCacheKey(prompt: string): string {
  return prompt.trim();
}

function extractText(response: any): string {
  return response.output
    ?.filter((item: any) => item.type === "message")
    ?.flatMap((item: any) => item.content || [])
    ?.filter((c: any) => c.type === "output_text")
    ?.map((c: any) => c.text)
    ?.join(" ")
    ?.trim() || "";
}

export async function generateShortAiText(prompt: string): Promise<string> {
  const cacheKey = makeCacheKey(prompt);

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }

  console.log("OPENAI KEY LOADED:", !!env.openaiApiKey);
  console.log("PROMPT:", prompt);
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 60,
    });

    console.log("RAW RESPONSE:", JSON.stringify(response, null, 2));

    const text = extractText(response);

    console.log("AI response:", text);

    promptCache.set(cacheKey, text);

    return text;
  } catch (error: any) {
    console.error("OPENAI CALL FAILED");
    console.error("OpenAI error:", error?.message);
    console.error("status:", error?.status);
    console.error("name:", error?.name);
    console.error("full error:", error);
    

        if (error?.status === 429 || error?.code === "insufficient_quota") {
            return "AI insights temporarily unavailable because API quota is exhausted.";
        }
    return "";
   // throw error;
  }
}