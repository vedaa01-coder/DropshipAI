import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { saveProducts, saveInsights } from "../services/firestoreService.ts";
import { generateRuleBasedInsights } from "../services/ruleBasedInsightService.ts";
import { rankInsights } from "../services/insightRankingService.ts";
import { enhanceInsightsWithAi } from "../services/aiInsightService.ts";
import { createAiRunContext } from "../services/aiService.ts";
import { generateOpportunitiesJob } from "./generateOpportunitiesJob.ts";
import type { AppUserConfig } from "../types/user.ts";
import type { StandardProduct } from "../types/product.ts";

export async function runDailyPipelineForUser(user: AppUserConfig): Promise<void> {
  const shopifyAdapter = new ShopifyAdapter();

  const products: StandardProduct[] = await shopifyAdapter.syncProducts(
    user.userId,
    user.country,
    user.shopDomain,
    user.accessToken
  );

  await saveProducts(user.userId, products);

  const ruleInsights = generateRuleBasedInsights(products);
  const rankedInsights = rankInsights(ruleInsights, products);

  const aiContext = createAiRunContext();
  const enhancedInsights = await enhanceInsightsWithAi(
    user.userId,
    rankedInsights,
    aiContext
  );

  await saveInsights(user.userId, enhancedInsights);

  await generateOpportunitiesJob(user.userId, user.country, user.niche);
}