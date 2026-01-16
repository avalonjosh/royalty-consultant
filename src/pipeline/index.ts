import type { IntakeForm, FollowUpAnswers } from "../types/intake.js";
import type { ReportData, CONFIG } from "../types/report.js";
import { processIntake, type Stage1Output } from "./stage1-intake-processor.js";
import {
  generateFollowUps,
  canGeneratePlan,
  getMissingInfoWarning,
  type Stage2Output,
} from "./stage2-followup-generator.js";
import { buildReportData } from "./stage3-plan-generator.js";
import { renderReport } from "./report-renderer.js";

// Re-export all pipeline modules
export * from "./gotcha-detector.js";
export * from "./estimator.js";
export * from "./stage1-intake-processor.js";
export * from "./stage2-followup-generator.js";
export * from "./stage3-plan-generator.js";
export * from "./report-renderer.js";

// =============================================================================
// MAIN PIPELINE ORCHESTRATOR
// =============================================================================

export interface PipelineResult {
  // Stage outputs
  stage1: Stage1Output;
  stage2: Stage2Output;

  // Report data and rendered output
  reportData: ReportData;
  reportMarkdown: string;

  // Metadata
  canGeneratePlan: boolean;
  missingInfoWarning: string | null;
  timestamp: string;
}

/**
 * Run the complete pipeline from intake to report
 */
export function runPipeline(
  intake: IntakeForm,
  followUps: FollowUpAnswers = {},
  config: typeof CONFIG
): PipelineResult {
  // Stage 1: Process intake
  const stage1 = processIntake(intake, followUps);

  // Stage 2: Generate follow-ups
  const stage2 = generateFollowUps(stage1);

  // Check if we can generate a plan
  const canGenerate = canGeneratePlan(stage1);
  const missingWarning = getMissingInfoWarning(stage1);

  // Stage 3: Build report data
  const reportData = buildReportData(stage1, config);

  // Render report to markdown
  const reportMarkdown = renderReport(reportData);

  return {
    stage1,
    stage2,
    reportData,
    reportMarkdown,
    canGeneratePlan: canGenerate,
    missingInfoWarning: missingWarning,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quick version - just get the report markdown
 */
export function generateReport(
  intake: IntakeForm,
  followUps: FollowUpAnswers = {},
  config: typeof CONFIG
): string {
  const result = runPipeline(intake, followUps, config);
  return result.reportMarkdown;
}

/**
 * Get follow-up questions for an intake form
 */
export function getFollowUpQuestions(intake: IntakeForm): Stage2Output {
  const stage1 = processIntake(intake, {});
  return generateFollowUps(stage1);
}

/**
 * Validate intake form data
 */
export function validateIntake(
  data: unknown
): { valid: true; data: IntakeForm } | { valid: false; errors: string[] } {
  const { IntakeFormSchema } = require("../types/intake.js");

  const result = IntakeFormSchema.safeParse(data);

  if (result.success) {
    return { valid: true, data: result.data };
  } else {
    const errors = result.error.errors.map(
      (e: any) => `${e.path.join(".")}: ${e.message}`
    );
    return { valid: false, errors };
  }
}
