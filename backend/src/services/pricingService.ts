import type { StandardProduct } from "../types/product.ts";

export function calculateEstimatedMonthlyProfit(product: StandardProduct): number {
  const estimatedCostTotal = product.cost * product.unitsSoldLast30Days;
  const estimatedFees = product.feesLast30Days || 0;
  return product.revenueLast30Days - estimatedCostTotal - estimatedFees;
}