export interface DailyInsight {
  id: string;
  userId: string;
  productId: string;
  type: "profit_drop" | "low_inventory" | "pricing_opportunity" | "trend_alert" | "no_sales" | "sales_momentum";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
}