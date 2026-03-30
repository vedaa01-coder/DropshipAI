import type { Request, Response } from "express";
import { getSavedInsights } from "../services/firestoreService.ts";

const severityRank = {
  high: 3,
  medium: 2,
  low: 1,
};

export async function getInsights(req: Request, res: Response) {
  const insights = await getSavedInsights();

  const sorted = [...insights].sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity]
  );

  return res.json({
    success: true,
    count: sorted.length,
    insights: sorted,
  });
}