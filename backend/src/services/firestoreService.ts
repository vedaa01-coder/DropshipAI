import type { StandardProduct } from "../types/product.ts";

const productStore: StandardProduct[] = [];

export async function saveProducts(products: StandardProduct[]): Promise<void> {
  productStore.length = 0;
  productStore.push(...products);
}

export async function getSavedProducts(): Promise<StandardProduct[]> {
  return productStore;
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