import { getTrendSignals } from "../services/trendService.ts";
import { findBestSupplier } from "../services/supplierService.ts";
import {
  calculateDemandScore,
  calculateProfitScore,
  calculateCompetitionScore,
  calculateSupplierScore,
  calculateOpportunityScore,
} from "../services/scoringService.ts";
import { buildOpportunityPrompt } from "../prompts/opportunityPrompts.ts";
import {
  createAiRunContext,
  generateManagedAiText,
} from "../services/aiService.ts";
import { saveOpportunities } from "../services/firestoreService.ts";
import type { ProductOpportunity } from "../types/opportunity.ts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateOpportunitiesJob(
  userId: string,
  country: "US" | "IN",
  niche: string
): Promise<void> {
  const trends = await getTrendSignals(country, niche);
  const opportunities: ProductOpportunity[] = [];
  const aiContext = createAiRunContext();

  for (const trend of trends.slice(0, 8)) {
    await sleep(500);

    try {
      const supplier = await findBestSupplier(country, trend.keyword);
      if (!supplier) continue;

      const estimatedSellPrice = supplier.unitCost * 2.5;

      const demandScore = calculateDemandScore(
        trend.trendGrowthPct,
        trend.searchInterestScore,
        trend.socialMentionGrowthPct
      );

      const profitScore = calculateProfitScore(
        estimatedSellPrice,
        supplier.unitCost,
        supplier.shippingCost
      );

      const competitionScore = calculateCompetitionScore(250, 80);

      const supplierScore = calculateSupplierScore(
        supplier.supplierRating,
        supplier.supplierOrderVolume,
        supplier.shippingDays
      );

      const totalScore = calculateOpportunityScore({
        demandScore,
        profitScore,
        competitionScore,
        supplierScore,
      });

      const fallbackSummary = `${trend.keyword} shows promising demand and workable margins, but validate competition and supplier reliability before adding it to your catalog.`;

      const aiSummary = await generateManagedAiText(
        buildOpportunityPrompt({
          productName: trend.keyword,
          demandScore,
          profitScore,
          competitionScore,
          supplierScore,
          estimatedSellPrice,
          estimatedCost: supplier.unitCost,
          shippingCost: supplier.shippingCost,
          supplierName: supplier.supplierName,
          supplierRating: supplier.supplierRating,
        }),
        fallbackSummary,
        aiContext
      );

      opportunities.push({
        id: `${userId}-${country}-${niche}-${trend.keyword}`.replace(/\s+/g, "-"),
        userId,
        country,
        niche,
        productName: trend.keyword,
        demandScore,
        profitScore,
        competitionScore,
        supplierScore,
        totalScore,
        estimatedSellPrice,
        estimatedCost: supplier.unitCost,
        estimatedShippingCost: supplier.shippingCost,
        supplierName: supplier.supplierName,
        supplierUrl: supplier.supplierUrl,
        supplierRating: supplier.supplierRating,
        aiSummary,
        trendSource: "google_trends",
        createdAt: new Date().toISOString(),
      });
    } catch {
      continue;
    }
  }

  opportunities.sort((a, b) => b.totalScore - a.totalScore);

  await saveOpportunities(userId, opportunities);
}