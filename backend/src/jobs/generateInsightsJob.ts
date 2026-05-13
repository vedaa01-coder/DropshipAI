import { getSavedProducts, saveInsights } from "../services/firestoreService.ts";
import { generateRuleBasedInsights } from "../services/ruleBasedInsightService.ts";
import { enhanceInsightsWithAi } from "../services/aiInsightService.ts";
import { rankInsights } from "../services/insightRankingService.ts";
import { createAiRunContext } from "../services/aiService.ts";

export async function generateInsightsJob(userId: string): Promise<void> {
  const products = await getSavedProducts(userId);

  const ruleInsights = generateRuleBasedInsights(products);
  const rankedInsights = rankInsights(ruleInsights, products);

  const aiContext = createAiRunContext();
  const enhancedInsights = await enhanceInsightsWithAi(userId, rankedInsights, aiContext);

  await saveInsights(userId, enhancedInsights);
}