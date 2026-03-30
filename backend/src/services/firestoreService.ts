import type { StandardProduct } from "../types/product.ts";
import type { DailyInsight } from "../types/insight.ts";
import type { ProductOpportunity } from "../types/opportunity.ts";


const productStore: StandardProduct[] = [];
const insightStore: DailyInsight[] = [];
const opportunityStore: ProductOpportunity[] = [];

export async function saveProducts(products: StandardProduct[]): Promise<void> {
  productStore.length = 0;
  productStore.push(...products);
}

export async function getSavedProducts(): Promise<StandardProduct[]> {
  return productStore;
}

export async function saveInsights(insights: DailyInsight[]): Promise<void> {
  insightStore.length = 0;
  insightStore.push(...insights);
}

export async function getSavedInsights(): Promise<DailyInsight[]> {
  return insightStore;
}

export async function getProductById(productId: string): Promise<StandardProduct | undefined> {
  return productStore.find((p) => p.externalProductId === productId);
}

export async function saveStoreConnection(data: {
  userId: string;
  shopDomain: string;
  accessToken: string;
  platform: "shopify" | "amazon";
  country: "US" | "IN";
}) {
  console.log("Saving store connection", data);
}

export async function saveOpportunities(opportunities: ProductOpportunity[]): Promise<void> {
  opportunityStore.length = 0;
  opportunityStore.push(...opportunities);
}

export async function getSavedOpportunities(): Promise<ProductOpportunity[]> {
  return opportunityStore;
}