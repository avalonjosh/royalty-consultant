import { z } from "zod";

// =============================================================================
// INTAKE FORM SCHEMA (Q1-Q17)
// =============================================================================

export const TimeReleasingSchema = z.enum([
  "less_than_6_months",
  "6_months_to_2_years",
  "2_to_5_years",
  "5_to_10_years",
  "10_plus_years",
]);
export type TimeReleasing = z.infer<typeof TimeReleasingSchema>;

export const CatalogSizeSchema = z.enum([
  "1_to_10",
  "11_to_25",
  "26_to_50",
  "51_to_100",
  "100_plus",
]);
export type CatalogSize = z.infer<typeof CatalogSizeSchema>;

export const DistributorSchema = z.enum([
  "distrokid",
  "tunecore",
  "cd_baby",
  "awal",
  "ditto",
  "unitedmasters",
  "other",
  "none",
]);
export type Distributor = z.infer<typeof DistributorSchema>;

export const MonthlyIncomeSchema = z.enum([
  "0_to_100",
  "100_to_500",
  "500_to_1000",
  "1000_to_3000",
  "3000_to_10000",
  "10000_plus",
]);
export type MonthlyIncome = z.infer<typeof MonthlyIncomeSchema>;

export const PROSchema = z.enum([
  "ascap",
  "bmi",
  "sesac",
  "gmr",
  "none",
  "not_sure",
]);
export type PRO = z.infer<typeof PROSchema>;

export const YesNoNotSureSchema = z.enum(["yes", "no", "not_sure"]);
export type YesNoNotSure = z.infer<typeof YesNoNotSureSchema>;

export const YesNoSchema = z.enum(["yes", "no"]);
export type YesNo = z.infer<typeof YesNoSchema>;

export const PublishingAdminSchema = z.enum([
  "songtrust",
  "cd_baby_pro",
  "tunecore_publishing",
  "sentric",
  "distrokid", // Note: Not actually publishing admin
  "other",
  "none",
  "not_sure",
]);
export type PublishingAdmin = z.infer<typeof PublishingAdminSchema>;

export const ManagingForSchema = z.enum([
  "own_music",
  "managing_for_other",
  "inherited_catalog",
]);
export type ManagingFor = z.infer<typeof ManagingForSchema>;

export const DisputeStatusSchema = z.enum(["no", "yes", "possibly"]);
export type DisputeStatus = z.infer<typeof DisputeStatusSchema>;

// Main intake form schema
export const IntakeFormSchema = z.object({
  // Page 1: Basic Info
  q1_artist_name: z.string().min(1, "Artist name is required"),
  q2_legal_name: z.string().min(1, "Legal name is required"),
  q3_time_releasing: TimeReleasingSchema,
  q4_catalog_size: CatalogSizeSchema,
  q5_distributor: DistributorSchema,
  q6_monthly_income: MonthlyIncomeSchema,

  // Page 2: Current Registrations
  q7_pro: PROSchema,
  q8_soundexchange: YesNoNotSureSchema,
  q9_mlc: YesNoNotSureSchema,
  q10_publishing_admin: PublishingAdminSchema,
  q11_previous_admin: YesNoNotSureSchema,

  // Page 3: Complexity Factors
  q12_has_cowriters: YesNoSchema,
  q13_changed_names: YesNoSchema,
  q14_songs_by_others: YesNoNotSureSchema,
  q15_managing_for: ManagingForSchema,
  q16_disputes: DisputeStatusSchema,

  // Page 4: Optional
  q17_catalog_uploaded: z.boolean().optional(),
  q17_catalog_data: z.any().optional(), // Parsed catalog data
});

export type IntakeForm = z.infer<typeof IntakeFormSchema>;

// =============================================================================
// FOLLOW-UP QUESTIONS SCHEMA (F1-F18)
// =============================================================================

export const PreviousAdminListSchema = z.array(
  z.enum([
    "songtrust",
    "cd_baby_pro",
    "tunecore_publishing",
    "sentric",
    "other",
  ])
);

export const AdminCancelledSchema = z.enum([
  "yes_cancelled",
  "no_might_be_active",
  "not_sure",
]);

export const ProRegistrationOrderSchema = z.enum([
  "i_registered_first",
  "admin_registered",
  "both_or_not_sure",
]);

export const CowriterCountSchema = z.enum([
  "1_to_5",
  "6_to_15",
  "16_to_30",
  "most_or_all",
]);

export const SplitSheetsStatusSchema = z.enum([
  "yes_all",
  "yes_some",
  "no",
  "whats_a_split_sheet",
]);

export const CowriterRegisteredSchema = z.enum([
  "yes_they_registered",
  "no_they_havent",
  "not_sure",
  "some_have_some_havent",
]);

export const SongsByOthersCountSchema = z.enum([
  "1_to_3",
  "4_to_10",
  "10_plus",
]);

export const RegisteredOnOthersSchema = z.enum([
  "yes_all",
  "yes_some",
  "no",
  "not_sure",
]);

export const PreviousAdminStatusSchema = z.enum([
  "still_active",
  "closed",
  "not_sure",
  "acquired",
]);

export const RelationshipToOriginalSchema = z.enum([
  "family",
  "designated_rep",
  "business_partner",
  "other",
]);

export const DeceasedStatusSchema = z.enum([
  "yes",
  "no",
  "prefer_not_to_say",
]);

export const LegalAuthoritySchema = z.enum([
  "yes_have_docs",
  "in_progress",
  "no",
  "not_sure_whats_needed",
]);

export const AudienceLocationSchema = z.enum([
  "mostly_us",
  "mostly_outside_us",
  "mix",
  "not_sure",
]);

export const ProPublishingEntitySchema = z.enum([
  "yes_have_publishing_entity",
  "no_only_writer",
  "whats_a_publishing_entity",
  "not_sure",
]);

export const SoundExchangeRegistrationTypeSchema = z.enum([
  "both_rights_owner_and_featured_artist",
  "rights_owner_only",
  "featured_artist_only",
  "not_sure",
]);

// Follow-up answers schema (all optional, only filled based on triggers)
export const FollowUpAnswersSchema = z.object({
  // F1-F2: Previous publishing admin details
  f1_previous_admins: PreviousAdminListSchema.optional(),
  f2_admin_cancelled: AdminCancelledSchema.optional(),

  // F3: PRO + admin overlap
  f3_pro_registration_order: ProRegistrationOrderSchema.optional(),

  // F4-F6: Co-writer details
  f4_cowriter_count: CowriterCountSchema.optional(),
  f5_split_sheets_status: SplitSheetsStatusSchema.optional(),
  f6_cowriter_registered: CowriterRegisteredSchema.optional(),

  // F7-F8: Name change details
  f7_previous_names: z.string().optional(),
  f8_songs_per_name: z.string().optional(),

  // F9-F10: Songs by others details
  f9_songs_by_others_count: SongsByOthersCountSchema.optional(),
  f10_registered_on_others: RegisteredOnOthersSchema.optional(),

  // F11: Previous admin status
  f11_previous_admin_status: PreviousAdminStatusSchema.optional(),

  // F12-F14: Estate details
  f12_relationship: RelationshipToOriginalSchema.optional(),
  f13_deceased: DeceasedStatusSchema.optional(),
  f14_legal_authority: LegalAuthoritySchema.optional(),

  // F15: Dispute details
  f15_dispute_description: z.string().optional(),

  // F16: International audience
  f16_audience_location: AudienceLocationSchema.optional(),

  // F17: PRO publishing entity
  f17_pro_publishing_entity: ProPublishingEntitySchema.optional(),

  // F18: SoundExchange registration type
  f18_soundexchange_registration_type:
    SoundExchangeRegistrationTypeSchema.optional(),
});

export type FollowUpAnswers = z.infer<typeof FollowUpAnswersSchema>;

// =============================================================================
// COMBINED INPUT FOR PIPELINE
// =============================================================================

export const CompleteIntakeSchema = z.object({
  intake: IntakeFormSchema,
  followUps: FollowUpAnswersSchema,
});

export type CompleteIntake = z.infer<typeof CompleteIntakeSchema>;
