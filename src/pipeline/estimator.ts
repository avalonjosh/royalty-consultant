import type { CompleteIntake } from "../types/intake.js";
import type {
  Estimate,
  AllEstimates,
  Calculations,
  ScoreLabel,
  ComplexityLevel,
  Recommendation,
} from "../types/estimates.js";
import {
  INCOME_MIDPOINTS,
  CATALOG_COUNTS,
  COWRITER_COUNT_VALUES,
  SONGS_BY_OTHERS_VALUES,
  GENRE_MULTIPLIERS,
  BASE_TIMES,
  getMonthsSinceStart,
  getMonthsSinceMlcLaunch,
} from "../types/estimates.js";
import type { TriggeredGotcha } from "../types/gotcha.js";

// =============================================================================
// ESTIMATION ENGINE
// =============================================================================

/**
 * Calculate all royalty estimates based on intake data
 */
export function calculateEstimates(
  data: CompleteIntake,
  gotchas: TriggeredGotcha[]
): Calculations {
  const { intake, followUps } = data;

  // Get base values
  const monthlyIncome = INCOME_MIDPOINTS[intake.q6_monthly_income] || 300;
  const catalogSize = CATALOG_COUNTS[intake.q4_catalog_size] || 10;
  const monthsSinceStart = getMonthsSinceStart(intake.q3_time_releasing);
  const monthsSinceMlc = getMonthsSinceMlcLaunch();

  // Genre multiplier (default to 1.0 since we don't ask for genre)
  const genreMultiplier = GENRE_MULTIPLIERS["unknown"];

  // ==========================================================================
  // INDIVIDUAL ESTIMATES
  // ==========================================================================

  // MLC Estimate (Formula 1)
  const mlcApplicable =
    intake.q9_mlc !== "yes" &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "not_sure" ||
      intake.q10_publishing_admin === "distrokid");

  const mlcMonthly = monthlyIncome * 0.12;
  const mlcMonthsMissed = Math.min(monthsSinceStart, monthsSinceMlc);
  const mlcTotal = mlcMonthly * mlcMonthsMissed;

  const mlc: Estimate = {
    monthly: mlcApplicable ? Math.round(mlcMonthly) : 0,
    totalLow: mlcApplicable ? Math.round(mlcTotal * 0.7) : 0,
    totalHigh: mlcApplicable ? Math.round(mlcTotal * 1.3) : 0,
    monthsMissed: mlcApplicable ? mlcMonthsMissed : 0,
    applicable: mlcApplicable,
  };

  // SoundExchange Estimate (Formula 2)
  const seApplicable = intake.q8_soundexchange !== "yes";
  const seMonthly = monthlyIncome * 0.03 * genreMultiplier;
  const seMonthsMissed = Math.min(monthsSinceStart, 60); // Cap at 5 years
  const seTotal = seMonthly * seMonthsMissed;

  const soundexchange: Estimate = {
    monthly: seApplicable ? Math.round(seMonthly) : 0,
    totalLow: seApplicable ? Math.round(seTotal * 0.5) : 0,
    totalHigh: seApplicable ? Math.round(seTotal * 1.5) : 0,
    monthsMissed: seApplicable ? seMonthsMissed : 0,
    applicable: seApplicable,
  };

  // SoundExchange Missing Side (Formula 3c)
  const seMissingSideApplicable =
    intake.q8_soundexchange === "yes" &&
    (followUps.f18_soundexchange_registration_type === "rights_owner_only" ||
      followUps.f18_soundexchange_registration_type === "featured_artist_only" ||
      followUps.f18_soundexchange_registration_type === "not_sure");

  // If they have SE, estimate their current SE income, then they're missing about equal
  const seCurrentMonthly = monthlyIncome * 0.03 * genreMultiplier * 0.5; // Half of what they should get
  const seMissingSideMonthsMissed = Math.min(monthsSinceStart, 60);
  const seMissingSideTotal = seCurrentMonthly * seMissingSideMonthsMissed;

  const soundexchangeMissingSide: Estimate = {
    monthly: seMissingSideApplicable ? Math.round(seCurrentMonthly) : 0,
    totalLow: seMissingSideApplicable ? Math.round(seMissingSideTotal * 0.5) : 0,
    totalHigh: seMissingSideApplicable ? Math.round(seMissingSideTotal * 1.5) : 0,
    monthsMissed: seMissingSideApplicable ? seMissingSideMonthsMissed : 0,
    applicable: seMissingSideApplicable,
    note: "Only applies if registered but only on one side",
  };

  // PRO Estimate (Formula 3)
  const proApplicable =
    intake.q7_pro === "none" || intake.q7_pro === "not_sure";
  const proMonthly = monthlyIncome * 0.04;
  const proMonthsMissed = Math.min(monthsSinceStart, 60);
  const proTotal = proMonthly * proMonthsMissed;

  const pro: Estimate = {
    monthly: proApplicable ? Math.round(proMonthly) : 0,
    totalLow: proApplicable ? Math.round(proTotal * 0.5) : 0,
    totalHigh: proApplicable ? Math.round(proTotal * 2.0) : 0,
    monthsMissed: proApplicable ? proMonthsMissed : 0,
    applicable: proApplicable,
  };

  // PRO Publisher Share (Formula 3b)
  const proPublisherApplicable =
    intake.q7_pro !== "none" &&
    intake.q7_pro !== "not_sure" &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "not_sure" ||
      intake.q10_publishing_admin === "distrokid") &&
    followUps.f17_pro_publishing_entity !== "yes_have_publishing_entity";

  const proPublisherMonthly = proMonthly; // Equal to writer share
  const proPublisherMonthsMissed = Math.min(monthsSinceStart, 60);
  const proPublisherTotal = proPublisherMonthly * proPublisherMonthsMissed;

  const proPublisherShare: Estimate = {
    monthly: proPublisherApplicable ? Math.round(proPublisherMonthly) : 0,
    totalLow: proPublisherApplicable ? Math.round(proPublisherTotal * 0.5) : 0,
    totalHigh: proPublisherApplicable ? Math.round(proPublisherTotal * 2.0) : 0,
    monthsMissed: proPublisherApplicable ? proPublisherMonthsMissed : 0,
    applicable: proPublisherApplicable,
    note: "Only applies if PRO member but no publishing entity",
  };

  // Songs by Others (Formula 4)
  const songsByOthersApplicable =
    intake.q14_songs_by_others === "yes" &&
    (followUps.f10_registered_on_others === "no" ||
      followUps.f10_registered_on_others === "not_sure" ||
      followUps.f10_registered_on_others === "yes_some");

  const songsByOthersCount =
    SONGS_BY_OTHERS_VALUES[followUps.f9_songs_by_others_count || "1_to_3"] || 2;
  const perSongMonthly = 25; // Conservative estimate
  const songsByOthersMonthly = songsByOthersCount * perSongMonthly;
  const songsByOthersMonthsMissed = 24; // Assume ~2 years
  const songsByOthersTotal = songsByOthersMonthly * songsByOthersMonthsMissed;

  const songsByOthers: Estimate = {
    monthly: songsByOthersApplicable ? Math.round(songsByOthersMonthly) : 0,
    totalLow: songsByOthersApplicable ? Math.round(songsByOthersTotal * 0.3) : 0,
    totalHigh: songsByOthersApplicable ? Math.round(songsByOthersTotal * 3.0) : 0,
    monthsMissed: songsByOthersApplicable ? songsByOthersMonthsMissed : 0,
    applicable: songsByOthersApplicable,
  };

  // ==========================================================================
  // TOTALS
  // ==========================================================================

  const estimates: AllEstimates = {
    mlc,
    soundexchange,
    soundexchangeMissingSide,
    pro,
    proPublisherShare,
    songsByOthers,
    total: {
      monthlyGap:
        mlc.monthly +
        soundexchange.monthly +
        soundexchangeMissingSide.monthly +
        pro.monthly +
        proPublisherShare.monthly +
        songsByOthers.monthly,
      totalLow:
        mlc.totalLow +
        soundexchange.totalLow +
        soundexchangeMissingSide.totalLow +
        pro.totalLow +
        proPublisherShare.totalLow +
        songsByOthers.totalLow,
      totalHigh:
        mlc.totalHigh +
        soundexchange.totalHigh +
        soundexchangeMissingSide.totalHigh +
        pro.totalHigh +
        proPublisherShare.totalHigh +
        songsByOthers.totalHigh,
    },
  };

  // ==========================================================================
  // SCORE CALCULATION (Formula 5)
  // ==========================================================================

  let score = 0;

  // Has distributor
  if (intake.q5_distributor !== "none") score += 2;

  // Has PRO
  if (intake.q7_pro !== "none" && intake.q7_pro !== "not_sure") {
    score += 2;
    // Works registered (we don't know, so give benefit of doubt)
    score += 1;
  }

  // Has MLC or publishing admin
  if (
    intake.q9_mlc === "yes" ||
    (intake.q10_publishing_admin !== "none" &&
      intake.q10_publishing_admin !== "not_sure" &&
      intake.q10_publishing_admin !== "distrokid")
  ) {
    score += 2;
  }

  // Has SoundExchange
  if (intake.q8_soundexchange === "yes") score += 2;

  // No critical flags (but don't count estate/disputes as those block anyway)
  const hasCriticalIssues = gotchas.some(
    (g) =>
      g.severity === "critical" &&
      g.id !== "estate_inherited" &&
      g.id !== "legal_disputes"
  );
  if (!hasCriticalIssues) score += 1;

  // Ensure score is 0-10
  score = Math.min(10, Math.max(0, score));

  const scoreLabel: ScoreLabel =
    score >= 9
      ? "Excellent"
      : score >= 7
        ? "Good"
        : score >= 5
          ? "Fair"
          : score >= 3
            ? "Poor"
            : "Critical";

  // ==========================================================================
  // COMPLEXITY CALCULATION (Formula 8)
  // ==========================================================================

  let complexityPoints = 0;

  // Catalog size
  if (
    intake.q4_catalog_size === "51_to_100" ||
    intake.q4_catalog_size === "100_plus"
  )
    complexityPoints += 1;
  if (intake.q4_catalog_size === "100_plus") complexityPoints += 1;

  // Co-writers
  if (intake.q12_has_cowriters === "yes") {
    complexityPoints += 1;
    if (
      followUps.f4_cowriter_count === "16_to_30" ||
      followUps.f4_cowriter_count === "most_or_all"
    )
      complexityPoints += 1;
    if (
      followUps.f5_split_sheets_status === "no" ||
      followUps.f5_split_sheets_status === "whats_a_split_sheet"
    )
      complexityPoints += 1;
  }

  // Name changes
  if (intake.q13_changed_names === "yes") {
    complexityPoints += 1;
    const nameCount = (followUps.f7_previous_names?.split(",").length || 0) + 1;
    if (nameCount > 2) complexityPoints += 1;
  }

  // Publishing admin history
  if (intake.q11_previous_admin === "yes") {
    complexityPoints += 1;
    if (
      followUps.f2_admin_cancelled !== "yes_cancelled" ||
      followUps.f11_previous_admin_status === "not_sure"
    )
      complexityPoints += 2;
  }

  // Songs by others
  if (intake.q14_songs_by_others === "yes") complexityPoints += 1;

  // Income level
  if (
    intake.q6_monthly_income === "3000_to_10000" ||
    intake.q6_monthly_income === "10000_plus"
  )
    complexityPoints += 1;

  // Critical gotchas
  const anyCritical = gotchas.some((g) => g.blocksDiy);
  if (anyCritical) complexityPoints += 5;

  const complexity: ComplexityLevel =
    complexityPoints >= 5
      ? "Complex"
      : complexityPoints >= 2
        ? "Moderate"
        : "Simple";

  // ==========================================================================
  // RECOMMENDATION (Formula 9)
  // ==========================================================================

  let recommendation: Recommendation;
  let blockDiy = false;

  if (anyCritical) {
    recommendation = "Consultation Required";
    blockDiy = true;
  } else if (
    complexity === "Complex" ||
    intake.q6_monthly_income === "10000_plus"
  ) {
    recommendation = "Done-For-You Recommended";
  } else if (complexity === "Moderate") {
    recommendation = "DIY or Done-For-You";
  } else {
    recommendation = "DIY";
  }

  // ==========================================================================
  // DIY TIME ESTIMATE (Formula 7)
  // ==========================================================================

  let diyTimeMinutes = 0;

  // PRO registration
  if (proApplicable || proPublisherApplicable) {
    diyTimeMinutes +=
      BASE_TIMES.joinPro + catalogSize * BASE_TIMES.registerWorksPerSong;
  }

  // Publishing entity creation
  if (proPublisherApplicable) {
    diyTimeMinutes += BASE_TIMES.createPublishingEntity;
  }

  // MLC registration
  if (mlcApplicable) {
    diyTimeMinutes +=
      BASE_TIMES.joinMlc + catalogSize * BASE_TIMES.registerMlcPerSong;
  }

  // SoundExchange registration
  if (seApplicable || seMissingSideApplicable) {
    diyTimeMinutes += BASE_TIMES.joinSoundexchange;
  }

  // Split documentation
  if (intake.q12_has_cowriters === "yes") {
    const cowriterSongs =
      followUps.f4_cowriter_count === "most_or_all"
        ? Math.round(catalogSize * 0.8)
        : COWRITER_COUNT_VALUES[followUps.f4_cowriter_count || "1_to_5"] || 3;
    diyTimeMinutes += cowriterSongs * BASE_TIMES.documentSplitsPerSong;
  }

  const diyTimeHoursLow = Math.round((diyTimeMinutes / 60) * 0.8);
  const diyTimeHoursHigh = Math.round((diyTimeMinutes / 60) * 1.2);

  return {
    estimates,
    score,
    scoreLabel,
    complexity,
    complexityPoints,
    recommendation,
    diyTimeHoursLow: Math.max(1, diyTimeHoursLow),
    diyTimeHoursHigh: Math.max(2, diyTimeHoursHigh),
    blockDiy,
  };
}

/**
 * Format a dollar amount for display
 */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

/**
 * Format an estimate range for display
 */
export function formatEstimateRange(low: number, high: number): string {
  return `${formatMoney(low)} - ${formatMoney(high)}`;
}
