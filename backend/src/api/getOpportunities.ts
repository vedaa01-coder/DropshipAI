import type { Request, Response } from "express";
import { getSavedOpportunities } from "../services/firestoreService.ts";

export async function getOpportunities(req: Request, res: Response) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  const opportunities = await getSavedOpportunities(userId);

  return res.json({
    success: true,
    count: opportunities.length,
    opportunities,
  });
}