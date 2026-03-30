import type { Request, Response } from "express";
import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { TEST_STORE } from "../config/testStore.ts";
import { saveProducts } from "../services/firestoreService.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

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

    const preview = products.map((p) => ({
      title: p.title,
      inventory: p.inventory,
      revenueLast7Days: p.revenueLast7Days,
      unitsSoldLast7Days: p.unitsSoldLast7Days,
      revenueLast30Days: p.revenueLast30Days,
      unitsSoldLast30Days: p.unitsSoldLast30Days,
      estimatedMonthlyProfit: calculateEstimatedMonthlyProfit(p),
    }));

    return res.json({
      success: true,
      count: products.length,
      products: preview,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}