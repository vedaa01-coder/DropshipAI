import type { Request, Response } from "express";
import { generateInsightsJob } from "../jobs/generateInsightsJob.ts";
import { getSavedInsights } from "../services/firestoreService.ts";

export async function generateInsights(req: Request, res: Response) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    await generateInsightsJob(userId);
    const insights = await getSavedInsights(userId);

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