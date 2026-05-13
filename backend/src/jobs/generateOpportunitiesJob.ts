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

export async function generateOpportunitiesJob(
  country: "US" | "IN",
  niche: string
): Promise<void> {
  const trends = await getTrendSignals(country, niche);
  const opportunities: ProductOpportunity[] = [];
  const aiContext = createAiRunContext();

  const MAX_OPPORTUNITIES = 5;

const sortedTrends = trends.sort(
  (a, b) => b.searchInterestScore - a.searchInterestScore
);

const selectedTrends = sortedTrends.slice(0, MAX_OPPORTUNITIES);

  for (const trend of selectedTrends) {
    const supplier = await findBestSupplier(country, trend.keyword);
        if (!supplier) {
          console.log("No supplier found for", trend.keyword);
          continue;
        }

    const multiplier = country === "US" ? 2.8 : 2.2;
    const estimatedSellPrice = supplier.unitCost * multiplier;

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

  opportunities.sort((a, b) => b.totalScore - a.totalScore);

  await saveOpportunities(opportunities);

  console.log("Opportunity AI calls used:", aiContext.callsUsed);
}