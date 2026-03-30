import type { DailyInsight } from "../types/insight.ts";
import { getProductById } from "./firestoreService.ts";
import { buildInsightRewritePrompt } from "../prompts/insightPrompts.ts";
import { generateShortAiText } from "./aiService.ts";
import { env } from "../config/env.ts";

export async function enhanceInsightsWithAi(
  insights: DailyInsight[]
): Promise<DailyInsight[]> {
  const enhanced: DailyInsight[] = [];

  const MAX_CALLS = env.maxAiCallsPerRun;
  const USE_AI = env.useAI;

  let aiCallsUsed = 0;

  const sortedInsights = [...insights].sort(
    (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  console.log("USE_AI:", USE_AI);
  console.log("MAX_AI_CALLS_PER_RUN:", MAX_CALLS);

  for (const insight of sortedInsights) {
    try {
      const product = await getProductById(insight.productId);

      let aiSummary = insight.message;

      
      if (USE_AI && aiCallsUsed < MAX_CALLS && product) {
        const prompt = buildInsightRewritePrompt(insight, product);
        aiSummary = await generateShortAiText(prompt);
        aiCallsUsed++;
      } else {
        aiSummary = insight.message;
      }

      enhanced.push({
        ...insight,
        aiSummary,
      });
    } catch (_error) {
      enhanced.push({
        ...insight,
        aiSummary: insight.message,
      });
    }
  }

  console.log("AI calls used:", aiCallsUsed);

  return enhanced;
}