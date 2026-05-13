import type { Request, Response } from "express";
import { getUserProfile, saveUserProfile } from "../services/firestoreService.ts";

export async function saveOnboardingProfile(req: Request, res: Response) {
  const { userId, email, country, niche, useAI } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  const existing = await getUserProfile(userId);

  await saveUserProfile({
    userId,
    email: email || existing?.email,
    country: country || existing?.country || "US",
    niche: niche || existing?.niche || "general",
    platform: existing?.platform || "shopify",
    shopDomain: existing?.shopDomain || "",
    accessToken: existing?.accessToken || "",
    subscriptionStatus: existing?.subscriptionStatus || "inactive",
    onboardingStatus: "profile_completed",
    isActive: existing?.isActive ?? false,
    useAI: useAI ?? existing?.useAI ?? false,
  });

  return res.json({ success: true });
}