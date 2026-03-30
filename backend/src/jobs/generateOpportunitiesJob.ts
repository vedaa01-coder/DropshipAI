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
import { generateShortAiText } from "../services/aiService.ts";
import { saveOpportunities } from "../services/firestoreService.ts";
import type { ProductOpportunity } from "../types/opportunity.ts";

export async function generateOpportunitiesJob(
  country: "US" | "IN",
  niche: string
): Promise<void> {
  const trends = await getTrendSignals(country, niche);
  const opportunities: ProductOpportunity[] = [];

  for (const trend of trends) {
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

    const aiSummary = await generateShortAiText(
      buildOpportunityPrompt({
        productName: trend.keyword,
        demandScore,
        profitScore,
        competitionScore,
        supplierScore,
        estimatedSellPrice,
        estimatedCost: supplier.unitCost,
        shippingCost: supplier.shippingCost,
      })
    );

    opportunities.push({
      id: `${country}-${niche}-${trend.keyword}`.replace(/\s+/g, "-"),
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
      trendSource: "mock_trends",
      createdAt: new Date().toISOString(),
    });
  }

  const ranked = opportunities.sort((a, b) => b.totalScore - a.totalScore);
  await saveOpportunities(ranked);
}