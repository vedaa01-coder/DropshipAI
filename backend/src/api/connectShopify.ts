import type { Request, Response } from "express";
import { ShopifyAdapter } from "../adapters/shopifyAdapter.ts";
import { saveStoreConnection } from "../services/firestoreService.ts";

const shopifyAdapter = new ShopifyAdapter();

/**
 * Start Shopify OAuth
 * Example:
 * /shopify/connect?shop=storename.myshopify.com&userId=abc123
 *
 * We use userId as the OAuth state for MVP simplicity.
 * Later you can sign/encrypt this.
 */
export function startShopifyConnect(req: Request, res: Response) {
  const shop = req.query.shop as string;
  const userId = req.query.userId as string;

  if (!shop) {
    return res.status(400).json({ success: false, error: "Missing shop parameter" });
  }

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId parameter" });
  }

  const installUrl = shopifyAdapter.getInstallUrl(shop, userId);

  return res.json({
    success: true,
    installUrl,
    userId,
    shop,
  });
}

/**
 * Shopify OAuth callback
 * Shopify returns:
 * - shop
 * - code
 * - state
 *
 * Here state = userId
 */
export async function handleShopifyCallback(req: Request, res: Response) {
  const { shop, code, state } = req.query as {
    shop?: string;
    code?: string;
    state?: string;
  };

  if (!shop || !code || !state) {
    return res.status(400).json({
      success: false,
      error: "Missing shop, code, or state",
    });
  }

  const userId = state;

  try {
    const tokenResponse = await shopifyAdapter.exchangeCodeForAccessToken(shop, code);

    await saveStoreConnection({
      userId,
      shopDomain: shop,
      accessToken: tokenResponse.access_token,
      platform: "shopify",
      country: "US",
    });

    // For MVP: redirect user back to onboarding/profile screen
    // Update this to your frontend URL later.
    const frontendBaseUrl =
      process.env.FRONTEND_APP_URL || "http://localhost:3000";

    const redirectUrl =
      `${frontendBaseUrl}/onboarding` +
      `?userId=${encodeURIComponent(userId)}` +
      `&shopConnected=true`;

    return res.redirect(redirectUrl);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Shopify callback failed",
      details: error.message,
    });
  }
}