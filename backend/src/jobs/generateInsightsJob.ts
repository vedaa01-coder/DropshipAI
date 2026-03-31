import { getSavedProducts, saveInsights } from "../services/firestoreService.ts";
import { generateRuleBasedInsights } from "../services/ruleBasedInsightService.ts";
import { enhanceInsightsWithAi } from "../services/aiInsightService.ts";
import { rankInsights } from "../services/insightRankingService.ts";
import { createAiRunContext } from "../services/aiService.ts";

export async function generateInsightsJob(): Promise<void> {
  const products = await getSavedProducts();

  const ruleInsights = generateRuleBasedInsights(products);
  const rankedInsights = rankInsights(ruleInsights, products);

  const aiContext = createAiRunContext();
  const enhancedInsights = await enhanceInsightsWithAi(rankedInsights, aiContext);

  await saveInsights(enhancedInsights);
}