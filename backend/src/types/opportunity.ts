export interface ProductOpportunity {
  id: string;
  country: "US" | "IN";
  niche: string;
  productName: string;
  demandScore: number;
  profitScore: number;
  competitionScore: number;
  supplierScore: number;
  totalScore: number;
  estimatedSellPrice: number;
  estimatedCost: number;
  estimatedShippingCost: number;
  supplierName?: string;
  supplierUrl?: string;
  supplierRating?: number;
  aiSummary?: string;
  trendSource?: string;
  createdAt: string;
}
