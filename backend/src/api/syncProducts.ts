import type { Request, Response } from "express";
import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { TEST_STORE } from "../config/testStore.ts";
import { saveProducts } from "../services/firestoreService.ts";

const shopifyAdapter = new ShopifyAdapter();

export async function syncProducts(req: Request, res: Response) {
      console.log(" from sync products ",TEST_STORE);
  try {
    const products = await shopifyAdapter.syncProducts(
      TEST_STORE.userId,
      TEST_STORE.country,
      TEST_STORE.shopDomain,
      TEST_STORE.accessToken
    );
    console.log(" from sync products ", TEST_STORE);
    await saveProducts(products);

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}