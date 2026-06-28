# Code Quest Dashboard — Sample Storage

**Sample / storage branch only. Not for merge into `main`.**

This branch stores a standalone copy of the **new Code Quest dashboard** page and the
components it needs to render. It is a snapshot for safekeeping — no other pages,
backend, or app code are included.

## Run

```bash
cd codequest-frontend-kit
npm install
npm run dev
```

Open http://localhost:3000/dashboard

## Contents

- `src/pages/DashboardPage.jsx` — the dashboard page
- `src/components/` — layout shell, sidebar, header, panels, and UI cards used by the dashboard
- `src/config/`, `src/lib/` — navigation, routes, and API/auth helpers
- build config: `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `app.html`

The dev server proxies `/api`, `/practice`, and `/open` to the main app when it is running,
but the dashboard renders with sample data even without a backend.
