import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import { startShopifyConnect, handleShopifyCallback } from "../src/api/connectShopify.ts";
import { getProducts } from "../src/api/getProducts.ts";
import { syncProducts } from "../src/api/syncProducts.ts";

import { getInsights } from "../src/api/getInsights.ts";
import { generateInsights } from "../src/api/generateInsights.ts";

import { generateOpportunities } from "../src/api/generateOpportunities.ts";
import { getOpportunities } from "../src/api/getOpportunities.ts";

import { saveOnboardingProfile } from "../src/api/onboarding.ts";

import { getTrendSignals } from "../src/services/trendService.ts";

dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
// (no changes needed here)
app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.get("/test-trends", async (_req, res) => {
  try {
    const trends = await getTrendSignals("US", "general");
    res.json({ success: true, count: trends.length, trends });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/onboarding/profile", saveOnboardingProfile);


/**
 * Shopify OAuth
 * Start:
 *   GET /shopify/connect?shop=storename.myshopify.com&userId=abc123
 *
 * Callback:
 *   GET /shopify/callback
 */
app.get("/shopify/connect", startShopifyConnect);
app.get("/shopify/callback", handleShopifyCallback);

/**
 * Onboarding
 * POST /onboarding/profile
 * body:
 * {
 *   userId,
 *   email?,
 *   country?,
 *   niche?,
 *   useAI?
 * }
 */
app.post("/onboarding/profile", saveOnboardingProfile);

/**
 * Products
 * GET /products?userId=abc123
 * GET /sync-products?userId=abc123
 */
app.get("/products", getProducts);
app.get("/sync-products", syncProducts);

/**
 * Insights
 * GET /insights?userId=abc123
 * GET /generate-insights?userId=abc123
 */
app.get("/insights", getInsights);
app.get("/generate-insights", generateInsights);

/**
 * Opportunities
 * GET /opportunities?userId=abc123
 * GET /generate-opportunities?userId=abc123&country=US&niche=general
 */
app.get("/opportunities", getOpportunities);
app.get("/generate-opportunities", generateOpportunities);

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});