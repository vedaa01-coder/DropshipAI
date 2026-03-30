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


  async fetchOrders(shop: string, accessToken: string): Promise<any[]> {
  const response = await fetch(
        `https://${shop}/admin/api/2024-01/orders.json?status=any&limit=250`,
        {
        method: "GET",
        headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
        },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch Shopify orders: ${errorText}`);
    }

    const data = await response.json();
    return data.orders || [];
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
    const normalizedProducts = this.normalizeProducts(userId, country, rawProducts);

    const rawOrders = await this.fetchOrders(shop, accessToken);
    const enrichedProducts = this.mergeOrderMetricsIntoProducts(normalizedProducts, rawOrders);

    return enrichedProducts;

  }


  mergeOrderMetricsIntoProducts(products: StandardProduct[], orders: any[]): StandardProduct[] {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const productMap = new Map<string, StandardProduct>();

        for (const product of products) {
            productMap.set(product.externalProductId, { ...product });
        }
        


        for (const order of orders) {
            const createdAt = new Date(order.created_at);
            const inLast7Days = createdAt >= last7Days;
            const inLast30Days = createdAt >= last30Days;

            for (const item of order.line_items || []) {
            const productId = String(item.product_id || "");
            const quantity = Number(item.quantity || 0);
            const lineRevenue = Number(item.price || 0) * quantity;

            
            //console.log("Known product IDs:", Array.from(productMap.keys()));

            const existingProduct = productMap.get(productId);



            if (!existingProduct) continue;

            //console.log("Order item product_id:", item.product_id);
            //console.log("existing Product :", existingProduct);

            if (inLast7Days) {
                existingProduct.unitsSoldLast7Days += quantity;
                existingProduct.revenueLast7Days += lineRevenue;
            }

            if (inLast30Days) {
                existingProduct.unitsSoldLast30Days += quantity;
                existingProduct.revenueLast30Days += lineRevenue;
            }
            }
        }

        return Array.from(productMap.values());
        }

}