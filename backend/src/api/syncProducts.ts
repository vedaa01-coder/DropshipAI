import type { Request, Response } from "express";
import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { saveProducts, getUserProfile } from "../services/firestoreService.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

const shopifyAdapter = new ShopifyAdapter();

export async function syncProducts(req: Request, res: Response) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    const user = await getUserProfile(userId);

    if (!user?.shopDomain || !user?.accessToken) {
      return res.status(400).json({
        success: false,
        error: "User store connection not found",
      });
    }

    const products = await shopifyAdapter.syncProducts(
      userId,
      user.country,
      user.shopDomain,
      user.accessToken
    );

    await saveProducts(userId, products);

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