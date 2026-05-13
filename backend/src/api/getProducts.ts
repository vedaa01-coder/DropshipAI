import type { Request, Response } from "express";
import { getSavedProducts } from "../services/firestoreService.ts";
import { calculateEstimatedMonthlyProfit } from "../services/pricingService.ts";

export async function getProducts(req: Request, res: Response) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  const products = await getSavedProducts(userId);

  return res.json({
    success: true,
    count: products.length,
    products: products.map((p) => ({
      ...p,
      estimatedMonthlyProfit: calculateEstimatedMonthlyProfit(p),
    })),
  });
}