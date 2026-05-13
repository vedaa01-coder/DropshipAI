export interface TrendSignal {
  keyword: string;
  trendGrowthPct: number;
  searchInterestScore: number;
  socialMentionGrowthPct: number;
}

export async function getTrendSignals(
  country: "US" | "IN",
  niche: string
): Promise<TrendSignal[]> {
  return [
    {
      keyword: "portable blender",
      trendGrowthPct: 28,
      searchInterestScore: 74,
      socialMentionGrowthPct: 18,
    },
    {
      keyword: "led desk lamp",
      trendGrowthPct: 16,
      searchInterestScore: 62,
      socialMentionGrowthPct: 10,
    },
    {
      keyword: "travel organizer",
      trendGrowthPct: 22,
      searchInterestScore: 69,
      socialMentionGrowthPct: 14,
    },
    {
      keyword: "mini waffle maker",
      trendGrowthPct: 35,
      searchInterestScore: 81,
      socialMentionGrowthPct: 26,
    },
  ];
}