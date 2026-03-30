import type { Request, Response } from "express";
import { generateOpportunitiesJob } from "../jobs/generateOpportunitiesJob.ts";
import { getSavedOpportunities } from "../services/firestoreService.ts";

export async function generateOpportunities(req: Request, res: Response) {
  try {
    const country = (req.query.country as "US" | "IN") || "US";
    const niche = (req.query.niche as string) || "general";

    await generateOpportunitiesJob(country, niche);
    const opportunities = await getSavedOpportunities();

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