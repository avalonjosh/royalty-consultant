import { z } from "zod";
import { GotchaSeveritySchema, TriggeredGotchaSchema } from "./gotcha.js";
import { AllEstimatesSchema, ComplexityLevelSchema, RecommendationSchema, ScoreLabelSchema } from "./estimates.js";

// =============================================================================
// REPORT OUTPUT TYPES
// =============================================================================

export const RegistrationItemSchema = z.object({
  name: z.string(),
  description: z.string(),
});
export type RegistrationItem = z.infer<typeof RegistrationItemSchema>;

export const MissingRegistrationSchema = z.object({
  name: z.string(),
  whatItCollects: z.string(),
});
export type MissingRegistration = z.infer<typeof MissingRegistrationSchema>;

export const WarningSchema = z.object({
  icon: z.string(), // 🔴, ⚠️, or 🟢
  title: z.string(),
  description: z.string(),
  consequence: z.string(),
  action: z.string(),
});
export type Warning = z.infer<typeof WarningSchema>;

export const ActionItemSchema = z.object({
  number: z.number(),
  title: z.string(),
  why: z.string(),
  instructions: z.string(),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
  timeEstimate: z.string(),
  requirements: z.array(z.string()).optional(),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

export const DiyTimeEstimateSchema = z.object({
  task: z.string(),
  time: z.string(),
});
export type DiyTimeEstimate = z.infer<typeof DiyTimeEstimateSchema>;

export const MissingEstimateLineSchema = z.object({
  name: z.string(),
  monthly: z.string(),
  total: z.string(),
});
export type MissingEstimateLine = z.infer<typeof MissingEstimateLineSchema>;

// =============================================================================
// FULL REPORT DATA STRUCTURE
// =============================================================================

export const ReportDataSchema = z.object({
  // User Data
  artistName: z.string(),
  legalName: z.string(),
  currentDate: z.string(),
  distributor: z.string(),
  monthlyIncome: z.string(),
  catalogSize: z.string(),
  timeReleasing: z.string(),

  // Quick Summary
  score: z.number(),
  scoreLabel: ScoreLabelSchema,
  estimateLow: z.string(),
  estimateHigh: z.string(),
  monthlyGap: z.string(),
  complexity: ComplexityLevelSchema,
  recommendation: RecommendationSchema,

  // Current Setup
  registrationsHave: z.array(RegistrationItemSchema),
  registrationsMissing: z.array(MissingRegistrationSchema),

  // Status Fields
  hasDistributor: z.boolean(),
  hasPro: z.boolean(),
  proName: z.string().nullable(),
  proWorksRegistered: z.boolean().nullable(),
  hasProPublishingEntity: z.boolean().nullable(),
  hasMlc: z.boolean(),
  hasPublishingAdmin: z.boolean(),
  publishingAdmin: z.string().nullable(),
  hasSoundexchange: z.boolean(),
  soundexchangeBothSides: z.boolean().nullable(),
  soundexchangeOneSide: z.boolean().nullable(),
  soundexchangeRegisteredAs: z.string().nullable(),

  // Estimates Table
  missingEstimates: z.array(MissingEstimateLineSchema),
  totalMonthlyLoss: z.string(),
  totalLossEstimate: z.string(),
  estimationExplanation: z.string(),

  // Warnings
  hasWarnings: z.boolean(),
  warnings: z.array(WarningSchema),
  isCritical: z.boolean(),
  criticalMessage: z.string().optional(),

  // Action Plan
  actionsPriority1: z.array(ActionItemSchema),
  actionsPriority2: z.array(ActionItemSchema),
  actionsPriority3: z.array(ActionItemSchema),

  // DIY Time
  diyTimeEstimates: z.array(DiyTimeEstimateSchema),
  totalDiyTime: z.string(),

  // Pricing (configurable)
  dfyPrice: z.string(),
  ongoingPrice: z.string(),
  dfyBestFor: z.string(),

  // Links (configurable)
  consultationLink: z.string(),
  dfyLink: z.string(),
  fullServiceLink: z.string(),
  callLink: z.string(),
  splitSheetLink: z.string(),
});

export type ReportData = z.infer<typeof ReportDataSchema>;

// =============================================================================
// CONFIGURATION
// =============================================================================

export const CONFIG = {
  pricing: {
    planOnly: 49,
    doneForYouLow: 399,
    doneForYouHigh: 599,
    ongoingLow: 99,
    ongoingHigh: 149,
  },
  links: {
    consultation: "https://calendly.com/theroyaltyguy/consultation",
    purchaseDfy: "https://theroyaltyguy.com/done-for-you",
    purchaseFull: "https://theroyaltyguy.com/full-service",
    freeCall: "https://calendly.com/theroyaltyguy/free-call",
    splitSheetTemplate: "https://theroyaltyguy.com/split-sheet",
  },
  externalLinks: {
    ascapJoin: "https://www.ascap.com/join",
    bmiJoin: "https://www.bmi.com/join",
    mlc: "https://www.themlc.com",
    soundexchange: "https://www.soundexchange.com",
    songview: "https://songview.com",
  },
  brand: {
    name: "The Royalty Guy",
    tagline: "Your royalties, handled.",
  },
};
