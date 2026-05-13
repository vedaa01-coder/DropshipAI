import type { Request, Response } from "express";
import crypto from "crypto";
import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { saveStoreConnection } from "../services/firestoreService.ts";

const shopifyAdapter = new ShopifyAdapter();

export function startShopifyConnect(req: Request, res: Response) {
  const shop = req.query.shop as string;

  if (!shop) {
    return res.status(400).json({ error: "Missing shop parameter" });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const installUrl = shopifyAdapter.getInstallUrl(shop, state);

  return res.json({ installUrl, state });
}

export async function handleShopifyCallback(req: Request, res: Response) {
  const { shop, code } = req.query as { shop?: string; code?: string };

  if (!shop || !code) {
    return res.status(400).json({ error: "Missing shop or code" });
  }

  try {
    const tokenResponse = await shopifyAdapter.exchangeCodeForAccessToken(shop, code);
    await saveStoreConnection({
              userId: "test-user",
              shopDomain: shop,
              accessToken: tokenResponse.access_token,
              platform: "shopify",
              country: "US",
              });
    return res.json({
      success: true,
      shop,
      accessTokenPreview: tokenResponse.access_token ? "received" : "missing",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Shopify callback failed",
      details: error.message,
    });
  }
}