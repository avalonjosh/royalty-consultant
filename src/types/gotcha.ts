import { z } from "zod";

// =============================================================================
// GOTCHA SYSTEM - Problem Detection
// =============================================================================

export const GotchaSeveritySchema = z.enum(["critical", "warning", "info"]);
export type GotchaSeverity = z.infer<typeof GotchaSeveritySchema>;

export const GotchaIdSchema = z.enum([
  "double_publishing_admin", // #1 - Critical
  "pro_admin_overlap", // #2 - Warning
  "unconfirmed_splits", // #3 - Warning
  "cowriter_already_registered", // #4 - Warning
  "distrokid_confusion", // #5 - Info
  "no_mlc", // #6 - Critical (if no admin)
  "no_soundexchange", // #7 - Critical/Warning
  "soundexchange_one_side", // #7b - Warning
  "multiple_artist_names", // #8 - Warning
  "dissolved_publishing_entity", // #9 - Warning
  "songs_by_others_unregistered", // #10 - Warning
  "estate_inherited", // #11 - Critical
  "legal_disputes", // #12 - Critical
  "high_income_no_setup", // #13 - Warning
  "new_artist", // #14 - Info
  "international_no_admin", // #15 - Warning
  "missing_pro_publisher_share", // #16 - Critical
  "missing_youtube_content_id", // #17 - Warning
  "cover_song_download_licensing", // #18 - Info
  "producer_points_undocumented", // #19 - Warning
  "cd_baby_pro_migration_gap", // #20 - Warning
  "international_audience_no_admin", // #21 - Warning
]);
export type GotchaId = z.infer<typeof GotchaIdSchema>;

export const GotchaSchema = z.object({
  id: GotchaIdSchema,
  severity: GotchaSeveritySchema,
  title: z.string(),
  description: z.string(),
  consequence: z.string(),
  action: z.string(),
  blocksDiy: z.boolean(),
});
export type Gotcha = z.infer<typeof GotchaSchema>;

export const TriggeredGotchaSchema = GotchaSchema.extend({
  triggeredBy: z.string(), // Description of what triggered this gotcha
});
export type TriggeredGotcha = z.infer<typeof TriggeredGotchaSchema>;

// =============================================================================
// GOTCHA DEFINITIONS
// =============================================================================

export const GOTCHA_DEFINITIONS: Record<GotchaId, Omit<Gotcha, "id">> = {
  double_publishing_admin: {
    severity: "critical",
    title: "Multiple Publishing Administrators Detected",
    description:
      "You have both a current publishing administrator and a previous one that may still be active.",
    consequence:
      "Both admins may be registering your songs with PROs, creating conflicting ownership claims. This can freeze your royalties until resolved.",
    action:
      "Do NOT register any new songs until this is resolved. Confirm whether your previous admin account is active, and if so, formally close it before proceeding.",
    blocksDiy: true,
  },

  pro_admin_overlap: {
    severity: "warning",
    title: "PRO + Publishing Admin Registration Overlap",
    description:
      "You registered songs with your PRO yourself, and also have a publishing administrator.",
    consequence:
      "Your admin may have re-registered the same works, creating duplicate registrations in the PRO database.",
    action:
      "Check your PRO portal for duplicate registrations. If found, work with your admin to consolidate.",
    blocksDiy: false,
  },

  unconfirmed_splits: {
    severity: "warning",
    title: "Co-Writer Splits Not Fully Documented",
    description:
      "Some or all of your co-written songs don't have signed split sheets.",
    consequence:
      "If you and your co-writers register different split percentages, total ownership could exceed 100%, which freezes royalty payments.",
    action:
      "Before registering any co-written songs, get signed split sheets from all co-writers. This should be Priority 1.",
    blocksDiy: false,
  },

  cowriter_already_registered: {
    severity: "warning",
    title: "Co-Writers May Have Already Registered",
    description:
      "Your co-writers may have already registered these songs with their PRO.",
    consequence:
      "If their registered splits don't match yours, you'll create a conflict that freezes payments.",
    action:
      "Before registering, search Songview (songview.com) for your songs and contact co-writers to verify what splits they registered.",
    blocksDiy: false,
  },

  distrokid_confusion: {
    severity: "info",
    title: "DistroKid Publishing Clarification Needed",
    description:
      "You use DistroKid and may be unclear about what publishing services they provide.",
    consequence:
      "DistroKid does NOT provide publishing administration. Many artists think they're covered when they're not.",
    action:
      "Understand that DistroKid only handles distribution and YouTube monetization. You still need separate registrations with PRO, MLC, and SoundExchange.",
    blocksDiy: false,
  },

  no_mlc: {
    severity: "critical",
    title: "Missing MLC Registration",
    description:
      "You're not registered with The MLC and don't have a publishing administrator to collect mechanical royalties.",
    consequence:
      "You're missing ~12-15% of your streaming income. These royalties are accumulating in the MLC's unmatched pool and may be redistributed to others after 3 years.",
    action:
      "Register with The MLC immediately. This is free and should be done this week.",
    blocksDiy: false,
  },

  no_soundexchange: {
    severity: "warning",
    title: "Missing SoundExchange Registration",
    description:
      "You're not registered with SoundExchange to collect digital radio royalties.",
    consequence:
      "You're missing royalties from Pandora, SiriusXM, and internet radio. SiriusXM spins are especially valuable (~$35/spin total at 100% ownership).",
    action:
      "Register with SoundExchange as BOTH Rights Owner AND Featured Artist to collect your full share.",
    blocksDiy: false,
  },

  soundexchange_one_side: {
    severity: "warning",
    title: "SoundExchange - Only Registered One Side",
    description:
      "You're registered with SoundExchange, but only as Rights Owner OR Featured Artist, not both.",
    consequence:
      "You're only collecting about half of what you're owed. The Rights Owner gets 50% and Featured Artist gets 45%.",
    action:
      "Log into SoundExchange and register as the other side to collect your full 95% (the remaining 5% goes to session musician fund).",
    blocksDiy: false,
  },

  multiple_artist_names: {
    severity: "warning",
    title: "Multiple Artist Names May Have Fragmented Registrations",
    description:
      "You've released music under multiple artist names.",
    consequence:
      "Your registrations may be fragmented across different names, and searches may miss parts of your catalog.",
    action:
      "Search all royalty databases under each name variation and verify registrations exist for songs under each name.",
    blocksDiy: false,
  },

  dissolved_publishing_entity: {
    severity: "warning",
    title: "Previous Publishing Administrator May Be Defunct",
    description:
      "Your previous publishing administrator may no longer be in business or has an unclear status.",
    consequence:
      "Your songs may still be registered under a defunct entity, and royalties could be going to an inactive account.",
    action:
      "Check your PRO account to see who is listed as publisher. If it's the old entity, you may need to file for rights reversion.",
    blocksDiy: false,
  },

  songs_by_others_unregistered: {
    severity: "warning",
    title: "Songs Recorded by Other Artists May Not Credit You",
    description:
      "Other artists have recorded your songs, but you may not be registered as the songwriter on those releases.",
    consequence:
      "You're not collecting songwriter royalties on those recordings, which could be significant if those artists have success.",
    action:
      "Identify all songs recorded by other artists and verify you're registered as songwriter on each. Contact those artists' teams to confirm.",
    blocksDiy: false,
  },

  estate_inherited: {
    severity: "critical",
    title: "Estate/Inherited Catalog Requires Special Handling",
    description:
      "You're managing music for someone else or an inherited catalog.",
    consequence:
      "Estate situations require legal authority (estate documents, power of attorney) before any changes can be made. Making registrations without proper authority could create legal problems.",
    action:
      "Do not proceed with any registrations until legal authority is established. This requires professional consultation.",
    blocksDiy: true,
  },

  legal_disputes: {
    severity: "critical",
    title: "Legal Disputes or Contested Ownership",
    description:
      "There are legal disputes or contested ownership issues with your songs.",
    consequence:
      "Registering songs during a dispute could complicate legal proceedings and potentially harm your case.",
    action:
      "Do not make any registrations until the dispute is resolved. Consult with an entertainment attorney.",
    blocksDiy: true,
  },

  high_income_no_setup: {
    severity: "warning",
    title: "High Income Without Complete Registration Setup",
    description:
      "You're earning $3,000+/month but missing multiple royalty registrations.",
    consequence:
      "At your income level, missing registrations could mean thousands of dollars lost annually.",
    action:
      "Given the amounts at stake, we strongly recommend completing all registrations immediately or using our Done-For-You service to ensure nothing is missed.",
    blocksDiy: false,
  },

  new_artist: {
    severity: "info",
    title: "New Artist - Get Set Up Right From the Start",
    description:
      "You're relatively new to releasing music with a small catalog and modest income.",
    consequence:
      "This is actually good news - you can get everything set up correctly from the beginning rather than fixing problems later.",
    action:
      "Follow the basic setup checklist to ensure you're collecting from all royalty streams as you grow.",
    blocksDiy: false,
  },

  international_no_admin: {
    severity: "warning",
    title: "Significant International Audience Without Publishing Admin",
    description:
      "You have significant audience outside the US but no publishing administrator for international collection.",
    consequence:
      "The MLC only collects US mechanical royalties. Your international streaming royalties may be going uncollected.",
    action:
      "Consider a publishing administrator (Songtrust, Sentric, TuneCore Publishing) to collect international royalties, or register directly with foreign collection societies.",
    blocksDiy: false,
  },

  missing_pro_publisher_share: {
    severity: "critical",
    title: "Missing 50% of PRO Income - No Publishing Entity",
    description:
      "You're registered with a PRO but haven't created a publishing entity to collect the publisher share of your performance royalties.",
    consequence:
      "Performance royalties are split 50/50 between Writer and Publisher. Without a publishing entity, you're only collecting the Writer half - missing 50% of your PRO income!",
    action:
      "Create a publishing entity with your PRO immediately. This is FREE and takes about 15 minutes. At ASCAP: Go to Member Access → Create a Publisher. At BMI: Apply for publisher affiliation.",
    blocksDiy: false,
  },

  missing_youtube_content_id: {
    severity: "warning",
    title: "Potentially Missing YouTube Content ID Revenue",
    description:
      "Your distributor may not include YouTube Content ID, meaning you're not collecting revenue from others using your music in their videos.",
    consequence:
      "User-generated content using your music generates ad revenue you could be collecting.",
    action:
      "Verify your distributor includes YouTube Content ID. If not, upgrade to a tier that includes it or use a separate Content ID administrator.",
    blocksDiy: false,
  },

  cover_song_download_licensing: {
    severity: "info",
    title: "Cover Song Download Licensing Reminder",
    description:
      "You've released cover songs that are available for download.",
    consequence:
      "While streaming is covered by the MLC blanket license, paid downloads still require mechanical licenses.",
    action:
      "Verify mechanical licenses were obtained for cover songs on download platforms. Most distributors handle this for a fee - check that it was included.",
    blocksDiy: false,
  },

  producer_points_undocumented: {
    severity: "warning",
    title: "Producer Agreements May Need Documentation",
    description:
      "You've worked with outside producers without clear written agreements on royalty splits.",
    consequence:
      "Unclear producer agreements can lead to disputes later about what percentage they're owed.",
    action:
      "Document producer agreements in writing. If producer has royalty points, file a Letter of Direction with SoundExchange.",
    blocksDiy: false,
  },

  cd_baby_pro_migration_gap: {
    severity: "warning",
    title: "CD Baby Pro Publishing Discontinuation",
    description:
      "You previously used CD Baby Pro Publishing, which was discontinued in 2023.",
    consequence:
      "If you weren't properly migrated or didn't set up an alternative, you may have a gap in royalty collection.",
    action:
      "Verify your songs are still registered somewhere for publishing collection. You may need to register with The MLC directly and/or get a new publishing admin.",
    blocksDiy: false,
  },

  international_audience_no_admin: {
    severity: "warning",
    title: "International Audience Without Publishing Admin",
    description:
      "You report 30%+ of your audience is outside the US but have no publishing administrator.",
    consequence:
      "The MLC only collects US mechanical royalties. International mechanical royalties are going uncollected.",
    action:
      "Consider a publishing administrator for international collection, or register directly with foreign societies.",
    blocksDiy: false,
  },
};
