import type { DailyInsight } from "../types/insight.ts";
import { getProductById } from "./firestoreService.ts";
import { buildInsightRewritePrompt } from "../prompts/insightPrompts.ts";
import { generateManagedAiText, type AiRunContext } from "./aiService.ts";

export async function enhanceInsightsWithAi(
  insights: DailyInsight[],
  ctx: AiRunContext
): Promise<DailyInsight[]> {
  const enhanced: DailyInsight[] = [];

  const sortedInsights = [...insights].sort(
    (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  console.log("USE_AI:", ctx.useAI);
  console.log("MAX_AI_CALLS_PER_RUN:", ctx.maxCalls);

  for (const insight of sortedInsights) {
    try {
      const product = await getProductById(insight.productId);

      let aiSummary = insight.message;

      if (product) {
        const prompt = buildInsightRewritePrompt(insight, product);
        aiSummary = await generateManagedAiText(prompt, insight.message, ctx);
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

  console.log("AI calls used:", ctx.callsUsed);

  return enhanced;
}