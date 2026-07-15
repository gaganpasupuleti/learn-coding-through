# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is the **roadmap.sh** frontend — an Astro 5.x SSR application with React 19, Tailwind CSS 4, and TypeScript. It is a frontend-only app; the backend API lives at `api.roadmap.sh` (not in this repo).

### Key Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (port 3000) |
| Build | `pnpm build` |
| Format | `pnpm format` (prettier --write) |
| E2E tests | `pnpm test:e2e` (Playwright) |

See `package.json` `scripts` for the full list.

### Setup (one-time)

Before the first `pnpm install`, the proprietary editor package must be aliased:

```
pnpm add @roadmapsh/editor@npm:@roadmapsh/dummy-editor -w
```

Then copy `.env.example` to `.env`. The update script handles both of these automatically.

### Gotchas

- **Stub files for removed AI components:** A prior refactor (commit `204ffb4`) removed `src/components/GenerateCourse/` and `src/hooks/use-ai-chat-scroll.tsx` but left dangling imports in `TopicDetail.tsx` and `TopicDetailAI.tsx`. Stub files (`AILimitsPopup.tsx`, `AICourseLessonChat.tsx`, `use-ai-chat-scroll.ts`) were added to restore functionality. If these are cleaned up upstream, the stubs can be removed.
- **Roadmap visualizations require the external API:** Individual roadmap pages (e.g. `/frontend`) load their interactive diagrams from `PUBLIC_API_URL` (`api.roadmap.sh` by default). The page layout and static content render without the API, but the interactive roadmap SVG/canvas will show a loading state.
- **No local database needed.** All content is in static markdown/JSON files under `src/data/`.
- **pnpm build scripts:** Native modules (`sharp`, `esbuild`, `@tailwindcss/oxide`) may show "Ignored build scripts" warnings on first install. These typically resolve via pre-built binaries and do not block `pnpm dev` or `pnpm build`.
