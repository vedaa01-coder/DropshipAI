export interface StandardProduct {
  userId: string;
  platform: "shopify" | "amazon";
  country: "US" | "IN";
  externalProductId: string;
  title: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  inventory: number;
  revenueLast7Days: number;
  unitsSoldLast7Days: number;
  revenueLast30Days: number;
  unitsSoldLast30Days: number;
  feesLast30Days?: number;
  imageUrl?: string;
  updatedAt: string;
}
