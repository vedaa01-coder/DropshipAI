import type { Request, Response } from "express";
import { getSavedProducts } from "../services/firestoreService.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

export async function getProducts(req: Request, res: Response) {
  const products = await getSavedProducts();

  return res.json({
    success: true,
    count: products.length,
    products: products.map((p) => ({
      ...p,
      estimatedMonthlyProfit: calculateEstimatedMonthlyProfit(p),
    })),
  });
}