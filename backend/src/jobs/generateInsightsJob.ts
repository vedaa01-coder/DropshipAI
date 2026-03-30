import { getSavedProducts, saveInsights } from "../services/firestoreService.ts";
import { generateRuleBasedInsights } from "../services/insightService.ts";

export async function generateInsightsJob(): Promise<void> {
  const products = await getSavedProducts();
  const insights = generateRuleBasedInsights(products);
  await saveInsights(insights);
}