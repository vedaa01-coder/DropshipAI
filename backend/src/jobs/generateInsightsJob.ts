import { getSavedProducts, saveInsights } from "../services/firestoreService.ts";
import { generateRuleBasedInsights } from "../services/ruleBasedInsightService.ts";
import { enhanceInsightsWithAi } from "../services/aiInsightService.ts";

export async function generateInsightsJob(): Promise<void> {
  const products = await getSavedProducts();

  const ruleInsights = generateRuleBasedInsights(products);
  const enhancedInsights = await enhanceInsightsWithAi(ruleInsights);

  await saveInsights(enhancedInsights);
}

