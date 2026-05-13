import type { DailyInsight } from "../types/insight.ts";
import { getProductById } from "./firestoreService.ts";
import { buildInsightRewritePrompt } from "../prompts/insightPrompts.ts";
import { generateManagedAiText, type AiRunContext } from "./aiService.ts";

export async function enhanceInsightsWithAi(
  userId: string,
  insights: DailyInsight[],
  ctx: AiRunContext
): Promise<DailyInsight[]> {
  const enhanced: DailyInsight[] = [];

  const sortedInsights = [...insights].sort(
    (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  for (const insight of sortedInsights) {
    try {
      const product = await getProductById(userId, insight.productId);

      let aiSummary = insight.message;

      if (product) {
        const prompt = buildInsightRewritePrompt(insight, product);
        aiSummary = await generateManagedAiText(prompt, insight.message, ctx);
      }

      enhanced.push({
        ...insight,
        aiSummary,
      });
    } catch {
      enhanced.push({
        ...insight,
        aiSummary: insight.message,
      });
    }
  }

  return enhanced;
}