import type { StandardProduct } from "../types/product.ts";
import type { DailyInsight, InsightType } from "../types/insight.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

function getHighestSeverity(
  severities: ("low" | "medium" | "high")[]
): "low" | "medium" | "high" {
  if (severities.includes("high")) return "high";
  if (severities.includes("medium")) return "medium";
  return "low";
}

function buildInsightTitle(
  productTitle: string,
  severity: "low" | "medium" | "high"
): string {
  if (severity === "high") return `${productTitle}: urgent action recommended`;
  if (severity === "medium") return `${productTitle}: action recommended`;
  return `${productTitle}: performance update`;
}

function buildBaseMessage(
  productTitle: string,
  insightTypes: InsightType[]
): string {
  if (insightTypes.includes("low_inventory") && insightTypes.includes("trend_alert")) {
    return `${productTitle} is at risk of stocking out while demand is rising.`;
  }

  if (insightTypes.includes("low_inventory")) {
    return `${productTitle} needs inventory attention soon.`;
  }

  if (insightTypes.includes("pricing_opportunity")) {
    return `${productTitle} has room for pricing or margin improvement.`;
  }

  if (insightTypes.includes("profit_drop")) {
    return `${productTitle} is generating weaker profit than expected.`;
  }

  if (insightTypes.includes("no_sales")) {
    return `${productTitle} has had no recent sales and may need intervention.`;
  }

  if (insightTypes.includes("sales_momentum")) {
    return `${productTitle} is showing encouraging recent sales momentum.`;
  }

  return `${productTitle} has noteworthy performance signals.`;
}

export function generateRuleBasedInsights(products: StandardProduct[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  const now = new Date().toISOString();

  for (const product of products) {
    const monthlyProfit = calculateEstimatedMonthlyProfit(product);
    const avgWeeklySalesFrom30Days = product.unitsSoldLast30Days / 4;
    const marginPercent = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
    

    const insightTypes: InsightType[] = [];
    const detailMessages: string[] = [];
    const severities: ("low" | "medium" | "high")[] = [];

    if (product.inventory > 0 && product.inventory < 10) {
      insightTypes.push("low_inventory");
      detailMessages.push(
        `${product.title} is running low on stock. Consider reordering soon.`
      );
      severities.push("high");
    }

    if (product.revenueLast30Days > 0 && monthlyProfit < 50) {
      insightTypes.push("profit_drop");
      detailMessages.push(
        `${product.title} generated sales but weak profit this month. Review pricing or costs.`
      );
      severities.push("medium");
    }

    if (product.inventory > 0 && product.unitsSoldLast30Days === 0) {
      insightTypes.push("no_sales");
      detailMessages.push(
        `${product.title} had no sales in the last 30 days. Consider improving visibility or replacing it.`
      );
      severities.push("medium");
    }

    if (product.unitsSoldLast7Days >= 5) {
      insightTypes.push("sales_momentum");
      detailMessages.push(
        `${product.title} is selling well this week. Monitor inventory and consider increasing promotion.`
      );
      severities.push("low");
    }

    if (
        product.unitsSoldLast30Days >= 5 &&
        marginPercent > 0 &&
        marginPercent < 20
    ) {
      insightTypes.push("pricing_opportunity");
      detailMessages.push(
        `${product.title} is generating sales but profit remains modest. Test a small price increase or reduce product cost to improve margin.`
      );
      severities.push("medium");
    }

    if (
      product.unitsSoldLast30Days >= 8 &&
      product.unitsSoldLast7Days >= avgWeeklySalesFrom30Days * 0.4
    ) {
      insightTypes.push("trend_alert");
      detailMessages.push(
        `${product.title} is selling much faster this week than usual. Watch inventory closely and consider increasing promotion.`
      );
      severities.push("high");
    }

    if (insightTypes.length === 0) {
      continue;
    }

    const severity = getHighestSeverity(severities);

    insights.push({
      id: `${product.externalProductId}-daily-insight`,
      userId: product.userId,
      productId: product.externalProductId,
      insightTypes,
      title: buildInsightTitle(product.title, severity),
      message: buildBaseMessage(product.title, insightTypes),
      detailMessages,
      severity,
      createdAt: now,
    });
  }

  return insights;
}