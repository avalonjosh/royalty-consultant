/**
 * Demo: Run the Royalty Health Report pipeline with sample data
 *
 * Usage: npx tsx src/demo.ts
 */

import { runPipeline } from "./pipeline/index.js";
import type { IntakeForm, FollowUpAnswers } from "./types/intake.js";
import { CONFIG } from "./types/report.js";

// =============================================================================
// SAMPLE TEST CASES
// =============================================================================

/**
 * Test Case 1: Simple Case - New Artist Missing Everything
 * Expected: DIY recommended, straightforward action plan
 */
const SIMPLE_CASE: { intake: IntakeForm; followUps: FollowUpAnswers } = {
  intake: {
    q1_artist_name: "Marc Waves",
    q2_legal_name: "Marcus Johnson",
    q3_time_releasing: "6_months_to_2_years",
    q4_catalog_size: "1_to_10",
    q5_distributor: "distrokid",
    q6_monthly_income: "500_to_1000",
    q7_pro: "none",
    q8_soundexchange: "no",
    q9_mlc: "no",
    q10_publishing_admin: "none",
    q11_previous_admin: "no",
    q12_has_cowriters: "yes",
    q13_changed_names: "no",
    q14_songs_by_others: "no",
    q15_managing_for: "own_music",
    q16_disputes: "no",
  },
  followUps: {
    f4_cowriter_count: "1_to_5",
    f5_split_sheets_status: "yes_some",
    f6_cowriter_registered: "no_they_havent",
    f16_audience_location: "mostly_us",
  },
};

/**
 * Test Case 2: PRO Member Missing Publisher Share
 * Expected: Critical warning about missing 50% of PRO income
 */
const MISSING_PUBLISHER_SHARE: { intake: IntakeForm; followUps: FollowUpAnswers } = {
  intake: {
    q1_artist_name: "Sarah Sound",
    q2_legal_name: "Sarah Thompson",
    q3_time_releasing: "2_to_5_years",
    q4_catalog_size: "26_to_50",
    q5_distributor: "tunecore",
    q6_monthly_income: "1000_to_3000",
    q7_pro: "ascap",
    q8_soundexchange: "yes",
    q9_mlc: "yes",
    q10_publishing_admin: "none",
    q11_previous_admin: "no",
    q12_has_cowriters: "no",
    q13_changed_names: "no",
    q14_songs_by_others: "no",
    q15_managing_for: "own_music",
    q16_disputes: "no",
  },
  followUps: {
    f17_pro_publishing_entity: "no_only_writer",
    f18_soundexchange_registration_type: "both_rights_owner_and_featured_artist",
    f16_audience_location: "mostly_us",
  },
};

/**
 * Test Case 3: SoundExchange Only One Side
 * Expected: Warning about missing ~half of SoundExchange royalties
 */
const SE_ONE_SIDE: { intake: IntakeForm; followUps: FollowUpAnswers } = {
  intake: {
    q1_artist_name: "DJ Beats",
    q2_legal_name: "David Johnson",
    q3_time_releasing: "2_to_5_years",
    q4_catalog_size: "11_to_25",
    q5_distributor: "distrokid",
    q6_monthly_income: "500_to_1000",
    q7_pro: "bmi",
    q8_soundexchange: "yes",
    q9_mlc: "yes",
    q10_publishing_admin: "none",
    q11_previous_admin: "no",
    q12_has_cowriters: "no",
    q13_changed_names: "no",
    q14_songs_by_others: "no",
    q15_managing_for: "own_music",
    q16_disputes: "no",
  },
  followUps: {
    f17_pro_publishing_entity: "yes_have_publishing_entity",
    f18_soundexchange_registration_type: "featured_artist_only",
    f16_audience_location: "mostly_us",
  },
};

/**
 * Test Case 4: Complex - Double Admin (Critical)
 * Expected: BLOCKED, consultation required
 */
const DOUBLE_ADMIN: { intake: IntakeForm; followUps: FollowUpAnswers } = {
  intake: {
    q1_artist_name: "Melody Maker",
    q2_legal_name: "Michelle Davis",
    q3_time_releasing: "5_to_10_years",
    q4_catalog_size: "51_to_100",
    q5_distributor: "cd_baby",
    q6_monthly_income: "3000_to_10000",
    q7_pro: "ascap",
    q8_soundexchange: "yes",
    q9_mlc: "not_sure",
    q10_publishing_admin: "songtrust",
    q11_previous_admin: "yes",
    q12_has_cowriters: "yes",
    q13_changed_names: "yes",
    q14_songs_by_others: "yes",
    q15_managing_for: "own_music",
    q16_disputes: "no",
  },
  followUps: {
    f1_previous_admins: ["cd_baby_pro", "tunecore_publishing"],
    f2_admin_cancelled: "not_sure",
    f3_pro_registration_order: "both_or_not_sure",
    f4_cowriter_count: "16_to_30",
    f5_split_sheets_status: "yes_some",
    f6_cowriter_registered: "not_sure",
    f7_previous_names: "M. Davis, MelodyM",
    f8_songs_per_name: "M. Davis: 20 songs, MelodyM: 15 songs",
    f9_songs_by_others_count: "4_to_10",
    f10_registered_on_others: "not_sure",
    f11_previous_admin_status: "not_sure",
    f18_soundexchange_registration_type: "both_rights_owner_and_featured_artist",
    f16_audience_location: "mix",
  },
};

/**
 * Test Case 5: Estate/Inherited (Critical)
 * Expected: BLOCKED, consultation required
 */
const ESTATE_CASE: { intake: IntakeForm; followUps: FollowUpAnswers } = {
  intake: {
    q1_artist_name: "Johnny Blues",
    q2_legal_name: "John Williams Sr.",
    q3_time_releasing: "10_plus_years",
    q4_catalog_size: "100_plus",
    q5_distributor: "cd_baby",
    q6_monthly_income: "1000_to_3000",
    q7_pro: "bmi",
    q8_soundexchange: "yes",
    q9_mlc: "not_sure",
    q10_publishing_admin: "none",
    q11_previous_admin: "not_sure",
    q12_has_cowriters: "yes",
    q13_changed_names: "no",
    q14_songs_by_others: "yes",
    q15_managing_for: "inherited_catalog",
    q16_disputes: "possibly",
  },
  followUps: {
    f12_relationship: "family",
    f13_deceased: "yes",
    f14_legal_authority: "in_progress",
    f15_dispute_description: "Some songs may have unclear co-writer credits from the 1970s",
    f16_audience_location: "mostly_us",
  },
};

// =============================================================================
// RUN DEMO
// =============================================================================

function runDemo() {
  console.log("=".repeat(80));
  console.log("ROYALTY HEALTH REPORT PIPELINE - DEMO");
  console.log("=".repeat(80));
  console.log();

  const testCases = [
    { name: "Simple Case (New Artist)", data: SIMPLE_CASE },
    { name: "Missing PRO Publisher Share", data: MISSING_PUBLISHER_SHARE },
    { name: "SoundExchange Only One Side", data: SE_ONE_SIDE },
    { name: "Double Admin (Critical)", data: DOUBLE_ADMIN },
    { name: "Estate/Inherited (Critical)", data: ESTATE_CASE },
  ];

  for (const testCase of testCases) {
    console.log("-".repeat(80));
    console.log(`TEST CASE: ${testCase.name}`);
    console.log("-".repeat(80));
    console.log();

    const result = runPipeline(
      testCase.data.intake,
      testCase.data.followUps,
      CONFIG
    );

    // Summary
    console.log("SUMMARY:");
    console.log(`  Artist: ${result.reportData.artistName}`);
    console.log(`  Score: ${result.reportData.score}/10 (${result.reportData.scoreLabel})`);
    console.log(`  Complexity: ${result.reportData.complexity}`);
    console.log(`  Recommendation: ${result.reportData.recommendation}`);
    console.log(`  Estimated Unclaimed: ${result.reportData.estimateLow} - ${result.reportData.estimateHigh}`);
    console.log(`  Monthly Gap: ~${result.reportData.monthlyGap}/month`);
    console.log(`  DIY Time: ${result.reportData.totalDiyTime}`);
    console.log(`  Blocked: ${result.reportData.isCritical}`);
    console.log();

    // Gotchas
    if (result.stage1.gotchasDetected.length > 0) {
      console.log("GOTCHAS DETECTED:");
      for (const gotcha of result.stage1.gotchasDetected) {
        const icon =
          gotcha.severity === "critical"
            ? "🔴"
            : gotcha.severity === "warning"
              ? "⚠️"
              : "ℹ️";
        console.log(`  ${icon} ${gotcha.title} (${gotcha.severity})`);
      }
      console.log();
    }

    // Follow-ups needed
    if (result.stage2.totalQuestions > 0) {
      console.log(`FOLLOW-UPS NEEDED: ${result.stage2.totalQuestions}`);
      for (const q of result.stage2.questions) {
        console.log(`  - [${q.priority}] ${q.id}: ${q.question.substring(0, 50)}...`);
      }
      console.log();
    }

    // Action Items
    const totalActions =
      result.reportData.actionsPriority1.length +
      result.reportData.actionsPriority2.length +
      result.reportData.actionsPriority3.length;

    if (totalActions > 0 && !result.reportData.isCritical) {
      console.log(`ACTION ITEMS: ${totalActions}`);
      for (const action of result.reportData.actionsPriority1) {
        console.log(`  [P1] ${action.title}`);
      }
      for (const action of result.reportData.actionsPriority2) {
        console.log(`  [P2] ${action.title}`);
      }
      for (const action of result.reportData.actionsPriority3) {
        console.log(`  [P3] ${action.title}`);
      }
      console.log();
    }

    // Print full report for first case only (to show format)
    if (testCase.name === "Simple Case (New Artist)") {
      console.log("FULL REPORT OUTPUT:");
      console.log("=".repeat(40));
      console.log(result.reportMarkdown);
      console.log("=".repeat(40));
    }

    console.log();
  }
}

// Run the demo
runDemo();
