# Code Quest Frontend Sandbox

Build brick by brick from the **locked** `/progress` baseline. Stays separate from [learn-coding-through](https://github.com/gaganpasupuleti/learn-coding-through) until merge approval.

## URLs

| URL | Status |
|-----|--------|
| http://localhost:3000/progress | **Locked baseline** (static HTML) |
| http://localhost:3000/dashboard | Student home — quick actions |
| http://localhost:3000/classes | Live Classes |
| http://localhost:3000/practice-studio | Practice Studio hub |
| http://localhost:3000/materials | Study Materials |
| http://localhost:3000/assignments | Assignments |

`/` redirects to `/progress`.

## Run locally

```bash
npm install
npm run dev
```

## Build plan

- [x] Phase 0 — Locked `/progress` baseline
- [x] Phase 1 — Theme + shared shell + `/dashboard`
- [ ] Phase 2 — `/classes`, `/assignments`, `/materials`, …
- [ ] Phase 3 — Tool pages (Python Lab, SQL Studio, …)
- [ ] Phase 4 — Merge into main repo (when approved)

## Structure

```
static/progress/index.html   # LOCKED — do not redesign
src/
  components/layout/         # CodeQuestShell, Sidebar, Header, …
  components/ui/             # CQCard, CQStatCard, …
  pages/DashboardPage.jsx    # Brick 1
```

## Theme

Warm cream `#FAF3E0`, navy sidebar `#0A1020`, pastel cards, Playfair + Inter fonts. All pages must match `/progress`.
