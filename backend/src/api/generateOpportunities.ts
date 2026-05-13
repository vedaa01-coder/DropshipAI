import type { Request, Response } from "express";
import { generateOpportunitiesJob } from "../jobs/generateOpportunitiesJob.ts";
import { getSavedOpportunities } from "../services/firestoreService.ts";

export async function generateOpportunities(req: Request, res: Response) {
  const userId = req.query.userId as string;
  const country = (req.query.country as "US" | "IN") || "US";
  const niche = (req.query.niche as string) || "general";

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    await generateOpportunitiesJob(userId, country, niche);
    const opportunities = await getSavedOpportunities(userId);

    return res.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}