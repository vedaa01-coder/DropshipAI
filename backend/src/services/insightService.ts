import type { StandardProduct } from "../types/product.ts";
import type { DailyInsight } from "../types/insight.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

export function generateRuleBasedInsights(products: StandardProduct[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  const now = new Date().toISOString();

  for (const product of products) {
    const monthlyProfit = calculateEstimatedMonthlyProfit(product);

    if (product.inventory > 0 && product.inventory < 10) {
      insights.push({
        id: `${product.externalProductId}-low-inventory`,
        userId: product.userId,
        productId: product.externalProductId,
        type: "low_inventory",
        title: "Low inventory alert",
        message: `${product.title} is running low on stock. Consider reordering soon.`,
        severity: "high",
        createdAt: now,
      });
    }

    if (product.revenueLast30Days > 0 && monthlyProfit < 50) {
      insights.push({
        id: `${product.externalProductId}-low-profit`,
        userId: product.userId,
        productId: product.externalProductId,
        type: "profit_drop",
        title: "Low profit detected",
        message: `${product.title} generated sales but weak profit this month. Review pricing or costs.`,
        severity: "medium",
        createdAt: now,
      });
    }

    if (product.inventory > 0 && product.unitsSoldLast30Days === 0) {
      insights.push({
        id: `${product.externalProductId}-no-sales`,
        userId: product.userId,
        productId: product.externalProductId,
        type: "no_sales",
        title: "No recent sales",
        message: `${product.title} had no sales in the last 30 days. Consider improving visibility or replacing it.`,
        severity: "medium",
        createdAt: now,
      });
    }

    if (product.unitsSoldLast7Days >= 5) {
      insights.push({
        id: `${product.externalProductId}-sales-momentum`,
        userId: product.userId,
        productId: product.externalProductId,
        type: "sales_momentum",
        title: "Strong sales momentum",
        message: `${product.title} is selling well this week. Monitor inventory and consider increasing promotion.`,
        severity: "low",
        createdAt: now,
      });
    }
  }

  return insights;
}