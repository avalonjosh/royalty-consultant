import { z } from "zod";

// =============================================================================
// ESTIMATION TYPES
// =============================================================================

export const EstimateSchema = z.object({
  monthly: z.number(),
  totalLow: z.number(),
  totalHigh: z.number(),
  monthsMissed: z.number(),
  applicable: z.boolean(),
  note: z.string().optional(),
});
export type Estimate = z.infer<typeof EstimateSchema>;

export const AllEstimatesSchema = z.object({
  mlc: EstimateSchema,
  soundexchange: EstimateSchema,
  soundexchangeMissingSide: EstimateSchema,
  pro: EstimateSchema,
  proPublisherShare: EstimateSchema,
  songsByOthers: EstimateSchema,
  total: z.object({
    monthlyGap: z.number(),
    totalLow: z.number(),
    totalHigh: z.number(),
  }),
});
export type AllEstimates = z.infer<typeof AllEstimatesSchema>;

// =============================================================================
// SCORE AND COMPLEXITY TYPES
// =============================================================================

export const ScoreLabelSchema = z.enum([
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Critical",
]);
export type ScoreLabel = z.infer<typeof ScoreLabelSchema>;

export const ComplexityLevelSchema = z.enum(["Simple", "Moderate", "Complex"]);
export type ComplexityLevel = z.infer<typeof ComplexityLevelSchema>;

export const RecommendationSchema = z.enum([
  "DIY",
  "DIY or Done-For-You",
  "Done-For-You Recommended",
  "Consultation Required",
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

// =============================================================================
// CALCULATIONS OUTPUT
// =============================================================================

export const CalculationsSchema = z.object({
  estimates: AllEstimatesSchema,
  score: z.number().min(0).max(10),
  scoreLabel: ScoreLabelSchema,
  complexity: ComplexityLevelSchema,
  complexityPoints: z.number(),
  recommendation: RecommendationSchema,
  diyTimeHoursLow: z.number(),
  diyTimeHoursHigh: z.number(),
  blockDiy: z.boolean(),
});
export type Calculations = z.infer<typeof CalculationsSchema>;

// =============================================================================
// INCOME CONVERSION CONSTANTS
// =============================================================================

export const INCOME_MIDPOINTS: Record<string, number> = {
  "0_to_100": 50,
  "100_to_500": 300,
  "500_to_1000": 750,
  "1000_to_3000": 2000,
  "3000_to_10000": 6500,
  "10000_plus": 12000, // Cap for estimates
};

export const CATALOG_COUNTS: Record<string, number> = {
  "1_to_10": 5,
  "11_to_25": 18,
  "26_to_50": 38,
  "51_to_100": 75,
  "100_plus": 120,
};

export const COWRITER_COUNT_VALUES: Record<string, number> = {
  "1_to_5": 3,
  "6_to_15": 10,
  "16_to_30": 23,
  "most_or_all": 0.8, // 80% of catalog - will be calculated
};

export const SONGS_BY_OTHERS_VALUES: Record<string, number> = {
  "1_to_3": 2,
  "4_to_10": 7,
  "10_plus": 15,
};

export const GENRE_MULTIPLIERS: Record<string, number> = {
  pop: 1.2,
  "hip-hop": 1.1,
  country: 1.5,
  rock: 1.3,
  "r&b": 1.2,
  edm: 0.7,
  indie: 0.8,
  jazz: 0.5,
  classical: 0.4,
  other: 1.0,
  unknown: 1.0,
};

// =============================================================================
// TIME ESTIMATES (in minutes)
// =============================================================================

export const BASE_TIMES = {
  joinPro: 20,
  registerWorksPerSong: 5,
  joinMlc: 30,
  registerMlcPerSong: 3,
  joinSoundexchange: 20,
  documentSplitsPerSong: 15,
  createPublishingEntity: 15, // ASCAP/BMI publishing entity
};

// =============================================================================
// TIME RELEASING CONVERSIONS (months since start)
// =============================================================================

export function getMonthsSinceStart(timeReleasing: string): number {
  const monthsMap: Record<string, number> = {
    less_than_6_months: 3, // Assume 3 months average
    "6_months_to_2_years": 15, // Assume midpoint
    "2_to_5_years": 42, // 3.5 years
    "5_to_10_years": 90, // 7.5 years
    "10_plus_years": 144, // 12 years (cap)
  };
  return monthsMap[timeReleasing] || 12;
}

// MLC launched January 2021 - cap months at time since then
export function getMonthsSinceMlcLaunch(): number {
  const mlcLaunch = new Date("2021-01-01");
  const now = new Date();
  const months =
    (now.getFullYear() - mlcLaunch.getFullYear()) * 12 +
    (now.getMonth() - mlcLaunch.getMonth());
  return months;
}
