# Prompt guideline map — UI upgrade

Maps [awesome-ai-dev-prompts](https://github.com/gaganpasupuleti/awesome-ai-dev-prompts) files to CodeQuest UI upgrade phases on branch `ui-upgrade-final-integration`.

## Phase 1 (shell / login — prior work)

| Prompt file | Applied to |
| --- | --- |
| `frontend/01-modern-ui-design-expert.txt` | Login page polish, shell spacing |
| `frontend/11-react-engineer.txt` | `StudentShell`, auth flow components |

## Phase 2 — Dashboard, calendar, progress

| Prompt file | Applied to |
| --- | --- |
| `frontend/03-dashboard-ui-builder.txt` | `StudentDashboardPage` card grid, metric cards |
| `frontend/11-react-engineer.txt` | Dashboard hooks, calendar/progress pages, typed navigation |
| `database/01-database-architect.txt` | Future thinking only: calendar notes table, resume persistence — **no migrations shipped** |
| `debugging-quality/04-testing-qa-automation-engineer.txt` | `npm run build`, `npm run lint`, `npm run qa:practice-smoke` |

## Phase 3 — Resume builder + QA

| Prompt file | Applied to |
| --- | --- |
| `frontend/01-modern-ui-design-expert.txt` | Resume preview typography, print layout |
| `frontend/11-react-engineer.txt` | `ResumeForm`, `ResumePreview`, localStorage layer |
| `debugging-quality/04-testing-qa-automation-engineer.txt` | Extended smoke: quiz, jobspy, practice |
| `agent-workflows/08-documentation-agent.txt` | This map, `ui-repo-review-registry.md`, PR notes |

## Workflow

1. Read the prompt file(s) for the phase before coding.
2. Implement CodeQuest-native components (no AGPL copy).
3. Log repo inspiration in `ui-repo-review-registry.md`.
4. Run the phase QA commands and note failures in PR body if pre-existing.
