import axios from "axios";
import * as cheerio from "cheerio";

export interface SupplierInfo {
  supplierName: string;
  supplierUrl: string;
  unitCost: number;
  shippingCost: number;
  supplierRating: number;
  supplierOrderVolume: number;
  shippingDays: number;
}

function parsePrice(text: string): number {
  const matches = text.match(/\d+(\.\d+)?/g);
  if (!matches?.length) return 0;

  const first = Number(matches[0]);
  return Number.isFinite(first) ? first : 0;
}

function parseRating(text: string): number {
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function parseOrderVolume(text: string): number {
  const normalized = text.toLowerCase().replace(/,/g, "").trim();

  if (normalized.includes("k")) {
    const n = Number(normalized.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? Math.round(n * 1000) : 0;
  }

  const n = Number(normalized.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function absoluteUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://www.aliexpress.com${url}`;
  return `https://www.aliexpress.com/${url}`;
}

function estimateShippingDays(country: "US" | "IN"): number {
  return country === "US" ? 10 : 14;
}

function estimateShippingCost(country: "US" | "IN"): number {
  return country === "US" ? 4 : 3;
}

function getFallbackSupplier(
  country: "US" | "IN",
  productName: string
): SupplierInfo {
  return {
    supplierName: "Fallback Supplier",
    supplierUrl: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(productName)}`,
    unitCost: 10,
    shippingCost: estimateShippingCost(country),
    supplierRating: 4.2,
    supplierOrderVolume: 100,
    shippingDays: estimateShippingDays(country),
  };
}

export async function findBestSupplier(
  country: "US" | "IN",
  productName: string
): Promise<SupplierInfo | null> {
  const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
    productName
  )}`;

  try {
    const response = await axios.get(searchUrl, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = String(response.data || "");
    console.log("[supplier] html length:", html.length);

    const $ = cheerio.load(html);

    const linkNodes = $('a[href*="/item/"]').toArray();
    console.log("[supplier] item links found:", linkNodes.length);

    if (!linkNodes.length) {
      console.log("[supplier] no item links found, using fallback");
      return getFallbackSupplier(country, productName);
    }

    const seenUrls = new Set<string>();
    const candidates: SupplierInfo[] = [];

    for (const el of linkNodes.slice(0, 15)) {
      try {
        const card = $(el);
        const href = card.attr("href") || "";
        const supplierUrl = absoluteUrl(href);

        if (!supplierUrl || seenUrls.has(supplierUrl)) {
          continue;
        }
        seenUrls.add(supplierUrl);

        // IMPORTANT: only use the anchor text itself, not parent/closest text
        const rawText = card.text().trim();

        // Try a nearby small wrapper only if anchor text is too short
        const smallWrapperText =
          rawText.length > 10
            ? rawText
            : card.closest("a").text().trim();

        const textForParsing = smallWrapperText || rawText;

        const unitCost = parsePrice(textForParsing);
        const supplierRating = parseRating(textForParsing) || 4.2;
        const supplierOrderVolume = parseOrderVolume(textForParsing) || 100;

        if (unitCost <= 0) {
          continue;
        }

        candidates.push({
          supplierName: "AliExpress Seller",
          supplierUrl,
          unitCost,
          shippingCost: estimateShippingCost(country),
          supplierRating,
          supplierOrderVolume,
          shippingDays: estimateShippingDays(country),
        });
      } catch (cardError: any) {
        console.error("[supplier] card parse failed:", cardError?.message);
        continue;
      }
    }

    console.log("[supplier] candidate count:", candidates.length, "for", productName);

    if (!candidates.length) {
      console.log("[supplier] using fallback supplier for", productName);
      return getFallbackSupplier(country, productName);
    }

    candidates.sort((a, b) => {
      const aScore =
        a.supplierRating * 20 +
        Math.log10(Math.max(1, a.supplierOrderVolume)) * 10 -
        a.unitCost -
        a.shippingDays * 0.5;

      const bScore =
        b.supplierRating * 20 +
        Math.log10(Math.max(1, b.supplierOrderVolume)) * 10 -
        b.unitCost -
        b.shippingDays * 0.5;

      return bScore - aScore;
    });

    return candidates[0] ?? getFallbackSupplier(country, productName);
  } catch (error: any) {
    console.error("[supplier] fetch failed:", error?.message);
    console.error("[supplier] redirect location:", error?.response?.headers?.location);
    return getFallbackSupplier(country, productName);
  }
}