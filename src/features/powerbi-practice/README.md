# Power BI Practice Ground (Issue #30 Phase 24)

Frontend-only practice hub at **`/practice/powerbi`**. Students practice Power BI concepts without Microsoft Power BI Embedded, paid APIs, or Microsoft accounts.

## Phase 24A (current)

- Landing page with module cards
- Route and student navigation wired in `App.tsx` / `StudentShell.tsx`
- **Available Soon** cards: DAX Practice, Power BI Quiz (not linked yet)
- **Coming Soon** cards: Power Query, Data Modeling, Dashboard Builder, Case Studies, Report Analysis Lab, Embedded Report Lab

## What is NOT connected

- Power BI Embedded / embed tokens
- Power BI REST API or Microsoft Graph
- Microsoft login / Entra ID
- Paid Microsoft APIs
- Backend endpoints
- Production database or real customer/banking data
- AI / LLM grading
- Real DAX / Tabular engine execution

## Planned phases

| Phase | Feature |
|-------|---------|
| 24B | DAX Practice IDE skeleton |
| 24C | DAX validation rules + question bank |
| 24D | Power BI Quiz |
| 24E | Progress tracking (localStorage) |
| Later | Power Query, modeling, dashboard builder, embedded reports |

## Testing

```bash
npm run lint
npm run build
```

Manual: open `/practice/powerbi` while logged in as a student.
