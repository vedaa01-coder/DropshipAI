import type { StandardProduct } from "../types/product.ts";

export class ShopifyAdapter {
  getInstallUrl(shop: string, state: string): string {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_SCOPES;
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

    return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri || ""
    )}&state=${state}`;
  }

  async exchangeCodeForAccessToken(shop: string, code: string): Promise<any> {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange Shopify code for access token");
    }

    return response.json();
  }

  async fetchProducts(shop: string, accessToken: string): Promise<any[]> {
    const response = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    console.log("in fetch products");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch Shopify products: ${errorText}`);
    }

    const data = await response.json();
    return data.products || [];
  }

  normalizeProducts(
    userId: string,
    country: "US" | "IN",
    products: any[]
  ): StandardProduct[] {
    return products.map((p: any) => {
      const firstVariant = p.variants?.[0] || {};
      return {
        userId,
        platform: "shopify",
        country,
        externalProductId: String(p.id),
        title: p.title || "",
        sku: firstVariant.sku || "",
        category: p.product_type || "",
        price: Number(firstVariant.price || 0),
        cost: 0,
        inventory: Number(firstVariant.inventory_quantity || 0),
        revenueLast7Days: 0,
        unitsSoldLast7Days: 0,
        revenueLast30Days: 0,
        unitsSoldLast30Days: 0,
        feesLast30Days: 0,
        imageUrl: p.image?.src || "",
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async syncProducts(
    userId: string,
    country: "US" | "IN",
    shop: string,
    accessToken: string
  ): Promise<StandardProduct[]> {
    const rawProducts = await this.fetchProducts(shop, accessToken);
    return this.normalizeProducts(userId, country, rawProducts);
  }
}