// =============================================================================
// INTAKE FORM QUESTIONS DEFINITION
// =============================================================================

export interface QuestionOption {
  value: string;
  label: string;
  note?: string; // Extra info shown to user
}

export interface Question {
  id: string;
  question: string;
  type: "text" | "single-select" | "multi-select" | "file";
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface QuestionPage {
  title: string;
  description?: string;
  questions: Question[];
}

// =============================================================================
// PAGE 1: BASIC INFO
// =============================================================================

const PAGE_1_BASIC_INFO: QuestionPage = {
  title: "Basic Info",
  description: "Let's start with some basic information about you and your music.",
  questions: [
    {
      id: "q1_artist_name",
      question: "What is your artist/stage name?",
      type: "text",
      required: true,
      placeholder: "e.g., DJ Shadow, The Weeknd, Taylor Swift",
    },
    {
      id: "q2_legal_name",
      question: "What is your legal name?",
      type: "text",
      required: true,
      placeholder: "e.g., John Smith",
      helpText: "This is needed for royalty registrations and will be kept confidential.",
    },
    {
      id: "q3_time_releasing",
      question: "How long have you been releasing music?",
      type: "single-select",
      required: true,
      options: [
        { value: "less_than_6_months", label: "Less than 6 months" },
        { value: "6_months_to_2_years", label: "6 months to 2 years" },
        { value: "2_to_5_years", label: "2-5 years" },
        { value: "5_to_10_years", label: "5-10 years" },
        { value: "10_plus_years", label: "10+ years" },
      ],
    },
    {
      id: "q4_catalog_size",
      question: "Approximately how many songs have you released?",
      type: "single-select",
      required: true,
      options: [
        { value: "1_to_10", label: "1-10" },
        { value: "11_to_25", label: "11-25" },
        { value: "26_to_50", label: "26-50" },
        { value: "51_to_100", label: "51-100" },
        { value: "100_plus", label: "100+" },
      ],
    },
    {
      id: "q5_distributor",
      question: "What is your primary music distributor?",
      type: "single-select",
      required: true,
      options: [
        { value: "distrokid", label: "DistroKid" },
        { value: "tunecore", label: "TuneCore" },
        { value: "cd_baby", label: "CD Baby" },
        { value: "awal", label: "AWAL" },
        { value: "ditto", label: "Ditto" },
        { value: "unitedmasters", label: "UnitedMasters" },
        { value: "other", label: "Other" },
        { value: "none", label: "I don't have a distributor" },
      ],
    },
    {
      id: "q6_monthly_income",
      question: "What is your estimated monthly income from streaming/downloads?",
      type: "single-select",
      required: true,
      helpText: "This helps us estimate how much you might be missing.",
      options: [
        { value: "0_to_100", label: "$0-100" },
        { value: "100_to_500", label: "$100-500" },
        { value: "500_to_1000", label: "$500-1,000" },
        { value: "1000_to_3000", label: "$1,000-3,000" },
        { value: "3000_to_10000", label: "$3,000-10,000" },
        { value: "10000_plus", label: "$10,000+" },
      ],
    },
  ],
};

// =============================================================================
// PAGE 2: CURRENT REGISTRATIONS
// =============================================================================

const PAGE_2_REGISTRATIONS: QuestionPage = {
  title: "Current Registrations",
  description: "Now let's see what royalty registrations you already have.",
  questions: [
    {
      id: "q7_pro",
      question: "Are you a member of a PRO (Performing Rights Organization)?",
      type: "single-select",
      required: true,
      helpText: "PROs collect performance royalties when your songs are played publicly.",
      options: [
        { value: "ascap", label: "ASCAP" },
        { value: "bmi", label: "BMI" },
        { value: "sesac", label: "SESAC", note: "Invite only" },
        { value: "gmr", label: "GMR", note: "Invite only" },
        { value: "none", label: "None" },
        { value: "not_sure", label: "Not sure" },
      ],
    },
    {
      id: "q8_soundexchange",
      question: "Are you registered with SoundExchange?",
      type: "single-select",
      required: true,
      helpText: "SoundExchange collects royalties when your recordings are played on digital radio (Pandora, SiriusXM, etc.).",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure / What's that?" },
      ],
    },
    {
      id: "q9_mlc",
      question: "Are you registered with The MLC (Mechanical Licensing Collective)?",
      type: "single-select",
      required: true,
      helpText: "The MLC collects mechanical royalties from streaming services like Spotify and Apple Music.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure / What's that?" },
      ],
    },
    {
      id: "q10_publishing_admin",
      question: "Do you currently use a publishing administrator?",
      type: "single-select",
      required: true,
      helpText: "Publishing admins collect royalties on your behalf and typically take 10-20% commission.",
      options: [
        { value: "songtrust", label: "Songtrust" },
        { value: "cd_baby_pro", label: "CD Baby Pro" },
        { value: "tunecore_publishing", label: "TuneCore Publishing" },
        { value: "sentric", label: "Sentric" },
        { value: "distrokid", label: "DistroKid", note: "Note: DistroKid is NOT a publishing admin" },
        { value: "other", label: "Other" },
        { value: "none", label: "None" },
        { value: "not_sure", label: "Not sure" },
      ],
    },
    {
      id: "q11_previous_admin",
      question: "Have you EVER used a publishing administrator in the past?",
      type: "single-select",
      required: true,
      helpText: "This is important to check for potential conflicts.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure" },
      ],
    },
  ],
};

// =============================================================================
// PAGE 3: COMPLEXITY FACTORS
// =============================================================================

const PAGE_3_COMPLEXITY: QuestionPage = {
  title: "Your Situation",
  description: "A few more questions to understand your specific situation.",
  questions: [
    {
      id: "q12_has_cowriters",
      question: "Do any of your songs have co-writers (other people who helped write them)?",
      type: "single-select",
      required: true,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: "q13_changed_names",
      question: "Have you ever released music under a different artist name?",
      type: "single-select",
      required: true,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: "q14_songs_by_others",
      question: "Have any of your songs been recorded/released by other artists?",
      type: "single-select",
      required: true,
      helpText: "This means other artists performing/recording songs you wrote.",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure" },
      ],
    },
    {
      id: "q15_managing_for",
      question: "Are you managing music for someone else or an inherited catalog?",
      type: "single-select",
      required: true,
      options: [
        { value: "own_music", label: "No, this is my own music" },
        { value: "managing_for_other", label: "Yes, I'm managing for someone else" },
        { value: "inherited_catalog", label: "Yes, I inherited this catalog" },
      ],
    },
    {
      id: "q16_disputes",
      question: "Are there any legal disputes or contested ownership of your songs?",
      type: "single-select",
      required: true,
      options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes" },
        { value: "possibly", label: "Possibly / Not sure" },
      ],
    },
  ],
};

// =============================================================================
// PAGE 4: OPTIONAL UPLOAD
// =============================================================================

const PAGE_4_OPTIONAL: QuestionPage = {
  title: "Catalog Upload (Optional)",
  description: "If you have a catalog spreadsheet, uploading it helps us give more accurate recommendations.",
  questions: [
    {
      id: "q17_catalog_uploaded",
      question: "Do you have a catalog spreadsheet or list you can upload?",
      type: "file",
      required: false,
      helpText: "Accepted formats: .csv, .xlsx, .xls. This helps us understand your catalog better.",
    },
  ],
};

// =============================================================================
// ALL PAGES EXPORT
// =============================================================================

export const INTAKE_PAGES: QuestionPage[] = [
  PAGE_1_BASIC_INFO,
  PAGE_2_REGISTRATIONS,
  PAGE_3_COMPLEXITY,
  PAGE_4_OPTIONAL,
];

export const ALL_INTAKE_QUESTIONS: Question[] = INTAKE_PAGES.flatMap(
  (page) => page.questions
);

// Helper to get question by ID
export function getQuestion(id: string): Question | undefined {
  return ALL_INTAKE_QUESTIONS.find((q) => q.id === id);
}
