import type { DailyInsight } from "../types/insight.ts";
import type { StandardProduct } from "../types/product.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

function formatCurrency(value: number | undefined): string {
  const safeValue = Number(value || 0);
  return `$${safeValue.toFixed(2)}`;
}

export function buildInsightRewritePrompt(
  insight: DailyInsight,
  product: StandardProduct
): string {
  const estimatedMonthlyProfit = calculateEstimatedMonthlyProfit(product);
  const avgWeeklySalesFrom30Days = product.unitsSoldLast30Days / 4;

  return `
You are an ecommerce advisor helping a Shopify merchant.

Write one short merchant-facing summary for this product using the combined signals below.

Rules:
- Write 2 sentences maximum.
- Maximum 60 words.
- Be practical, specific, and easy to understand.
- Focus on the most important actions first.
- Combine overlapping issues naturally.
- Do not mention AI, algorithms, scoring, rules, or insight types.
- Output plain text only.

Product data:
- Product title: ${product.title}
- Current inventory: ${product.inventory}
- Units sold in last 7 days: ${product.unitsSoldLast7Days}
- Units sold in last 30 days: ${product.unitsSoldLast30Days}
- Revenue in last 30 days: ${formatCurrency(product.revenueLast30Days)}
- Estimated monthly profit: ${formatCurrency(estimatedMonthlyProfit)}
- Average weekly sales from last 30 days: ${avgWeeklySalesFrom30Days.toFixed(1)}

Combined signals:
- Severity: ${insight.severity}
- Insight types: ${insight.insightTypes.join(", ")}
- Details:
${insight.detailMessages.map((msg) => `  - ${msg}`).join("\n")}

Write the final summary now.
`.trim();
}