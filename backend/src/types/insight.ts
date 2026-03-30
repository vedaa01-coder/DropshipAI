export type InsightType =
  | "profit_drop"
  | "low_inventory"
  | "pricing_opportunity"
  | "trend_alert"
  | "no_sales"
  | "sales_momentum";

export interface DailyInsight {
  id: string;
  userId: string;
  productId: string;
  insightTypes: InsightType[];
  title: string;
  message: string;
  detailMessages: string[];
  severity: "low" | "medium" | "high";
  createdAt: string;
  aiSummary?: string;
  priorityScore?: number;
}