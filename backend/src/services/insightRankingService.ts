import type { DailyInsight, InsightType } from "../types/insight.ts";
import type { StandardProduct } from "../types/product.ts";

function getSeverityScore(severity: DailyInsight["severity"]): number {
  if (severity === "high") return 100;
  if (severity === "medium") return 60;
  return 30;
}

function getTypeBonus(insightTypes: InsightType[]): number {
  let score = 0;

  if (insightTypes.includes("low_inventory")) score += 20;
  if (insightTypes.includes("trend_alert")) score += 20;
  if (insightTypes.includes("pricing_opportunity")) score += 10;
  if (insightTypes.includes("profit_drop")) score += 10;
  if (insightTypes.includes("no_sales")) score += 5;
  if (insightTypes.includes("sales_momentum")) score += 5;

  return score;
}

function computeInsightPriority(
  insight: DailyInsight,
  product?: StandardProduct
): number {
  let score = getSeverityScore(insight.severity);
  score += getTypeBonus(insight.insightTypes);

  if (!product) return score;

  score += Math.min(product.revenueLast30Days / 10, 50);
  score += Math.min(product.unitsSoldLast30Days * 2, 30);

  if (insight.insightTypes.includes("low_inventory")) {
    score += Math.max(0, 20 - product.inventory);
  }

  return Math.round(score);
}

export function rankInsights(
  insights: DailyInsight[],
  products: StandardProduct[]
): DailyInsight[] {
  const productMap = new Map(
    products.map((product) => [product.externalProductId, product])
  );

  const rankedInsights = insights.map((insight) => {
    const product = productMap.get(insight.productId);

    return {
      ...insight,
      priorityScore: computeInsightPriority(insight, product),
    };
  });

  rankedInsights.sort(
    (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  return rankedInsights;
}