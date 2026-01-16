import Anthropic from "@anthropic-ai/sdk";
import type { Stage1Output } from "./stage1-intake-processor.js";
import type { ReportData, ActionItem, Warning, CONFIG } from "../types/report.js";
import {
  formatDistributorName,
  formatProName,
  formatPublishingAdminName,
  formatIncomeRange,
  formatTimeReleasing,
  formatCatalogSize,
} from "./stage1-intake-processor.js";
import { formatMoney, formatEstimateRange } from "./estimator.js";

// =============================================================================
// STAGE 3: PLAN GENERATION
// =============================================================================

const SYSTEM_PROMPT = `You are a royalty consultant AI. Your job is to generate a comprehensive, personalized Royalty Health Report based on the user's intake data.

## Your Task

Generate action items and warnings based on the user's specific situation. Be direct, educational, and honest.

## Writing Style

- Clear and direct, not salesy
- Educational - explain concepts, don't assume knowledge
- Honest about uncertainty in estimates
- Encouraging but realistic
- Use second person ("you", "your")
- No emojis in body text (only ✅ ❌ ⚠️ 🔴 🛑 for status indicators)

## Critical Rules

1. NEVER tell someone to register new songs if they have a publishing admin conflict (double admin gotcha)
2. ALWAYS show estimates as ranges, never single numbers
3. ALWAYS include caveats about estimate accuracy
4. If CRITICAL gotcha is triggered, block the DIY action plan entirely
5. Personalize explanations based on what they already have vs missing
6. Use their actual artist name throughout
7. Reference their specific distributor by name
8. If they have a publishing admin, note that MLC may be covered

## Gotcha-Specific Instructions

### If Double Admin Detected:
- Show 🔴 Critical warning
- Explain the conflict situation
- DO NOT provide registration steps
- Route to consultation

### If Estate/Inherited:
- Show 🔴 Critical warning
- Explain legal requirements
- DO NOT provide DIY steps
- Route to consultation

### If Legal Dispute:
- Show 🔴 Critical warning
- Explain need for legal guidance
- DO NOT provide registration steps
- Route to consultation

### If Unconfirmed Splits:
- Show ⚠️ Warning
- Add "Document splits BEFORE registering" as Priority 1
- Provide split sheet template link

### If Missing PRO Publisher Entity:
- Show 🔴 Critical warning (they're missing 50% of PRO income!)
- Explain the 50/50 Writer/Publisher split
- Add "Create publishing entity with your PRO" as Priority 1
- Emphasize it's FREE and takes ~15 minutes

### If SoundExchange Only One Side:
- Show ⚠️ Warning
- Explain the Rights Owner / Featured Artist split
- Add "Register as [missing side] with SoundExchange" as Priority 1`;

/**
 * Generate action items based on the user's situation
 */
export function generateActionItems(stage1: Stage1Output): {
  priority1: ActionItem[];
  priority2: ActionItem[];
  priority3: ActionItem[];
} {
  const { registrations, complexityFactors, gotchasDetected, calculations, intake, followUps } =
    stage1;
  const priority1: ActionItem[] = [];
  const priority2: ActionItem[] = [];
  const priority3: ActionItem[] = [];

  let actionNumber = 1;

  // If blocked by critical gotcha, return minimal actions
  if (calculations.blockDiy) {
    return { priority1: [], priority2: [], priority3: [] };
  }

  // ==========================================================================
  // PRIORITY 1: Critical Actions
  // ==========================================================================

  // Document splits FIRST if needed
  if (
    complexityFactors.hasCowriters &&
    (followUps.f5_split_sheets_status === "no" ||
      followUps.f5_split_sheets_status === "yes_some" ||
      followUps.f5_split_sheets_status === "whats_a_split_sheet")
  ) {
    priority1.push({
      number: actionNumber++,
      title: "Document Co-Writer Splits",
      why: "Before registering any co-written songs, you need written agreement on who owns what percentage. Conflicting claims freeze royalty payments.",
      instructions: `Create a simple split sheet for each co-written song that documents:
- Song title
- Each writer's name and ownership percentage
- Get each co-writer to sign

This protects everyone and ensures clean registrations.`,
      linkText: "Download Split Sheet Template",
      linkUrl: "https://theroyaltyguy.com/split-sheet",
      timeEstimate: "15 minutes per song",
      requirements: ["Co-writer contact info", "Agreement on percentages"],
    });
  }

  // Create PRO publishing entity (missing 50% of income!)
  if (
    registrations.hasPro &&
    !registrations.hasPublishingAdmin &&
    registrations.hasProPublishingEntity === false
  ) {
    const proName = registrations.proName?.toUpperCase() || "your PRO";
    priority1.push({
      number: actionNumber++,
      title: `Create a Publishing Entity with ${proName}`,
      why: "Performance royalties are split 50/50 between Writer and Publisher. Without a publishing entity, you're only collecting the Writer half - you're missing 50% of your PRO income!",
      instructions:
        proName === "ASCAP"
          ? `1. Log into your ASCAP account
2. Go to Member Access
3. Click "Create a Publisher"
4. Choose a name for your publishing company (can be anything)
5. Complete the application
6. Once approved, register your songs under your publisher entity too

This is FREE and takes about 15 minutes.`
          : proName === "BMI"
            ? `1. Log into your BMI account
2. Go to Publisher Affiliation
3. Apply for publisher affiliation
4. Choose a name for your publishing company
5. Complete the application
6. Once approved, register your songs under your publisher entity too

This is FREE and takes about 15 minutes.`
            : `Contact ${proName} to set up a publisher entity under your account. This lets you collect both the writer and publisher share of your performance royalties.`,
      linkText: proName === "ASCAP" ? "ASCAP Publisher Info" : "BMI Publisher Info",
      linkUrl:
        proName === "ASCAP"
          ? "https://www.ascap.com/help/music-business-101/publishing"
          : "https://www.bmi.com/join#publisher",
      timeEstimate: "15-20 minutes",
      requirements: ["Your PRO login", "A name for your publishing company"],
    });
  }

  // Register with PRO if missing
  if (!registrations.hasPro) {
    priority1.push({
      number: actionNumber++,
      title: "Join a PRO (ASCAP or BMI)",
      why: "PROs collect performance royalties when your songs are played on radio, TV, in venues, or streamed. Without this, you're missing this entire royalty stream.",
      instructions: `Choose one (not both):
- **BMI**: Free for writers. More songwriter-focused.
- **ASCAP**: $50 one-time fee. Slightly faster payments.

Both are legitimate - pick whichever appeals to you.

1. Create an account on their website
2. Complete the membership application
3. Once approved, add your songs as "works"

Important: Also create a publishing entity (see instructions above) to collect both halves of your royalties.`,
      linkText: "Join BMI (Free)",
      linkUrl: "https://www.bmi.com/join",
      timeEstimate: "20 minutes to join, plus 5-10 minutes per song to register works",
      requirements: [
        "Legal name and SSN",
        "Contact information",
        "Your song titles and co-writer info",
      ],
    });
  }

  // Register with MLC if missing and no admin
  if (!registrations.hasMlc && !registrations.mlcCoveredByAdmin) {
    priority1.push({
      number: actionNumber++,
      title: "Register with The MLC",
      why: "The MLC collects mechanical royalties from US streaming services. At your income level, this could be significant money accumulating unclaimed.",
      instructions: `1. Go to themlc.com and create a free account
2. Add your songs using their ISRC codes (get these from ${formatDistributorName(registrations.distributor)})
3. Once registered, royalties will start flowing to you

Note: Unclaimed MLC royalties may be redistributed after 3 years, so register soon.`,
      linkText: "Register with The MLC",
      linkUrl: "https://www.themlc.com",
      timeEstimate: "30-60 minutes depending on catalog size",
      requirements: [
        `Catalog export from ${formatDistributorName(registrations.distributor)} with ISRC codes`,
        "Co-writer splits for any collaborative songs",
      ],
    });
  }

  // Register with SoundExchange if missing
  if (!registrations.hasSoundexchange) {
    priority1.push({
      number: actionNumber++,
      title: "Register with SoundExchange (Both Sides!)",
      why: "SoundExchange collects royalties when your recordings are played on digital radio (Pandora, SiriusXM, internet radio). SiriusXM spins are especially valuable - about $35 per spin if you own 100%.",
      instructions: `Important: You need to register as BOTH:
- **Rights Owner** (50%): You own the master recording
- **Featured Artist** (45%): You performed on the recording

Most indie artists need both registrations to collect their full 95%.

1. Go to soundexchange.com
2. Create an account as Featured Artist
3. Also register as Rights Owner
4. Add your recordings

This applies to cover songs too - you own the master royalties for YOUR recording of a cover.`,
      linkText: "Register with SoundExchange",
      linkUrl: "https://www.soundexchange.com",
      timeEstimate: "20-30 minutes",
      requirements: [
        "Legal name and SSN",
        "Your recordings/releases",
      ],
    });
  }

  // Register other side of SoundExchange
  if (registrations.hasSoundexchange && registrations.soundexchangeOneSide) {
    const missingSide =
      followUps.f18_soundexchange_registration_type === "rights_owner_only"
        ? "Featured Artist"
        : "Rights Owner";
    priority1.push({
      number: actionNumber++,
      title: `Register as ${missingSide} with SoundExchange`,
      why: `You're only registered as one side and missing roughly half your SoundExchange royalties! The ${missingSide} side gets ${missingSide === "Featured Artist" ? "45%" : "50%"} of the total.`,
      instructions: `1. Log into your SoundExchange account
2. Navigate to add a new registration type
3. Register as ${missingSide}
4. Add your recordings under this registration

This could nearly double your SoundExchange income.`,
      linkText: "SoundExchange Account",
      linkUrl: "https://www.soundexchange.com/login",
      timeEstimate: "15-20 minutes",
      requirements: ["Your SoundExchange login"],
    });
  }

  // ==========================================================================
  // PRIORITY 2: Important Actions
  // ==========================================================================

  // Verify no conflicting registrations if co-writers may have registered
  if (
    complexityFactors.hasCowriters &&
    (followUps.f6_cowriter_registered === "yes_they_registered" ||
      followUps.f6_cowriter_registered === "not_sure" ||
      followUps.f6_cowriter_registered === "some_have_some_havent")
  ) {
    priority2.push({
      number: actionNumber++,
      title: "Verify Existing Registrations (Before Registering)",
      why: "Your co-writers may have already registered these songs. If their splits don't match yours, you'll create a conflict that freezes payments.",
      instructions: `1. Search Songview (songview.com) for each co-written song
2. Check what splits are already registered
3. Contact your co-writers to confirm
4. Only register once you've verified no conflicts

If you find conflicting registrations, you'll need to work with your co-writers to resolve them before proceeding.`,
      linkText: "Search Songview",
      linkUrl: "https://songview.com",
      timeEstimate: "30-60 minutes",
      requirements: ["List of co-written songs", "Co-writer contact info"],
    });
  }

  // Check for songs by other artists
  if (
    complexityFactors.songsByOthers &&
    (followUps.f10_registered_on_others === "no" ||
      followUps.f10_registered_on_others === "not_sure")
  ) {
    priority2.push({
      number: actionNumber++,
      title: "Register as Songwriter on Other Artists' Releases",
      why: "When other artists record your songs, you're entitled to songwriter royalties from their streams. You may be missing significant income.",
      instructions: `1. List all songs recorded by other artists
2. Search Songview to see if you're listed as writer
3. If not, register yourself as songwriter with your PRO
4. Contact the other artists' teams to ensure proper crediting`,
      linkText: "Search Songview",
      linkUrl: "https://songview.com",
      timeEstimate: "1-2 hours",
      requirements: ["List of songs by other artists", "Your PRO account"],
    });
  }

  // ==========================================================================
  // PRIORITY 3: Recommended Actions
  // ==========================================================================

  // International collection if significant audience
  if (
    (followUps.f16_audience_location === "mostly_outside_us" ||
      followUps.f16_audience_location === "mix") &&
    !registrations.hasPublishingAdmin
  ) {
    priority3.push({
      number: actionNumber++,
      title: "Consider International Royalty Collection",
      why: "The MLC only collects US mechanical royalties. With significant international audience, you may have unclaimed royalties in other countries.",
      instructions: `Options:
1. **Publishing Administrator** (Songtrust, Sentric, TuneCore Publishing) - They register with foreign societies for you. Commission: 10-20% of what they collect.
2. **Direct Registration** - Register directly with foreign PROs and collection societies. More work, but no commission.

For most artists, a publishing admin is the easier choice for international collection.`,
      timeEstimate: "Research: 1 hour, Setup: 1-2 hours",
    });
  }

  // Check registrations across name variations
  if (complexityFactors.nameChanges) {
    priority3.push({
      number: actionNumber++,
      title: "Verify Registrations Under All Artist Names",
      why: "Your music is released under multiple names, so registrations may be fragmented. Searches might miss parts of your catalog.",
      instructions: `For each name variation (${complexityFactors.previousNames || "your previous names"}):
1. Search Songview
2. Check your PRO account
3. Search The MLC database
4. Check SoundExchange

Ensure all songs under all names are properly registered and linked to you.`,
      timeEstimate: "1-2 hours",
    });
  }

  return { priority1, priority2, priority3 };
}

/**
 * Generate warnings based on triggered gotchas
 */
export function generateWarnings(stage1: Stage1Output): Warning[] {
  const warnings: Warning[] = [];

  for (const gotcha of stage1.gotchasDetected) {
    const icon =
      gotcha.severity === "critical"
        ? "🔴"
        : gotcha.severity === "warning"
          ? "⚠️"
          : "ℹ️";

    warnings.push({
      icon,
      title: gotcha.title,
      description: gotcha.description,
      consequence: gotcha.consequence,
      action: gotcha.action,
    });
  }

  return warnings;
}

/**
 * Build complete report data from Stage 1 output
 */
export function buildReportData(
  stage1: Stage1Output,
  config: typeof CONFIG
): ReportData {
  const { intake, registrations, calculations, gotchasDetected } = stage1;

  const actions = generateActionItems(stage1);
  const warnings = generateWarnings(stage1);

  // Build registrations have/missing lists
  const registrationsHave: { name: string; description: string }[] = [];
  const registrationsMissing: { name: string; whatItCollects: string }[] = [];

  if (registrations.hasDistributor) {
    registrationsHave.push({
      name: `Distribution (${formatDistributorName(registrations.distributor)})`,
      description:
        "Collecting streaming income from Spotify, Apple Music, etc.",
    });
  }

  if (registrations.hasPro) {
    registrationsHave.push({
      name: `PRO (${formatProName(registrations.proName)})`,
      description: "Collecting performance royalties for your compositions",
    });
  } else {
    registrationsMissing.push({
      name: "PRO Membership",
      whatItCollects: "Performance royalties for your compositions",
    });
  }

  if (registrations.hasMlc) {
    registrationsHave.push({
      name: "The MLC",
      description: "Collecting mechanical royalties from US streaming",
    });
  } else if (registrations.mlcCoveredByAdmin) {
    registrationsHave.push({
      name: `The MLC (via ${formatPublishingAdminName(registrations.publishingAdmin)})`,
      description: "Mechanical royalties covered by your publishing admin",
    });
  } else {
    registrationsMissing.push({
      name: "The MLC",
      whatItCollects: "Mechanical royalties from US streaming",
    });
  }

  if (registrations.hasSoundexchange) {
    registrationsHave.push({
      name: "SoundExchange",
      description: "Collecting digital radio royalties for your recordings",
    });
  } else {
    registrationsMissing.push({
      name: "SoundExchange",
      whatItCollects: "Digital radio royalties (Pandora, SiriusXM, etc.)",
    });
  }

  // Build missing estimates table
  const missingEstimates: { name: string; monthly: string; total: string }[] =
    [];

  const { estimates } = calculations;

  if (estimates.pro.applicable) {
    missingEstimates.push({
      name: "PRO (Performance)",
      monthly: `~${formatMoney(estimates.pro.monthly)}`,
      total: `~${formatEstimateRange(estimates.pro.totalLow, estimates.pro.totalHigh)}`,
    });
  }

  if (estimates.proPublisherShare.applicable) {
    missingEstimates.push({
      name: "PRO Publisher Share",
      monthly: `~${formatMoney(estimates.proPublisherShare.monthly)}`,
      total: `~${formatEstimateRange(estimates.proPublisherShare.totalLow, estimates.proPublisherShare.totalHigh)}`,
    });
  }

  if (estimates.mlc.applicable) {
    missingEstimates.push({
      name: "The MLC (Mechanicals)",
      monthly: `~${formatMoney(estimates.mlc.monthly)}`,
      total: `~${formatEstimateRange(estimates.mlc.totalLow, estimates.mlc.totalHigh)}`,
    });
  }

  if (estimates.soundexchange.applicable) {
    missingEstimates.push({
      name: "SoundExchange",
      monthly: `~${formatMoney(estimates.soundexchange.monthly)}`,
      total: `~${formatEstimateRange(estimates.soundexchange.totalLow, estimates.soundexchange.totalHigh)}`,
    });
  }

  if (estimates.soundexchangeMissingSide.applicable) {
    missingEstimates.push({
      name: "SoundExchange (Missing Side)",
      monthly: `~${formatMoney(estimates.soundexchangeMissingSide.monthly)}`,
      total: `~${formatEstimateRange(estimates.soundexchangeMissingSide.totalLow, estimates.soundexchangeMissingSide.totalHigh)}`,
    });
  }

  if (estimates.songsByOthers.applicable) {
    missingEstimates.push({
      name: "Songs by Other Artists",
      monthly: `~${formatMoney(estimates.songsByOthers.monthly)}`,
      total: `~${formatEstimateRange(estimates.songsByOthers.totalLow, estimates.songsByOthers.totalHigh)}`,
    });
  }

  // Build DIY time estimates
  const diyTimeEstimates: { task: string; time: string }[] = [];

  if (!registrations.hasPro) {
    diyTimeEstimates.push({
      task: "Join PRO + register works",
      time: "1-2 hours",
    });
  }

  if (
    registrations.hasPro &&
    !registrations.hasPublishingAdmin &&
    !registrations.hasProPublishingEntity
  ) {
    diyTimeEstimates.push({
      task: "Create PRO publishing entity",
      time: "15-20 min",
    });
  }

  if (!registrations.hasMlc && !registrations.mlcCoveredByAdmin) {
    diyTimeEstimates.push({
      task: "Register with The MLC",
      time: "30-60 min",
    });
  }

  if (!registrations.hasSoundexchange) {
    diyTimeEstimates.push({
      task: "Register with SoundExchange",
      time: "20-30 min",
    });
  }

  if (stage1.complexityFactors.hasCowriters) {
    diyTimeEstimates.push({
      task: "Document co-writer splits",
      time: "1-2 hours",
    });
  }

  // Critical message for blocked situations
  let criticalMessage: string | undefined;
  if (calculations.blockDiy) {
    const criticalGotchas = gotchasDetected.filter(
      (g) => g.severity === "critical" && g.blocksDiy
    );
    if (criticalGotchas.some((g) => g.id === "estate_inherited")) {
      criticalMessage =
        "Estate and inherited catalog situations require legal documentation before any registrations can be made. Proceeding without proper authority could create legal complications.";
    } else if (criticalGotchas.some((g) => g.id === "legal_disputes")) {
      criticalMessage =
        "With potential legal disputes or contested ownership, making registrations could complicate your situation. We recommend consulting with an entertainment attorney before proceeding.";
    } else if (criticalGotchas.some((g) => g.id === "double_publishing_admin")) {
      criticalMessage =
        "You may have multiple publishing administrators with active registrations. Registering new songs could create additional conflicts. The existing situation needs to be resolved first.";
    }
  }

  const totalDiyTime =
    calculations.diyTimeHoursLow === calculations.diyTimeHoursHigh
      ? `${calculations.diyTimeHoursLow} hours`
      : `${calculations.diyTimeHoursLow}-${calculations.diyTimeHoursHigh} hours`;

  return {
    // User Data
    artistName: intake.q1_artist_name,
    legalName: intake.q2_legal_name,
    currentDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    distributor: formatDistributorName(registrations.distributor),
    monthlyIncome: formatIncomeRange(intake.q6_monthly_income),
    catalogSize: formatCatalogSize(intake.q4_catalog_size),
    timeReleasing: formatTimeReleasing(intake.q3_time_releasing),

    // Quick Summary
    score: calculations.score,
    scoreLabel: calculations.scoreLabel,
    estimateLow: formatMoney(calculations.estimates.total.totalLow),
    estimateHigh: formatMoney(calculations.estimates.total.totalHigh),
    monthlyGap: formatMoney(calculations.estimates.total.monthlyGap),
    complexity: calculations.complexity,
    recommendation: calculations.recommendation,

    // Current Setup
    registrationsHave,
    registrationsMissing,

    // Status Fields
    hasDistributor: registrations.hasDistributor,
    hasPro: registrations.hasPro,
    proName: registrations.proName ? formatProName(registrations.proName) : null,
    proWorksRegistered: null, // We don't ask this
    hasProPublishingEntity: registrations.hasProPublishingEntity,
    hasMlc: registrations.hasMlc || registrations.mlcCoveredByAdmin,
    hasPublishingAdmin: registrations.hasPublishingAdmin,
    publishingAdmin: registrations.publishingAdmin
      ? formatPublishingAdminName(registrations.publishingAdmin)
      : null,
    hasSoundexchange: registrations.hasSoundexchange,
    soundexchangeBothSides: registrations.soundexchangeBothSides,
    soundexchangeOneSide: registrations.soundexchangeOneSide,
    soundexchangeRegisteredAs: registrations.soundexchangeRegisteredAs,

    // Estimates Table
    missingEstimates,
    totalMonthlyLoss: formatMoney(calculations.estimates.total.monthlyGap),
    totalLossEstimate: formatEstimateRange(
      calculations.estimates.total.totalLow,
      calculations.estimates.total.totalHigh
    ),
    estimationExplanation:
      "Estimates are based on industry averages for your income level. Mechanical royalties are typically 10-15% of streaming income. Performance royalties vary based on radio play and venue usage. SoundExchange royalties depend on digital radio exposure. Actual amounts may vary significantly.",

    // Warnings
    hasWarnings: warnings.length > 0,
    warnings,
    isCritical: calculations.blockDiy,
    criticalMessage,

    // Action Plan
    actionsPriority1: actions.priority1,
    actionsPriority2: actions.priority2,
    actionsPriority3: actions.priority3,

    // DIY Time
    diyTimeEstimates,
    totalDiyTime,

    // Pricing
    dfyPrice: `$${config.pricing.doneForYouLow}-${config.pricing.doneForYouHigh}`,
    ongoingPrice: `$${config.pricing.ongoingLow}-${config.pricing.ongoingHigh}`,
    dfyBestFor:
      calculations.complexity === "Complex"
        ? "People with complex situations who want expert handling"
        : calculations.complexity === "Moderate"
          ? "People who value their time or want peace of mind"
          : "People who prefer to have an expert handle it",

    // Links
    consultationLink: config.links.consultation,
    dfyLink: config.links.purchaseDfy,
    fullServiceLink: config.links.purchaseFull,
    callLink: config.links.freeCall,
    splitSheetLink: config.links.splitSheetTemplate,
  };
}
