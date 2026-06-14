# Issue #30 — Phase 24B: Power BI DAX Practice IDE Skeleton Report

## A. Summary

Created the frontend-only DAX Practice IDE skeleton inside the Power BI Practice Ground. Students can read DAX questions, view a fictional dataset schema, write formulas in a textarea editor, and get placeholder feedback — without real DAX execution, Microsoft APIs, or backend dependencies.

## B. Files changed

| File | Purpose |
|------|---------|
| `src/App.tsx` | Maps `/practice/powerbi/dax` to `practice-powerbi`; clears Power BI sub-routes on nav away |
| `src/features/powerbi-practice/components/PowerBiPracticePage.tsx` | Internal router: landing vs DAX IDE by pathname |
| `src/features/powerbi-practice/components/PowerBiLandingPage.tsx` | DAX card opens IDE; quiz stays Available Soon |
| `src/features/powerbi-practice/components/PowerBiModuleCard.tsx` | Supports `active` modules with click handler |
| `src/features/powerbi-practice/types/powerbiPractice.types.ts` | DAX routes, question/dataset/feedback types |
| `src/features/powerbi-practice/components/DaxPracticePage.tsx` | DAX IDE orchestrator |
| `src/features/powerbi-practice/components/DaxQuestionPanel.tsx` | Question, context, objective, hints |
| `src/features/powerbi-practice/components/DaxSchemaPanel.tsx` | Fictional dataset schema tables/columns |
| `src/features/powerbi-practice/components/DaxEditorPanel.tsx` | Formula editor + Check Answer / Hint / Reset |
| `src/features/powerbi-practice/components/DaxAnswerFeedbackPanel.tsx` | Pass/fail feedback and explanation |
| `src/features/powerbi-practice/data/datasetCatalog.ts` | Fictional `retail_sales` dataset metadata |
| `src/features/powerbi-practice/data/daxQuestions.ts` | Five starter DAX questions |
| `src/features/powerbi-practice/utils/daxPlaceholderValidator.ts` | Phase 24B placeholder keyword validation |

## C. Routes

| Route | Behavior |
|-------|----------|
| `/practice/powerbi` | Power BI Practice Ground landing page |
| `/practice/powerbi/dax` | DAX Practice IDE skeleton |

Both use the `practice-powerbi` page key in `App.tsx`. Sub-route rendering is handled inside `PowerBiPracticePage`.

## D. DAX IDE UI

- **Question panel** — title, difficulty, topic, problem statement, business context, learning objective
- **Schema panel** — fictional Contoso Retail Sales tables and columns
- **Formula editor** — monospace textarea with toolbar
- **Buttons** — Check Answer, Hint (with remaining count), Reset
- **Feedback panel** — pass/fail badge, bullet feedback, explanation on success
- **Question selector** — dropdown across five starter questions
- **Back to landing** — returns to `/practice/powerbi`

## E. Sample questions

| ID | Title |
|----|-------|
| `dax-retail-total-sales` | Total Sales |
| `dax-retail-order-count` | Order Count |
| `dax-retail-average-sales` | Average Sales Amount |
| `dax-retail-total-quantity` | Total Quantity Sold |
| `dax-retail-distinct-customers` | Distinct Customers |

All questions use the fictional `retail_sales` dataset only.

## F. Validation behavior

- **Empty formula** — shows “Write a DAX formula first.”
- **Placeholder validation** — checks required DAX functions, table refs, and column refs per question rules
- **Full validator** — deferred to Phase 24C
- **No real DAX execution** — no Tabular engine, no Microsoft API

## G. Safety confirmation

Confirmed for Phase 24B:

- No Microsoft API
- No Power BI Embedded
- No Microsoft auth / login
- No secrets
- No backend changes
- No production DB
- No real student / company / banking data
- No paid APIs
- No AI / LLM

## H. Browser smoke

| Check | Result |
|-------|--------|
| `/practice/powerbi` | PASS |
| DAX card opens `/practice/powerbi/dax` | PASS |
| Direct `/practice/powerbi/dax` | PASS |
| Empty Check Answer feedback | PASS |
| Hint | PASS |
| Reset | PASS |
| `/practice/code` | PASS |
| `/practice/sql` | PASS |
| `/practice/typing` | PASS |

## I. Command results

| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `npx eslint src/features/powerbi-practice` | PASS |

## J. Deferred work

| Phase | Scope |
|-------|-------|
| 24C | Stronger DAX validation + question bank expansion (~30 questions) |
| 24D | Power BI Quiz |
| Later | Power Query, Dashboard Builder, Power BI Embedded (after licensing/cost approval) |
