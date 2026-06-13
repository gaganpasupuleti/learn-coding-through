# SQL Practice Ground — Smoke Checklist

Use this checklist before or after deploy when SQL Practice (`/practice/sql`) was touched. All checks are manual in the browser unless noted.

## Automated pre-check (terminal)

```bash
npm run verify:sql-practice
npm run build
```

`verify:sql-practice` runs unit tests (118+) and executes all 65 `solutionSql` queries against sql.js seeds.

Optional helper:

```bash
node scripts/sql-practice-smoke-notes.mjs
```

## Manual checks

### 1. Page load and databases

- [ ] Open `/practice/sql`
- [ ] Page loads without console errors
- [ ] Object Explorer shows three databases:
  - University System — **25** questions
  - Hospital Management — **20** questions
  - Shipping & Logistics — **20** questions

### 2. Run queries (one per database)

- [ ] **University:** Run `SELECT student_name, city FROM students LIMIT 5;` — Results tab shows rows
- [ ] **Hospital:** Run `SELECT full_name FROM patients LIMIT 5;` — Results tab shows rows
- [ ] **Shipping:** Run `SELECT order_id, status FROM orders LIMIT 5;` — Results tab shows rows

### 3. Check Answer (one correct per database)

- [ ] University — pick any question, paste/run `solutionSql` from dev tools or known answer, **Check Answer** → passed
- [ ] Hospital — same
- [ ] Shipping — same

### 4. Mistakes flow

- [ ] Fail one question intentionally (wrong SELECT)
- [ ] Mistakes tab shows the failure with error type and SQL snippet
- [ ] **Retry this question** loads question + failed SQL
- [ ] **Load failed SQL** loads SQL into editor

### 5. Expected Output Preview

- [ ] Open Expected Output tab on one question per database
- [ ] Columns and row count display (or zero-row fallback message if applicable)
- [ ] Solution SQL is **not** shown in preview

### 6. Review mode and progress

- [ ] Progress analytics show passed / failed / unattempted counts
- [ ] **Retry failed**, **Review mistakes**, **Continue unfinished** buttons behave correctly
- [ ] **Practice suggested question** loads a sensible next question
- [ ] Weak areas card shows when applicable

### 7. Productivity tools

- [ ] **Format SQL** formats editor content
- [ ] SQL suggestions / autocomplete appear when typing
- [ ] **Quick Queries** insert templates
- [ ] Object Explorer **INSERT SELECT** works

### 8. Schema diagram

- [ ] Schema Diagram tab renders tables and relationships
- [ ] Full-screen schema opens and closes
- [ ] JOIN template insert from schema (if used) works

### 9. Regression guard (no SQL Practice changes)

- [ ] Open `/practice/code` — JavaScript **Run** still works

## Sign-off

| Check | Pass | Notes |
|-------|------|-------|
| Automated verify | | |
| All 3 DBs run | | |
| Check Answer ×3 | | |
| Mistakes flow | | |
| Review mode | | |
| Code Workbench | | |

**Tester:** _______________ **Date:** _______________
