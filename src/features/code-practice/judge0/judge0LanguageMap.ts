/**
 * Future-ready language map for Judge0-backed Java, C, and C++.
 *
 * Judge0 language IDs are deployment-specific. Do not treat placeholder null IDs
 * as production values — verify against the deployed Judge0 instance before Phase 10+.
 *
 * Reference: https://github.com/judge0/judge0 — see `languages` endpoint for IDs.
 */

import type { Judge0LanguageKey } from './judge0Types'

export interface Judge0LanguageConfig {
  key: Judge0LanguageKey
  label: string
  /** Judge0 `language_id` — null until verified on target deployment. */
  judge0LanguageId: number | null
  monacoLanguage: string
  /** Issue #29 workbench mode id (matches CodePracticeLanguageMode). */
  workbenchLanguageId: Judge0LanguageKey
}

/**
 * Placeholder map — IDs must be filled after deploying Judge0 and calling GET /languages.
 *
 * Common Judge0 CE examples (NOT confirmed for our deployment):
 * - Java (OpenJDK): often 62
 * - C (GCC): often 50
 * - C++ (GCC): often 54
 *
 * TODO(post-merge): Replace null with verified IDs from deployed Judge0 (separate track).
 */
export const JUDGE0_LANGUAGE_MAP: Record<Judge0LanguageKey, Judge0LanguageConfig> = {
  java: {
    key: 'java',
    label: 'Java',
    judge0LanguageId: null, // TODO: verify against deployed Judge0
    monacoLanguage: 'java',
    workbenchLanguageId: 'java',
  },
  c: {
    key: 'c',
    label: 'C',
    judge0LanguageId: null, // TODO: verify against deployed Judge0
    monacoLanguage: 'c',
    workbenchLanguageId: 'c',
  },
  cpp: {
    key: 'cpp',
    label: 'C++',
    judge0LanguageId: null, // TODO: verify against deployed Judge0
    monacoLanguage: 'cpp',
    workbenchLanguageId: 'cpp',
  },
}

export function isJudge0Language(key: string): key is Judge0LanguageKey {
  return key === 'java' || key === 'c' || key === 'cpp'
}

export function getJudge0LanguageConfig(key: Judge0LanguageKey): Judge0LanguageConfig {
  return JUDGE0_LANGUAGE_MAP[key]
}
