# Issue #30 — Phase 16: SQL Workbench cleanup and tools fix report

## A. Summary

Phase 16 polishes the SQL Practice Ground workbench at `/practice/sql` without changing SQL execution, answer checking, or backend behavior. Step 1 fixes toolbar clutter, shortcut focus safety, Reset Query output cleanup, and responsive pane defaults. Step 2 adds a beginner-friendly “How to approach this” learning guide, improves GROUP BY / HAVING / ORDER BY guidance, replaces overly complete `starterSql` values with partial scaffolds, and clarifies quick query template labels and tooltips.

## B. Files changed

| File | Reason |
|------|--------|
| `package.json` | Register `sqlQuestionLearningGuide.test.ts` in `test:sql-practice` |
| `src/features/sql-practice/components/SqlBottomPanel.tsx` | Shorter bottom-tab labels; flex-wrap to reduce horizontal noise |
| `src/features/sql-practice/components/SqlEditorPanel.tsx` | Editor-only keyboard shortcuts; suggestions vs fallback badge |
| `src/features/sql-practice/components/SqlPracticePage.tsx` | Reset Query clears results/messages/feedback; restore starter SQL |
| `src/features/sql-practice/components/SqlQuestionLearningGuide.tsx` | New learning guide card in Practice Question panel |
| `src/features/sql-practice/components/SqlQuestionPanel.tsx` | Wire learning guide below problem statement |
| `src/features/sql-practice/components/SqlQueryTemplates.tsx` | Clearer template labels and tooltip hints |
| `src/features/sql-practice/components/SqlShortcutHelp.tsx` | Optional `showSuggestions` prop for Monaco vs fallback |
| `src/features/sql-practice/components/SqlTopBar.tsx` | Two-row toolbar; remove duplicate shortcut help; responsive labels |
| `src/features/sql-practice/data/sqlQuestions.ts` | Partial starter SQL scaffolds for beginner questions |
| `src/features/sql-practice/utils/sqlPracticeLayoutStorage.ts` | Tighter default/min/max pane sizes for 1280–1440px |
| `src/features/sql-practice/utils/sqlQuestionLearningGuide.ts` | Derive concept, tables, skills, steps, mistakes from question metadata |
| `src/features/sql-practice/utils/sqlQuestionLearningGuide.test.ts` | Unit tests for learning guide derivation |

## C. SQL toolbar/tools fixes

- **Run / Check Answer / Reset Query / Format SQL / Clear Output / Reset Layout** remain in the top toolbar with clearer layout.
- Duplicate shortcut help removed from the top bar; help lives in the editor header only.
- **Reset Query** restores starter SQL and clears stale results, messages, and feedback.
- **Format SQL** and **Clear Output** unchanged in behavior; Clear uses `handleClearOutput`.
- **Suggestions badge**: Monaco shows “SQL suggestions · Ctrl + Space”; fallback textarea shows “Basic editor mode” without misleading Ctrl+Space hint.

## D. Shortcut focus safety

Global shortcuts (Run, Check, Format, Clear) fire only when focus is inside the SQL editor area (Monaco or fallback textarea). Shortcuts do not fire from the question panel, toolbar buttons, or bottom tabs. Ctrl+Space remains Monaco-native for suggestions.

## E. Auto screen adjust / responsive layout

- Default pane widths updated (left 240, right 300, bottom 200) with tighter min/max bounds.
- At **1280px** editor area ~732px; at **1440px** ~892px.
- No page-level horizontal scroll at 390–1440px in smoke tests.
- Bottom tabs use short labels and flex-wrap.

## F. Practice Question clarity

New **“How to approach this”** card shows:

- Concept and tables to use
- SQL skill tags (SELECT, WHERE, GROUP BY, HAVING, ORDER BY, JOIN, etc.)
- Numbered steps to solve
- Common mistake callout
- Does not expose solution SQL (solution remains behind Show solution)

## G. GROUP BY / HAVING / ORDER BY learning UX

Contextual guides appear when relevant:

- **GROUP BY**: non-aggregated columns must appear in GROUP BY; COUNT/SUM/AVG create summaries.
- **HAVING vs WHERE**: WHERE filters rows before grouping; HAVING filters grouped results after GROUP BY.
- **ORDER BY**: ASC (default) vs DESC; sort by the column named in the task.

## H. Starter SQL scaffolds

`starterSql` updated to partial scaffolds with comments and placeholders. **`solutionSql` unchanged** for all questions below.

| Question id | Scaffold focus |
|-------------|----------------|
| `uni-q2-hyderabad-students` | Empty WHERE value |
| `uni-q3-order-students` | Empty ORDER BY |
| `uni-q4-limit-five` | Empty LIMIT |
| `uni-q6-enrollment-count` | GROUP BY done; empty ORDER BY |
| `uni-q7-having-courses` | GROUP BY done; empty HAVING |
| `uni-q8-inner-join-courses` | Incomplete courses JOIN ON |
| `uni-q9-left-join-programs` | Incomplete LEFT JOIN ON |
| `uni-q10-avg-grade` | Empty GROUP BY |
| `uni-q11-subquery-hyderabad` | Empty WHERE city |
| `uni-q12-distinct-cities` | Empty ORDER BY |
| `hosp-q1-patient-appointments` | Empty status filter |
| `hosp-q2-doctor-departments` | Incomplete JOIN ON |
| `hosp-q4-pending-bills` | Empty status filter |
| `hosp-q5-appointments-per-doctor` | Empty GROUP BY |
| `hosp-q6-departments-by-floor` | Empty ORDER BY |
| `hosp-q7-patient-insurance` | Incomplete LEFT JOIN ON |
| `ship-q1-order-totals` | Empty numeric threshold |
| `ship-q3-shipped-orders` | Empty status filter |
| `ship-q4-carrier-shipment-count` | Empty GROUP BY |
| `ship-q5-customer-order-totals` | Empty GROUP BY |
| `ship-q6-heavy-packages` | Empty weight threshold |
| `ship-q7-unshipped-orders` | Incomplete WHERE (IS NULL) |
| `ship-q8-orders-by-date` | Empty ORDER BY |

Expansion questions (`sqlQuestionsExpansion.ts`) already used scaffolds; left unchanged.

## I. Quick query templates

Templates relabeled: **GROUP BY**, **HAVING**, **INNER JOIN**, **ORDER BY + LIMIT**. Each button has a tooltip explaining beginner intent. Templates insert starter patterns only; student edits before running.

## J. Safety confirmation

No changes to:

- Backend, sql.js engine, SQL answer checking logic, or production DB
- AI/LLM or paid APIs
- Typing Practice, Code Workbench execution, Job Portal, Power BI
- Real 3D schema or new databases
- Expected Output preview logic, Mistakes/Review mode

## K. Tests / build / lint result

- `npm run test:sql-practice` — **PASS**, 121/121
- `npm run verify:sql-practice` — **PASS**, 65/65
- `npx eslint src/features/sql-practice` — **PASS**
- `npm run build` — **PASS**

## L. Browser smoke result

- Learning guide checked on **uni-q6**, **uni-q7**, **uni-q3**, **hosp-q5**, **ship-q5** — all PASS
- University / Hospital / Shipping **Check Answer** — PASS via Use solution path
- Widths **1440 / 1280 / 1024 / 768 / 390** — no page-level horizontal scroll
- **Reset Query** — PASS (Ready, starter restored, results cleared)
- **Clear output** — Clear Output toolbar button clears results and sets Ready (same handler as Ctrl/Cmd+Shift+L). Keyboard shortcut verified in prior smoke via focus guard; Clear Output button confirms handler end-to-end

## M. Deferred items

- SQL 3D Schema + Query History Cache
- Add 10 SQL databases
- Power BI Practice Ground
- Job Portal / Spicy Jobs

## N. Risks / notes

- Existing saved layout in `localStorage` may need one **Reset Layout** click after upgrade.
- Result tables can still scroll internally; that is expected.
- Real DAX / Power BI / 3D work is not part of this PR.
- Practice Question panel is scrollable; learning guide sits below progress/filters by design.

## Test plan

- [ ] Open `/practice/sql` and confirm toolbar buttons and editor shortcuts (editor focus only)
- [ ] Run query → Ctrl/Cmd+Shift+L or Clear Output → Ready + “No results yet.”
- [ ] Reset Query after a run → starter restored, output cleared
- [ ] Select `uni-q6-enrollment-count` → starter shows `ORDER BY ;` placeholder, not full solution
- [ ] Check Answer on one question per database
- [ ] Resize to 1280px and 1440px — no page horizontal scroll
