/**
 * TDD project interfaces — drive the strict test-driven loop in
 * ProjectLearningPage when a ProjectConfig exists for the loaded slug.
 */

export interface TestCase {
  /** Optional input to inject as the test data variable. */
  input_data?: any
  /** Expected exact stdout output (trimmed). */
  expected_output?: string
  /** Fallback regex match against stdout when exact output isn't predictable. */
  validation_regex?: string
  /** Hidden test cases don't show expected values to the user. */
  hidden: boolean
}

export interface ProjectStep {
  id: string
  title: string
  /** Step instructions — Markdown supported. */
  instructions: string
  /** Starter code pre-loaded in the editor. */
  initialCode: string
  testCases: TestCase[]
  /**
   * The Python/JS function name to call with input_data when running hidden
   * test cases (e.g. "calculate_revenue"). Required when any TestCase has
   * input_data defined.
   */
  callableName?: string
  /** Optional YouTube video ID to show the "📺 Watch Step Explanation" accordion. */
  videoId?: string
}

export interface ProjectConfig {
  slug: string
  title: string
  /** Language passed to the sandbox executor ("python" | "javascript" | "sql"). */
  language: string
  roleId: string
  steps: ProjectStep[]
}
