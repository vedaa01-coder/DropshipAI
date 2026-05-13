import type { Request, Response } from "express";
import { getSavedOpportunities } from "../services/firestoreService.ts";

export async function getOpportunities(req: Request, res: Response) {
  const opportunities = await getSavedOpportunities();

  return res.json({
    success: true,
    count: opportunities.length,
    opportunities,
  });
}