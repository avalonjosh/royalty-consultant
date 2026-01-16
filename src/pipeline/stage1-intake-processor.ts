import type { CompleteIntake, IntakeForm, FollowUpAnswers } from "../types/intake.js";
import type { TriggeredGotcha } from "../types/gotcha.js";
import type { Calculations } from "../types/estimates.js";
import { detectGotchas, hasCriticalGotcha } from "./gotcha-detector.js";
import { calculateEstimates } from "./estimator.js";
import { getTriggeredFollowUps, type FollowUpQuestion } from "../intake/follow-up-questions.js";

// =============================================================================
// STAGE 1: INTAKE PROCESSING
// =============================================================================

/**
 * Stage 1 Output: Structured data for plan generation
 */
export interface Stage1Output {
  // Original intake data
  intake: IntakeForm;
  followUps: FollowUpAnswers;

  // Processed data
  registrations: {
    hasDistributor: boolean;
    distributor: string | null;
    hasPro: boolean;
    proName: string | null;
    hasMlc: boolean;
    mlcCoveredByAdmin: boolean;
    hasSoundexchange: boolean;
    soundexchangeBothSides: boolean | null;
    soundexchangeOneSide: boolean | null;
    soundexchangeRegisteredAs: string | null;
    hasPublishingAdmin: boolean;
    publishingAdmin: string | null;
    hasPreviousAdmin: boolean;
    previousAdminCancelled: boolean | null;
    hasProPublishingEntity: boolean | null;
  };

  // Complexity factors
  complexityFactors: {
    hasCowriters: boolean;
    cowriterCount: string | null;
    splitSheetsStatus: string | null;
    nameChanges: boolean;
    previousNames: string | null;
    songsByOthers: boolean;
    managingForOther: boolean;
    inheritedCatalog: boolean;
    disputes: boolean | string;
  };

  // Gotchas detected
  gotchasDetected: TriggeredGotcha[];
  hasCriticalGotcha: boolean;

  // Follow-ups needed (for Stage 2 if not all answered)
  followUpsNeeded: FollowUpQuestion[];
  followUpsAnswered: boolean;

  // Calculations
  calculations: Calculations;

  // Metadata
  timestamp: string;
}

/**
 * Process intake form answers into structured data
 */
export function processIntake(
  intake: IntakeForm,
  followUps: FollowUpAnswers = {}
): Stage1Output {
  const completeIntake: CompleteIntake = { intake, followUps };

  // Determine what we have for registrations
  const hasPro = intake.q7_pro !== "none" && intake.q7_pro !== "not_sure";
  const hasPublishingAdmin =
    intake.q10_publishing_admin !== "none" &&
    intake.q10_publishing_admin !== "not_sure" &&
    intake.q10_publishing_admin !== "distrokid";

  const registrations = {
    hasDistributor: intake.q5_distributor !== "none",
    distributor:
      intake.q5_distributor !== "none" ? intake.q5_distributor : null,

    hasPro,
    proName: hasPro ? intake.q7_pro : null,

    hasMlc: intake.q9_mlc === "yes",
    mlcCoveredByAdmin: hasPublishingAdmin, // Most admins cover MLC

    hasSoundexchange: intake.q8_soundexchange === "yes",
    soundexchangeBothSides:
      intake.q8_soundexchange === "yes"
        ? followUps.f18_soundexchange_registration_type ===
          "both_rights_owner_and_featured_artist"
        : null,
    soundexchangeOneSide:
      intake.q8_soundexchange === "yes"
        ? followUps.f18_soundexchange_registration_type ===
            "rights_owner_only" ||
          followUps.f18_soundexchange_registration_type === "featured_artist_only"
        : null,
    soundexchangeRegisteredAs:
      intake.q8_soundexchange === "yes"
        ? followUps.f18_soundexchange_registration_type || null
        : null,

    hasPublishingAdmin,
    publishingAdmin: hasPublishingAdmin ? intake.q10_publishing_admin : null,

    hasPreviousAdmin: intake.q11_previous_admin === "yes",
    previousAdminCancelled:
      intake.q11_previous_admin === "yes"
        ? followUps.f2_admin_cancelled === "yes_cancelled"
        : null,

    hasProPublishingEntity:
      hasPro && !hasPublishingAdmin
        ? followUps.f17_pro_publishing_entity === "yes_have_publishing_entity"
        : null,
  };

  // Complexity factors
  const complexityFactors = {
    hasCowriters: intake.q12_has_cowriters === "yes",
    cowriterCount:
      intake.q12_has_cowriters === "yes"
        ? followUps.f4_cowriter_count || null
        : null,
    splitSheetsStatus:
      intake.q12_has_cowriters === "yes"
        ? followUps.f5_split_sheets_status || null
        : null,
    nameChanges: intake.q13_changed_names === "yes",
    previousNames:
      intake.q13_changed_names === "yes"
        ? followUps.f7_previous_names || null
        : null,
    songsByOthers: intake.q14_songs_by_others === "yes",
    managingForOther: intake.q15_managing_for === "managing_for_other",
    inheritedCatalog: intake.q15_managing_for === "inherited_catalog",
    disputes:
      intake.q16_disputes === "yes"
        ? followUps.f15_dispute_description || true
        : intake.q16_disputes === "possibly"
          ? "possibly"
          : false,
  };

  // Detect gotchas
  const gotchasDetected = detectGotchas(completeIntake);
  const criticalGotcha = hasCriticalGotcha(gotchasDetected);

  // Determine follow-ups needed
  const followUpsNeeded = getTriggeredFollowUps(intake);
  const followUpsAnswered = followUpsNeeded.every((q) => {
    const key = q.id as keyof FollowUpAnswers;
    return followUps[key] !== undefined;
  });

  // Calculate estimates
  const calculations = calculateEstimates(completeIntake, gotchasDetected);

  return {
    intake,
    followUps,
    registrations,
    complexityFactors,
    gotchasDetected,
    hasCriticalGotcha: criticalGotcha,
    followUpsNeeded,
    followUpsAnswered,
    calculations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format distributor name for display
 */
export function formatDistributorName(distributor: string | null): string {
  const names: Record<string, string> = {
    distrokid: "DistroKid",
    tunecore: "TuneCore",
    cd_baby: "CD Baby",
    awal: "AWAL",
    ditto: "Ditto",
    unitedmasters: "UnitedMasters",
    other: "Other",
    none: "None",
  };
  return distributor ? names[distributor] || distributor : "None";
}

/**
 * Format PRO name for display
 */
export function formatProName(pro: string | null): string {
  const names: Record<string, string> = {
    ascap: "ASCAP",
    bmi: "BMI",
    sesac: "SESAC",
    gmr: "GMR",
    none: "None",
    not_sure: "Not sure",
  };
  return pro ? names[pro] || pro : "None";
}

/**
 * Format publishing admin name for display
 */
export function formatPublishingAdminName(admin: string | null): string {
  const names: Record<string, string> = {
    songtrust: "Songtrust",
    cd_baby_pro: "CD Baby Pro",
    tunecore_publishing: "TuneCore Publishing",
    sentric: "Sentric",
    distrokid: "DistroKid (not actually publishing admin)",
    other: "Other",
    none: "None",
    not_sure: "Not sure",
  };
  return admin ? names[admin] || admin : "None";
}

/**
 * Format income range for display
 */
export function formatIncomeRange(income: string): string {
  const ranges: Record<string, string> = {
    "0_to_100": "$0-100",
    "100_to_500": "$100-500",
    "500_to_1000": "$500-1,000",
    "1000_to_3000": "$1,000-3,000",
    "3000_to_10000": "$3,000-10,000",
    "10000_plus": "$10,000+",
  };
  return ranges[income] || income;
}

/**
 * Format time releasing for display
 */
export function formatTimeReleasing(time: string): string {
  const times: Record<string, string> = {
    less_than_6_months: "Less than 6 months",
    "6_months_to_2_years": "6 months to 2 years",
    "2_to_5_years": "2-5 years",
    "5_to_10_years": "5-10 years",
    "10_plus_years": "10+ years",
  };
  return times[time] || time;
}

/**
 * Format catalog size for display
 */
export function formatCatalogSize(size: string): string {
  const sizes: Record<string, string> = {
    "1_to_10": "1-10 songs",
    "11_to_25": "11-25 songs",
    "26_to_50": "26-50 songs",
    "51_to_100": "51-100 songs",
    "100_plus": "100+ songs",
  };
  return sizes[size] || size;
}
