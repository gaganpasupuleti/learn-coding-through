/**
 * Issue #30 — SQL Practice Ground types (shell only in this phase).
 * No execution, no production DB connection.
 */

export const SQL_PRACTICE_ROUTE = '/practice/sql'

export type SqlPracticeDataset = 'sample-hr' | 'sample-sales'
export type SqlPracticeTopic = 'select' | 'joins' | 'aggregates'
export type SqlPracticeDifficulty = 'easy' | 'medium' | 'hard'
