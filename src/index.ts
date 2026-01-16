/**
 * Royalty Consultant - AI-Powered Royalty Health Report Generator
 *
 * Main entry point for the package.
 */

// Export all types
export * from "./types/index.js";

// Export intake form definitions
export * from "./intake/index.js";

// Export pipeline functions
export {
  runPipeline,
  generateReport,
  getFollowUpQuestions,
  validateIntake,
  type PipelineResult,
} from "./pipeline/index.js";

// Export individual pipeline stages for advanced usage
export {
  processIntake,
  type Stage1Output,
  formatDistributorName,
  formatProName,
  formatPublishingAdminName,
  formatIncomeRange,
  formatTimeReleasing,
  formatCatalogSize,
} from "./pipeline/stage1-intake-processor.js";

export {
  generateFollowUps,
  canGeneratePlan,
  getMissingInfoWarning,
  type Stage2Output,
  type FormattedQuestion,
} from "./pipeline/stage2-followup-generator.js";

export {
  generateActionItems,
  generateWarnings,
  buildReportData,
} from "./pipeline/stage3-plan-generator.js";

export { renderReport } from "./pipeline/report-renderer.js";

// Export gotcha detection
export {
  detectGotchas,
  hasCriticalGotcha,
  getGotchasBySeverity,
} from "./pipeline/gotcha-detector.js";

// Export estimation functions
export {
  calculateEstimates,
  formatMoney,
  formatEstimateRange,
} from "./pipeline/estimator.js";
