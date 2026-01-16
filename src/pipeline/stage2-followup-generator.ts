import type { Stage1Output } from "./stage1-intake-processor.js";
import type { FollowUpQuestion } from "../intake/follow-up-questions.js";

// =============================================================================
// STAGE 2: FOLLOW-UP QUESTION GENERATION
// =============================================================================

/**
 * Stage 2 Output: Questions to ask the user
 */
export interface Stage2Output {
  // Questions to ask
  questions: FormattedQuestion[];

  // Priority ordering
  mustAsk: FormattedQuestion[]; // Critical gotcha prevention
  shouldAsk: FormattedQuestion[]; // Warning gotcha prevention
  niceToHave: FormattedQuestion[]; // Additional context

  // Total count
  totalQuestions: number;

  // If no questions needed
  allAnswered: boolean;
}

/**
 * Formatted question for UI display
 */
export interface FormattedQuestion {
  id: string;
  question: string;
  type: "text" | "single-select" | "multi-select" | "file";
  options?: { value: string; label: string; note?: string }[];
  required: boolean;
  helpText?: string;
  placeholder?: string;
  priority: "must_ask" | "should_ask" | "nice_to_have";
  reason: string; // Why we're asking this
}

// Question IDs by priority
const MUST_ASK_IDS = [
  "f1_previous_admins",
  "f2_admin_cancelled",
  "f5_split_sheets_status",
  "f14_legal_authority",
  "f17_pro_publishing_entity",
  "f18_soundexchange_registration_type",
];

const SHOULD_ASK_IDS = [
  "f3_pro_registration_order",
  "f6_cowriter_registered",
  "f10_registered_on_others",
  "f11_previous_admin_status",
  "f12_relationship",
  "f13_deceased",
];

// Reasons for each question
const QUESTION_REASONS: Record<string, string> = {
  f1_previous_admins:
    "Need to check for potential conflicts with your current publishing setup",
  f2_admin_cancelled:
    "Important to know if there might be overlapping registrations",
  f3_pro_registration_order:
    "Helps us check for duplicate registrations in your PRO",
  f4_cowriter_count: "Helps us estimate the complexity of your catalog",
  f5_split_sheets_status:
    "Critical for avoiding frozen royalties from conflicting claims",
  f6_cowriter_registered:
    "Need to verify no conflicting registrations exist",
  f7_previous_names: "So we can check all databases for your music",
  f8_songs_per_name: "Helps understand your catalog distribution",
  f9_songs_by_others_count:
    "To estimate potential uncollected songwriter royalties",
  f10_registered_on_others:
    "Important for ensuring you're collecting what you're owed",
  f11_previous_admin_status:
    "Need to know if your previous admin might still have active registrations",
  f12_relationship: "Required for estate/inherited catalog situations",
  f13_deceased: "Affects the legal requirements for managing the catalog",
  f14_legal_authority:
    "Critical for determining if registrations can proceed",
  f15_dispute_description: "Helps us understand if DIY is appropriate",
  f16_audience_location:
    "Helps us advise on international royalty collection",
  f17_pro_publishing_entity:
    "You might be missing 50% of your performance royalties",
  f18_soundexchange_registration_type:
    "You might be missing half of your SoundExchange royalties",
};

/**
 * Generate follow-up questions based on Stage 1 output
 */
export function generateFollowUps(stage1: Stage1Output): Stage2Output {
  const { followUpsNeeded, followUps } = stage1;

  // Filter to questions that haven't been answered
  const unanswered = followUpsNeeded.filter((q) => {
    const key = q.id as keyof typeof followUps;
    return followUps[key] === undefined;
  });

  // Format questions with priority
  const formattedQuestions: FormattedQuestion[] = unanswered.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    required: q.required,
    helpText: q.helpText,
    placeholder: q.placeholder,
    priority: getPriority(q.id),
    reason: QUESTION_REASONS[q.id] || "Additional context for your report",
  }));

  // Sort by priority
  const mustAsk = formattedQuestions.filter((q) => q.priority === "must_ask");
  const shouldAsk = formattedQuestions.filter(
    (q) => q.priority === "should_ask"
  );
  const niceToHave = formattedQuestions.filter(
    (q) => q.priority === "nice_to_have"
  );

  // Limit to 8 questions max
  const allQuestions = [...mustAsk, ...shouldAsk, ...niceToHave].slice(0, 8);

  return {
    questions: allQuestions,
    mustAsk,
    shouldAsk,
    niceToHave,
    totalQuestions: allQuestions.length,
    allAnswered: allQuestions.length === 0,
  };
}

/**
 * Get priority level for a question
 */
function getPriority(
  questionId: string
): "must_ask" | "should_ask" | "nice_to_have" {
  if (MUST_ASK_IDS.includes(questionId)) return "must_ask";
  if (SHOULD_ASK_IDS.includes(questionId)) return "should_ask";
  return "nice_to_have";
}

/**
 * Check if we have enough information to generate a plan
 */
export function canGeneratePlan(stage1: Stage1Output): boolean {
  // We can always generate a plan, but it may have more caveats
  // without complete follow-up answers.
  // The critical thing is having all "must_ask" questions answered
  // if they're triggered.
  const stage2 = generateFollowUps(stage1);
  return stage2.mustAsk.length === 0;
}

/**
 * Get warning message if generating plan without all follow-ups
 */
export function getMissingInfoWarning(stage1: Stage1Output): string | null {
  const stage2 = generateFollowUps(stage1);

  if (stage2.mustAsk.length > 0) {
    return `We're missing important information that could significantly affect your report. Please answer the follow-up questions to get accurate recommendations.`;
  }

  if (stage2.shouldAsk.length > 0) {
    return `Some additional information would help us give you more accurate recommendations. Your report will include caveats where information is incomplete.`;
  }

  return null;
}
