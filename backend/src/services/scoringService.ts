export interface OpportunityInputs {
  demandScore: number;
  profitScore: number;
  competitionScore: number;
  supplierScore: number;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateOpportunityScore(input: OpportunityInputs): number {
  const weighted =
    input.demandScore * 0.35 +
    input.profitScore * 0.30 +
    input.competitionScore * 0.20 +
    input.supplierScore * 0.15;

  return clampScore(weighted);
}

export function calculateDemandScore(
  trendGrowthPct: number,
  searchInterestScore: number,
  socialMentionGrowthPct: number
): number {
  let score = 0;

  score += Math.min(40, Math.max(0, trendGrowthPct));
  score += Math.min(35, Math.max(0, searchInterestScore * 0.35));
  score += Math.min(25, Math.max(0, socialMentionGrowthPct * 0.5));

  return clampScore(score);
}

export function calculateProfitScore(
  estimatedSellPrice: number,
  estimatedCost: number,
  estimatedShippingCost: number,
  extraFees = 0
): number {
  const profit = estimatedSellPrice - estimatedCost - estimatedShippingCost - extraFees;
  const margin = estimatedSellPrice > 0 ? (profit / estimatedSellPrice) * 100 : 0;

  if (margin >= 50) return 100;
  if (margin >= 40) return 85;
  if (margin >= 30) return 70;
  if (margin >= 20) return 50;
  if (margin >= 10) return 25;
  return 5;
}

export function calculateCompetitionScore(listingCount: number, avgReviews: number): number {
  let score = 100;

  if (listingCount > 1000) score -= 40;
  else if (listingCount > 500) score -= 25;
  else if (listingCount > 200) score -= 15;

  if (avgReviews > 1000) score -= 30;
  else if (avgReviews > 300) score -= 20;
  else if (avgReviews > 100) score -= 10;

  return clampScore(score);
}

export function calculateSupplierScore(
  supplierRating: number,
  supplierOrderVolume: number,
  shippingDays: number
): number {
  let score = 0;

  score += Math.min(50, (supplierRating / 5) * 50);
  score += Math.min(30, Math.log10(Math.max(1, supplierOrderVolume)) * 10);

  if (shippingDays <= 5) score += 20;
  else if (shippingDays <= 10) score += 15;
  else if (shippingDays <= 20) score += 8;
  else score += 3;

  return clampScore(score);
}