import type { Request, Response } from "express";
import { getSavedInsights } from "../services/firestoreService.ts";

const severityRank = {
  high: 3,
  medium: 2,
  low: 1,
};

export async function getInsights(req: Request, res: Response) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  const insights = await getSavedInsights(userId);

  const sorted = [...insights].sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity]
  );

  return res.json({
    success: true,
    count: sorted.length,
    insights: sorted.map((insight) => ({
      ...insight,
      displayMessage: insight.aiSummary || insight.message,
    })),
  });
}