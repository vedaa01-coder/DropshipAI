import type { Request, Response } from "express";
import { generateInsightsJob } from "../jobs/generateInsightsJob.ts";
import { getSavedInsights } from "../services/firestoreService.ts";

export async function generateInsights(req: Request, res: Response) {
  try {
    await generateInsightsJob();
    const insights = await getSavedInsights();

    return res.json({
      success: true,
      count: insights.length,
      insights,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}