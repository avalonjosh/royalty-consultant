import type { Question, QuestionOption } from "./questions.js";
import type { IntakeForm } from "../types/intake.js";

// =============================================================================
// FOLLOW-UP QUESTIONS DEFINITION
// =============================================================================

export interface FollowUpQuestion extends Question {
  triggeredBy: (intake: IntakeForm) => boolean;
}

// =============================================================================
// FOLLOW-UP QUESTION DEFINITIONS
// =============================================================================

export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  // F1-F2: Previous publishing admin details
  {
    id: "f1_previous_admins",
    question: "Which publishing administrator(s) did you use before?",
    type: "multi-select",
    required: true,
    options: [
      { value: "songtrust", label: "Songtrust" },
      { value: "cd_baby_pro", label: "CD Baby Pro" },
      { value: "tunecore_publishing", label: "TuneCore Publishing" },
      { value: "sentric", label: "Sentric" },
      { value: "other", label: "Other" },
    ],
    triggeredBy: (intake) => intake.q11_previous_admin === "yes",
  },
  {
    id: "f2_admin_cancelled",
    question: "Did you formally cancel or close that account?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes_cancelled", label: "Yes, I cancelled it" },
      { value: "no_might_be_active", label: "No, it might still be active" },
      { value: "not_sure", label: "Not sure" },
    ],
    triggeredBy: (intake) => intake.q11_previous_admin === "yes",
  },

  // F3: PRO + admin overlap
  {
    id: "f3_pro_registration_order",
    question:
      "Did you register your songs with your PRO yourself, or did your publishing admin do it?",
    type: "single-select",
    required: true,
    options: [
      { value: "i_registered_first", label: "I registered them myself first" },
      { value: "admin_registered", label: "My publishing admin registered them" },
      { value: "both_or_not_sure", label: "Both / Not sure" },
    ],
    triggeredBy: (intake) =>
      intake.q7_pro !== "none" &&
      intake.q7_pro !== "not_sure" &&
      intake.q10_publishing_admin !== "none" &&
      intake.q10_publishing_admin !== "not_sure" &&
      intake.q10_publishing_admin !== "distrokid",
  },

  // F4-F6: Co-writer details
  {
    id: "f4_cowriter_count",
    question: "Approximately how many of your songs have co-writers?",
    type: "single-select",
    required: true,
    options: [
      { value: "1_to_5", label: "1-5 songs" },
      { value: "6_to_15", label: "6-15 songs" },
      { value: "16_to_30", label: "16-30 songs" },
      { value: "most_or_all", label: "Most or all of my songs" },
    ],
    triggeredBy: (intake) => intake.q12_has_cowriters === "yes",
  },
  {
    id: "f5_split_sheets_status",
    question:
      "Do you have signed split sheets documenting ownership percentages for co-written songs?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes_all", label: "Yes, for all of them" },
      { value: "yes_some", label: "Yes, for some of them" },
      { value: "no", label: "No" },
      { value: "whats_a_split_sheet", label: "What's a split sheet?" },
    ],
    triggeredBy: (intake) => intake.q12_has_cowriters === "yes",
  },
  {
    id: "f6_cowriter_registered",
    question:
      "Do you know if your co-writers have registered these songs with their PRO?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes_they_registered", label: "Yes, they have registered" },
      { value: "no_they_havent", label: "No, they haven't" },
      { value: "not_sure", label: "Not sure" },
      { value: "some_have_some_havent", label: "Some have, some haven't" },
    ],
    triggeredBy: (intake) => intake.q12_has_cowriters === "yes",
  },

  // F7-F8: Name change details
  {
    id: "f7_previous_names",
    question: "What were your previous artist names?",
    type: "text",
    required: true,
    placeholder: "List all previous names, separated by commas",
    triggeredBy: (intake) => intake.q13_changed_names === "yes",
  },
  {
    id: "f8_songs_per_name",
    question: "Approximately how many songs were released under each previous name?",
    type: "text",
    required: false,
    placeholder: "e.g., 'Old Name 1: 15 songs, Old Name 2: 8 songs'",
    triggeredBy: (intake) => intake.q13_changed_names === "yes",
  },

  // F9-F10: Songs by others details
  {
    id: "f9_songs_by_others_count",
    question: "Approximately how many of your songs have been recorded by other artists?",
    type: "single-select",
    required: true,
    options: [
      { value: "1_to_3", label: "1-3 songs" },
      { value: "4_to_10", label: "4-10 songs" },
      { value: "10_plus", label: "10+ songs" },
    ],
    triggeredBy: (intake) => intake.q14_songs_by_others === "yes",
  },
  {
    id: "f10_registered_on_others",
    question: "Are you registered as the songwriter on those releases?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes_all", label: "Yes, I'm registered on all of them" },
      { value: "yes_some", label: "Yes, on some of them" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
    triggeredBy: (intake) => intake.q14_songs_by_others === "yes",
  },

  // F11: Previous admin status (if defunct)
  {
    id: "f11_previous_admin_status",
    question: "Is the publishing company you previously used still in business?",
    type: "single-select",
    required: true,
    options: [
      { value: "still_active", label: "Yes, they're still active" },
      { value: "closed", label: "No, they closed/went out of business" },
      { value: "not_sure", label: "Not sure" },
      { value: "acquired", label: "They were acquired by another company" },
    ],
    triggeredBy: (intake) => intake.q11_previous_admin === "yes",
  },

  // F12-F14: Estate details
  {
    id: "f12_relationship",
    question: "What is your relationship to the original artist/songwriter?",
    type: "single-select",
    required: true,
    options: [
      { value: "family", label: "Family member (child, spouse, sibling)" },
      { value: "designated_rep", label: "Designated representative" },
      { value: "business_partner", label: "Business partner" },
      { value: "other", label: "Other" },
    ],
    triggeredBy: (intake) =>
      intake.q15_managing_for === "managing_for_other" ||
      intake.q15_managing_for === "inherited_catalog",
  },
  {
    id: "f13_deceased",
    question: "Is the original artist/songwriter deceased?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    triggeredBy: (intake) =>
      intake.q15_managing_for === "managing_for_other" ||
      intake.q15_managing_for === "inherited_catalog",
  },
  {
    id: "f14_legal_authority",
    question:
      "Do you have legal authority (estate documents, power of attorney) to manage this catalog?",
    type: "single-select",
    required: true,
    options: [
      { value: "yes_have_docs", label: "Yes, I have documentation" },
      { value: "in_progress", label: "In progress" },
      { value: "no", label: "No" },
      { value: "not_sure_whats_needed", label: "Not sure what's needed" },
    ],
    triggeredBy: (intake) =>
      intake.q15_managing_for === "managing_for_other" ||
      intake.q15_managing_for === "inherited_catalog",
  },

  // F15: Dispute details
  {
    id: "f15_dispute_description",
    question: "Can you briefly describe the dispute or ownership question?",
    type: "text",
    required: false,
    placeholder: "Brief description - this helps us understand if DIY is appropriate",
    triggeredBy: (intake) =>
      intake.q16_disputes === "yes" || intake.q16_disputes === "possibly",
  },

  // F16: International audience (optional enhancement)
  {
    id: "f16_audience_location",
    question: "Where is most of your audience located?",
    type: "single-select",
    required: false,
    options: [
      { value: "mostly_us", label: "Mostly US" },
      { value: "mostly_outside_us", label: "Mostly outside US" },
      { value: "mix", label: "Mix of US and international" },
      { value: "not_sure", label: "Not sure" },
    ],
    // Always ask this for better international guidance
    triggeredBy: () => true,
  },

  // F17: PRO publishing entity
  {
    id: "f17_pro_publishing_entity",
    question: "Have you set up a publishing entity with your PRO?",
    type: "single-select",
    required: true,
    helpText:
      "This is different from being a member. A publishing entity lets you collect both the writer AND publisher share of your royalties.",
    options: [
      { value: "yes_have_publishing_entity", label: "Yes, I have a publishing entity" },
      { value: "no_only_writer", label: "No, I'm only registered as a writer" },
      { value: "whats_a_publishing_entity", label: "What's a publishing entity?" },
      { value: "not_sure", label: "Not sure" },
    ],
    triggeredBy: (intake) =>
      intake.q7_pro !== "none" &&
      intake.q7_pro !== "not_sure" &&
      (intake.q10_publishing_admin === "none" ||
        intake.q10_publishing_admin === "not_sure" ||
        intake.q10_publishing_admin === "distrokid"),
  },

  // F18: SoundExchange registration type
  {
    id: "f18_soundexchange_registration_type",
    question: "When you registered with SoundExchange, did you register as:",
    type: "single-select",
    required: true,
    helpText:
      "SoundExchange has two sides: Rights Owner (who owns the master) and Featured Artist (who performed). Most indie artists need both.",
    options: [
      {
        value: "both_rights_owner_and_featured_artist",
        label: "Both Rights Owner AND Featured Artist",
      },
      { value: "rights_owner_only", label: "Rights Owner only" },
      { value: "featured_artist_only", label: "Featured Artist only" },
      { value: "not_sure", label: "Not sure" },
    ],
    triggeredBy: (intake) => intake.q8_soundexchange === "yes",
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all follow-up questions that should be asked based on intake answers
 */
export function getTriggeredFollowUps(intake: IntakeForm): FollowUpQuestion[] {
  return FOLLOW_UP_QUESTIONS.filter((q) => q.triggeredBy(intake));
}

/**
 * Get follow-up question by ID
 */
export function getFollowUpQuestion(id: string): FollowUpQuestion | undefined {
  return FOLLOW_UP_QUESTIONS.find((q) => q.id === id);
}

/**
 * Check if a specific follow-up is needed
 */
export function isFollowUpNeeded(id: string, intake: IntakeForm): boolean {
  const question = getFollowUpQuestion(id);
  return question ? question.triggeredBy(intake) : false;
}
