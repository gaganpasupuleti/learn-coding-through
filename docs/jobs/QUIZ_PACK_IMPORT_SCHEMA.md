# Quiz Pack Import Schema

Phase 27A design — CSV format for importing role-preparation quiz packs linked to enriched jobs.

## Purpose

After jobs are enriched with `quiz_pack_id`, students see preparation quizzes matched to their target role. Quiz content is imported separately from job enrichment so packs can be reused across many jobs.

## File format

- **Encoding:** UTF-8
- **Delimiter:** comma (`,`)
- **Header row:** required
- **One row = one question** within a pack
- **Pack grouping:** all rows sharing the same `quiz_pack_id` belong to one pack

## Columns

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `quiz_pack_id` | yes | string | Stable pack ID, e.g. `QP_JAVA_BACKEND_FRESHER_W01` |
| `role_id` | yes | enum | Role family from `JOB_ROLE_ID_MODEL.md` |
| `role_level_id` | yes | enum | Role level ID matching the pack audience |
| `week_number` | yes | integer | 1–52; curriculum week slot |
| `question_type` | yes | enum | See question types below |
| `skill_tag` | yes | string | Skill slug for progress tracking, e.g. `java-oop` |
| `difficulty` | yes | enum | `easy` \| `medium` \| `hard` |
| `question` | yes | text | Question prompt (markdown allowed in future UI) |
| `option_a` | conditional | text | Required for MCQ and SCENARIO |
| `option_b` | conditional | text | Required for MCQ and SCENARIO |
| `option_c` | conditional | text | Required for MCQ and SCENARIO |
| `option_d` | conditional | text | Required for MCQ and SCENARIO |
| `correct_option` | conditional | enum | `A` \| `B` \| `C` \| `D` — required for MCQ and SCENARIO |
| `explanation` | yes | text | Shown after student answers |
| `workbench_type` | conditional | enum | Same as `question_type` for workbench rows; empty for MCQ |
| `starter_code_or_query` | conditional | text | Starter code (Python/Java) or SQL query template |
| `expected_output` | conditional | text | Expected stdout or query result for auto-check |
| `linked_job_ids` | no | pipe-list | Optional `job_id` values this question was derived from |

## Question types

| Type | Description | Options required | Workbench fields |
|------|-------------|------------------|------------------|
| `MCQ` | Standard multiple choice | 4 options + correct A/B/C/D | — |
| `SCENARIO` | Situational MCQ (workplace context) | 4 options + correct A/B/C/D | — |
| `SQL_WORKBENCH` | Student runs SQL against sandbox | — | starter query + expected output |
| `PYTHON_WORKBENCH` | Student runs Python code | — | starter code + expected output |
| `JAVA_WORKBENCH` | Student runs Java code | — | starter code + expected output |

## MCQ and SCENARIO rules

1. **Four options required** — `option_a` through `option_d` must all be non-empty.
2. **`correct_option` must be exactly `A`, `B`, `C`, or `D`** (uppercase).
3. **`explanation` is required** — appears after the student submits an answer; should teach, not just state the letter.
4. Options should be plausible distractors; avoid "all of the above" in v1.

## Workbench rules

1. **`starter_code_or_query`** — minimal scaffold so student can focus on the skill (e.g. SQL `SELECT` stub, Java `main` with TODO).
2. **`expected_output`** — normalized string for auto-grader comparison (trim whitespace; case policy defined in implementation phase).
3. **`explanation`** — still required; explains the solution approach after attempt.
4. **`option_*` and `correct_option`** — leave empty for workbench types.
5. **`workbench_type`** — must match `question_type` for workbench rows.

## Validation rules (preview step)

### Hard errors

- Missing `quiz_pack_id`, `question`, or `explanation`
- Unknown `question_type`
- MCQ/SCENARIO without four options or invalid `correct_option`
- Workbench type without `starter_code_or_query` or `expected_output`
- `role_level_id` not aligned with `role_id` family
- Duplicate `(quiz_pack_id, question)` text in same import batch

### Warnings

- `linked_job_ids` references unknown `job_id`
- `difficulty` = `hard` in week 1 fresher pack
- Empty `skill_tag`

## Pack naming convention

```
QP_<ROLE_FAMILY>_<LEVEL>_W<NN>
```

Examples:

- `QP_JAVA_BACKEND_FRESHER_W01` — Java Backend fresher, week 1
- `QP_DATA_ANALYST_FRESHER_W02` — Data Analyst fresher, week 2

## Linking to job enrichment

- Job enrichment CSV sets `quiz_pack_id` on each job row.
- Quiz import validates that referenced pack exists before job commit (warning if missing).
- One pack can serve many jobs with the same `role_level_id`.

## Sample data

See `sample-data/quiz-pack-import.sample.csv`:

- Pack: `QP_JAVA_BACKEND_FRESHER_W01`
- 5 MCQ + 1 JAVA_WORKBENCH + 1 SQL_WORKBENCH

## Future DB mapping (not implemented in 27A)

Planned entities: `quiz_packs`, `quiz_questions`, `quiz_pack_job_links` — columns mirror this CSV.
