import type { StandardProduct } from "../types/product.ts";
import type { DailyInsight } from "../types/insight.ts";


const productStore: StandardProduct[] = [];
const insightStore: DailyInsight[] = [];

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