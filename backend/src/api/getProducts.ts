import type { Request, Response } from "express";
import { getSavedProducts } from "../services/firestoreService.ts";

export async function getProducts(req: Request, res: Response) {
  const products = await getSavedProducts();

  return res.json({
    success: true,
    count: products.length,
    products,
  });
}