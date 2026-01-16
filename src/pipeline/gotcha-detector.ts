import type { CompleteIntake } from "../types/intake.js";
import type { GotchaId, TriggeredGotcha } from "../types/gotcha.js";
import { GOTCHA_DEFINITIONS } from "../types/gotcha.js";

// =============================================================================
// GOTCHA DETECTION ENGINE
// =============================================================================

/**
 * Detects all gotchas that apply to a user's situation based on their intake data
 */
export function detectGotchas(data: CompleteIntake): TriggeredGotcha[] {
  const { intake, followUps } = data;
  const triggered: TriggeredGotcha[] = [];

  // Helper to add a gotcha
  const addGotcha = (id: GotchaId, triggeredBy: string) => {
    const def = GOTCHA_DEFINITIONS[id];
    triggered.push({
      id,
      ...def,
      triggeredBy,
    });
  };

  // ==========================================================================
  // CRITICAL GOTCHAS
  // ==========================================================================

  // #1: Double Publishing Admin
  if (
    intake.q10_publishing_admin !== "none" &&
    intake.q10_publishing_admin !== "not_sure" &&
    intake.q10_publishing_admin !== "distrokid" &&
    intake.q11_previous_admin === "yes" &&
    followUps.f2_admin_cancelled !== "yes_cancelled"
  ) {
    addGotcha(
      "double_publishing_admin",
      `Current admin (${intake.q10_publishing_admin}) and previous admin may both be active`
    );
  }

  // #6: No MLC (Critical if no admin)
  if (
    intake.q9_mlc !== "yes" &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "not_sure" ||
      intake.q10_publishing_admin === "distrokid") &&
    intake.q3_time_releasing !== "less_than_6_months"
  ) {
    addGotcha(
      "no_mlc",
      "No MLC registration and no publishing admin to collect mechanicals"
    );
  }

  // #11: Estate/Inherited Catalog
  if (
    intake.q15_managing_for === "managing_for_other" ||
    intake.q15_managing_for === "inherited_catalog"
  ) {
    addGotcha(
      "estate_inherited",
      `Managing for ${intake.q15_managing_for === "inherited_catalog" ? "inherited catalog" : "someone else"}`
    );
  }

  // #12: Legal Disputes
  if (intake.q16_disputes === "yes" || intake.q16_disputes === "possibly") {
    addGotcha(
      "legal_disputes",
      `Disputes status: ${intake.q16_disputes}`
    );
  }

  // #16: Missing PRO Publisher Share (50% of PRO income!)
  if (
    intake.q7_pro !== "none" &&
    intake.q7_pro !== "not_sure" &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "not_sure" ||
      intake.q10_publishing_admin === "distrokid") &&
    followUps.f17_pro_publishing_entity !== "yes_have_publishing_entity"
  ) {
    addGotcha(
      "missing_pro_publisher_share",
      "Has PRO but no publishing entity - missing 50% of performance royalties"
    );
  }

  // ==========================================================================
  // WARNING GOTCHAS
  // ==========================================================================

  // #2: PRO + Publishing Admin Overlap
  if (
    intake.q7_pro !== "none" &&
    intake.q7_pro !== "not_sure" &&
    intake.q10_publishing_admin !== "none" &&
    intake.q10_publishing_admin !== "not_sure" &&
    intake.q10_publishing_admin !== "distrokid" &&
    (followUps.f3_pro_registration_order === "i_registered_first" ||
      followUps.f3_pro_registration_order === "both_or_not_sure")
  ) {
    addGotcha(
      "pro_admin_overlap",
      "Registered with PRO before/alongside publishing admin - possible duplicates"
    );
  }

  // #3: Unconfirmed Splits
  if (
    intake.q12_has_cowriters === "yes" &&
    (followUps.f5_split_sheets_status === "no" ||
      followUps.f5_split_sheets_status === "yes_some" ||
      followUps.f5_split_sheets_status === "whats_a_split_sheet")
  ) {
    addGotcha(
      "unconfirmed_splits",
      `Split sheets status: ${followUps.f5_split_sheets_status || "not documented"}`
    );
  }

  // #4: Co-Writer Already Registered
  if (
    intake.q12_has_cowriters === "yes" &&
    (followUps.f6_cowriter_registered === "yes_they_registered" ||
      followUps.f6_cowriter_registered === "not_sure" ||
      followUps.f6_cowriter_registered === "some_have_some_havent")
  ) {
    addGotcha(
      "cowriter_already_registered",
      "Co-writers may have already registered - need to verify splits match"
    );
  }

  // #7: No SoundExchange
  if (intake.q8_soundexchange !== "yes") {
    addGotcha(
      "no_soundexchange",
      "Not registered with SoundExchange for digital radio royalties"
    );
  }

  // #7b: SoundExchange Only One Side
  if (
    intake.q8_soundexchange === "yes" &&
    (followUps.f18_soundexchange_registration_type === "rights_owner_only" ||
      followUps.f18_soundexchange_registration_type === "featured_artist_only" ||
      followUps.f18_soundexchange_registration_type === "not_sure")
  ) {
    addGotcha(
      "soundexchange_one_side",
      `Only registered as ${followUps.f18_soundexchange_registration_type} - missing ~half of SE royalties`
    );
  }

  // #8: Multiple Artist Names
  if (intake.q13_changed_names === "yes") {
    // Count names if provided
    const names = followUps.f7_previous_names?.split(",").length || 1;
    if (names >= 2) {
      addGotcha(
        "multiple_artist_names",
        `${names + 1} total artist names - registrations may be fragmented`
      );
    }
  }

  // #9: Dissolved Publishing Entity
  if (
    intake.q11_previous_admin === "yes" &&
    (followUps.f11_previous_admin_status === "closed" ||
      followUps.f11_previous_admin_status === "not_sure" ||
      followUps.f11_previous_admin_status === "acquired")
  ) {
    addGotcha(
      "dissolved_publishing_entity",
      `Previous admin status: ${followUps.f11_previous_admin_status}`
    );
  }

  // #10: Songs by Others Unregistered
  if (
    intake.q14_songs_by_others === "yes" &&
    (followUps.f10_registered_on_others === "no" ||
      followUps.f10_registered_on_others === "not_sure" ||
      followUps.f10_registered_on_others === "yes_some")
  ) {
    addGotcha(
      "songs_by_others_unregistered",
      "Songs recorded by other artists may not credit you as songwriter"
    );
  }

  // #13: High Income Without Professional Setup
  if (
    (intake.q6_monthly_income === "3000_to_10000" ||
      intake.q6_monthly_income === "10000_plus") &&
    (intake.q7_pro === "none" ||
      intake.q9_mlc !== "yes" ||
      intake.q8_soundexchange !== "yes")
  ) {
    addGotcha(
      "high_income_no_setup",
      "High income ($3k+/month) with missing registrations"
    );
  }

  // #15/#21: International Audience Without Publishing Admin
  if (
    (followUps.f16_audience_location === "mostly_outside_us" ||
      followUps.f16_audience_location === "mix") &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "not_sure" ||
      intake.q10_publishing_admin === "distrokid")
  ) {
    addGotcha(
      "international_no_admin",
      "Significant international audience but no publishing admin for global collection"
    );
  }

  // #20: CD Baby Pro Migration Gap
  if (
    followUps.f1_previous_admins?.includes("cd_baby_pro") &&
    followUps.f11_previous_admin_status !== "still_active"
  ) {
    addGotcha(
      "cd_baby_pro_migration_gap",
      "Previously used CD Baby Pro Publishing (discontinued 2023) - may have collection gap"
    );
  }

  // ==========================================================================
  // INFO GOTCHAS
  // ==========================================================================

  // #5: DistroKid Confusion
  if (
    intake.q5_distributor === "distrokid" &&
    (intake.q10_publishing_admin === "none" ||
      intake.q10_publishing_admin === "distrokid")
  ) {
    addGotcha(
      "distrokid_confusion",
      "Uses DistroKid and may think it covers publishing admin"
    );
  }

  // #14: New Artist
  if (
    intake.q3_time_releasing === "less_than_6_months" &&
    intake.q4_catalog_size === "1_to_10" &&
    intake.q6_monthly_income === "0_to_100"
  ) {
    addGotcha(
      "new_artist",
      "New artist with small catalog - can set up correctly from the start"
    );
  }

  return triggered;
}

/**
 * Check if any critical gotchas are present (blocks DIY)
 */
export function hasCriticalGotcha(gotchas: TriggeredGotcha[]): boolean {
  return gotchas.some((g) => g.severity === "critical" && g.blocksDiy);
}

/**
 * Get gotchas by severity
 */
export function getGotchasBySeverity(
  gotchas: TriggeredGotcha[],
  severity: "critical" | "warning" | "info"
): TriggeredGotcha[] {
  return gotchas.filter((g) => g.severity === severity);
}
