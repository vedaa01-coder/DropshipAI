import googleTrends from "google-trends-api";

export interface TrendSignal {
  keyword: string;
  trendGrowthPct: number;
  searchInterestScore: number;
  socialMentionGrowthPct: number;
}

type NicheKeywords = {
  general: string[];
} & Record<string, string[]>;

const DEFAULT_KEYWORDS_BY_NICHE: NicheKeywords = {
  general: [
    "portable blender",
    "mini waffle maker",
    "led desk lamp",
    "travel organizer",
    "wireless charger stand",
    "car phone holder",
    "electric lunch box",
    "neck fan portable",
  ],

  kitchen: [
    "portable blender",
    "mini waffle maker",
    "milk frother handheld",
    "electric food chopper",
    "air fryer accessories",
    "silicone baking mats",
    "vegetable chopper slicer",
    "oil sprayer bottle",
  ],

  home: [
    "led desk lamp",
    "under bed storage organizer",
    "shoe rack organizer",
    "desk cable organizer",
    "closet storage bins",
    "foldable laundry basket",
    "bedside shelf tray",
    "motion sensor light indoor",
  ],

  fitness: [
    "resistance bands set",
    "adjustable dumbbells",
    "ab roller wheel",
    "yoga mat thick",
    "massage gun portable",
    "ankle weights set",
  ],

  beauty: [
    "facial cleansing brush",
    "ice face roller",
    "makeup organizer box",
    "led vanity mirror",
    "blackhead remover vacuum",
    "hair curling wand",
  ],

  gadgets: [
    "wireless charger stand",
    "bluetooth tracker",
    "smart plug wifi",
    "portable projector mini",
    "ring light for phone",
    "usb c hub multiport",
  ],
};

function getGeo(country: "US" | "IN"): string {
  return country;
}

function getKeywordsForNiche(niche: string): string[] {
  const key = niche.toLowerCase();
  return DEFAULT_KEYWORDS_BY_NICHE[key] ?? DEFAULT_KEYWORDS_BY_NICHE.general;
}

function expandKeywords(base: string[]): string[] {
  console.log("[trends] expanding keywords. base:", base);

  if (!base.length) return [];

  const expanded = base.flatMap((k) => [k, `${k} amazon`, `${k} shopify`, `${k} trending`]);
  const unique = [...new Set(expanded)];
  const limited = unique.slice(0, 6);

  console.log("[trends] expanded keywords:", limited);
  return limited;
}

function safePercentGrowth(previous: number, latest: number): number {
  if (previous <= 0) {
    return latest > 0 ? 100 : 0;
  }
  return ((latest - previous) / previous) * 100;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

async function fetchTrendForKeyword(
  keyword: string,
  geo: string
): Promise<TrendSignal | null> {
  try {
    console.log("[trends] fetching keyword:", keyword);

    const raw = await googleTrends.interestOverTime({
      keyword,
      geo,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      endTime: new Date(),
    });

    const parsed = JSON.parse(raw);

    const timeline: Array<{ value?: number[] }> =
      parsed.default?.timelineData || [];

    const values = timeline
      .map((point) => Number(point.value?.[0] ?? 0))
      .filter((n) => Number.isFinite(n));

    console.log("[trends] values for", keyword, ":", values);

    if (!values.length) {
      console.log("[trends] no values for", keyword);
      return null;
    }

    const midpoint = Math.max(1, Math.floor(values.length / 2));
    const firstHalfAvg = average(values.slice(0, midpoint));
    const secondHalfAvg = average(values.slice(midpoint));
    const latest = values[values.length - 1] ?? 0;
    const maxInterest = Math.max(...values, 0);

    const trendGrowthPct = Math.max(
      0,
      Math.round(safePercentGrowth(firstHalfAvg, secondHalfAvg))
    );

    const searchInterestScore = Math.round(maxInterest);

    // Placeholder proxy until you add a real social data source.
    const socialMentionGrowthPct = Math.max(
      0,
      Math.round(trendGrowthPct * 0.35)
    );

    const result: TrendSignal = {
      keyword,
      trendGrowthPct,
      searchInterestScore,
      socialMentionGrowthPct,
    };

    console.log("[trends] result:", result);

    return result;
  } catch (error: any) {
    console.error("[trends] fetch failed for keyword:", keyword);
    console.error("[trends] error:", error?.message || error);
    return null;
  }
}

export async function getTrendSignals(
  country: "US" | "IN",
  niche: string
): Promise<TrendSignal[]> {
  console.log("[trends] country:", country, "niche:", niche);

  const geo = getGeo(country);
  const baseKeywords = getKeywordsForNiche(niche);
  const keywords = expandKeywords(baseKeywords);

  const results: (TrendSignal | null)[] = [];

  // Sequential fetch to avoid request bursts / stack issues
  for (const keyword of keywords) {
    const trend = await fetchTrendForKeyword(keyword, geo);
    results.push(trend);
  }

  const finalResults = results.filter(
    (item): item is TrendSignal => item !== null
  );

  console.log("[trends] final count:", finalResults.length);

  return finalResults;
}