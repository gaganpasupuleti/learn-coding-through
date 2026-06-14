# CodeQuest — Career Acceleration Platform

> **End-to-end, deployment-ready learning platform** built with React, TypeScript, and a FastAPI backend. Students discover career paths, build portfolio projects, practice coding, and take quizzes — all within a role-based portal experience.

---

**Launch checklist:** see [docs/LAUNCH.md](docs/LAUNCH.md) for environment matrix, smoke tests, polish status, and known limitations.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started (Local Dev)](#getting-started-local-dev)
5. [Environment Variables](#environment-variables)
6. [Architecture Overview](#architecture-overview)
7. [Demo Mode](#demo-mode)
8. [Deployment](#deployment)
9. [Health Check & Verification](#health-check--verification)
10. [License](#license)

---

## Project Overview

CodeQuest is a full-stack career-acceleration platform that guides learners from skill foundation through job readiness via structured role paths. The platform offers:

- **Student Portal** — personalized learning shell with projects, quizzes, practice modules, and a Career Mapper.
- **Admin Portal** — operations dashboard for faculty and program managers: student metrics, batch management, class insights, and a job placement portal.
- **Shared Login** — one login page routes users to the correct portal based on their role (`student` / `admin` / `demo`).
- **Career Mapper (Roadmapper)** — publicly browsable career path explorer with a per-role 4-month syllabus timeline. Free sign-up CTA converts visitors into learners.
- **Demo Mode** — try the platform without creating a full account; limited to 2 projects + 2 quizzes.

---

## Features

| Feature | Description |
|---|---|
| Role-based portals | Student shell and Admin shell with shared login |
| Student dashboard | Daily view: today’s class, deadlines, practice streak, SQL/code/typing progress, job & resume readiness |
| Student calendar | Month view with class notes, assignments, and resources (demo data where API pending) |
| Progress tracker | Course, quiz, project, and mistake review across practice modules |
| Resume builder | ATS-friendly template with local save and readiness score |
| Route guards | Admin routes protected; demo users restricted by access rules |
| Career Mapper | Public browsing with "Sign up free" CTA; full features after login |
| SyllabusTimeline | Per-role, config-driven 4-month timeline/stepper (Month 1–4) |
| Demo limits | 2 projects + 2 quizzes allowed; locked overlay for additional items |
| V1 / V2 toggle | Side-by-side experience version comparison |
| Palette switching | Executive / Sapphire / Royal theme presets |
| Code execution | Live code runner via backend sandboxed executor |
| Admin dashboard | Student metrics, batch timings, class detail, job portal |

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite (build tooling)
- Tailwind CSS v4 + Radix UI (component primitives)
- Phosphor Icons + Lucide React
- Sonner (toasts), Recharts (charts), Framer Motion (animations)
- TanStack Query for async state

**Backend** (see `backend/` directory)
- Python + FastAPI
- PostgreSQL (via SQLAlchemy)
- JWT authentication
- Docker / Railway compatible

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js >= 18
- npm >= 9
- Python >= 3.11 (for backend)
- PostgreSQL (local or via Docker)

### 1. Clone and install frontend dependencies

```bash
git clone https://github.com/gaganpasupuleti/learn-coding-through.git
cd learn-coding-through
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

### 3. Start the backend (optional for demo mode)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> The frontend falls back gracefully when the backend is unavailable — demo mode and UI browsing work without a backend connection.

### 4. Start the frontend dev server

```bash
# Back in the root directory
npm run dev
```

Open http://localhost:5000 in your browser.

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for a template):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL for backend API requests. Set to `http://localhost:8000/api/v1` for local dev. |
| `VITE_API_URL` | *(empty)* | Legacy URL used by the code execution endpoint. Set to `http://localhost:8000` if running backend locally. |
| `PORT` | `5000` | Frontend dev server port. |

**Backend** (set in `backend/.env` or as Railway environment variables):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/codequest` |
| `SECRET_KEY` | JWT signing secret (use a long random string in production) |
| `ALGORITHM` | JWT algorithm, default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes, default `60` |

---

## Architecture Overview

```
src/
├── App.tsx                    # Root: auth routing (login → student/admin shell)
├── lib/
│   ├── auth.ts                # Auth utilities: token/user storage, role detection
│   ├── demo-limits.ts         # Demo access rules (2 projects + 2 quizzes)
│   ├── syllabus-config.ts     # Config-driven 4-month syllabus per career role
│   ├── roadmapper-api.ts      # Backend API: roles, roadmap, progress, login/register
│   ├── api.ts                 # Backend API: admin operations, code execution
│   ├── projects.ts            # Project definitions
│   └── quizzes.ts             # Quiz definitions
├── components/
│   ├── SyllabusTimeline.tsx   # Reusable Month 1-4 timeline/stepper component
│   ├── shells/
│   │   ├── StudentShell.tsx   # Student portal navigation wrapper
│   │   └── AdminShell.tsx     # Admin portal navigation wrapper
│   └── pages/
│       ├── LoginPage.tsx      # Shared login / signup / demo access page
│       ├── LandingPageV2.tsx  # Student home (V2)
│       ├── RoadmapperPageV2.tsx # Career Mapper with SyllabusTimeline + CTA
│       ├── ProjectsPageV2.tsx # Projects with demo limit enforcement
│       ├── QuizPageV2.tsx     # Quizzes with demo limit enforcement
│       └── AdminPageV2.tsx    # Admin dashboard (V2)
```

### Auth Flow

```
User visits app
│
├── No stored session → LoginPage
│   ├── Log In  → fetch /auth/me → store user → route by role
│   ├── Sign Up → register + login → mark demo flag → student portal
│   └── Demo    → create demo session (no API) → student portal
│
├── role === 'admin' → AdminShell + AdminPage
├── role === 'student' / 'demo' → StudentShell + student pages
└── Browse Publicly (no login) → RoadmapperPageV2 only
```

---

## Demo Mode

Demo mode lets new visitors explore the platform without creating a full account.

**Access rules:**
- Users can browse all career paths and the 4-month syllabus for free.
- Users can start **any 2 projects** of their choice.
- Users can attempt **any 2 quizzes** of their choice.
- Already-started projects/quizzes do **not** consume additional quota on revisit.
- Additional items beyond the limit show a **locked overlay** with an upgrade CTA.

**Implementation:** Demo state is stored client-side in `localStorage` (keys: `demo-started-projects`, `demo-attempted-quizzes`). This abstraction is in `src/lib/demo-limits.ts` — replace the `localStorage` calls with API calls to enforce limits server-side when ready.

**Upgrade path:** Users can sign up for a full account from any locked item overlay or via the navigation bar.

---

## Deployment

### Railway (recommended)

The project includes a `railway.toml` and `docker-compose.yml` for one-click Railway deployments.

1. Connect your GitHub repo to Railway.
2. Set the environment variables listed above in Railway's dashboard.
3. Railway will detect the `railway.toml` and deploy both frontend and backend automatically.

### Manual / Static Hosting (Frontend only)

```bash
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

Set `VITE_API_BASE_URL` to point to your deployed backend URL.

### Docker (Full Stack)

```bash
docker-compose up --build
```

This starts both the frontend and backend with the configuration defined in `docker-compose.yml`.

---

## Health Check & Verification

After deployment, verify the following:

| Check | Expected |
|---|---|
| `GET /` (frontend) | Login page renders |
| `GET /api/v1/roles` | Returns JSON array of career roles |
| `POST /api/v1/auth/register` | Creates a new user account |
| `POST /api/v1/auth/login` | Returns `{ access_token, token_type }` |
| `GET /api/v1/auth/me` (with Bearer token) | Returns `{ id, email, full_name, role }` |
| `GET /api/v1/roadmap/:roleId` (with Bearer token) | Returns roadmap stages |
| Demo mode | Login page → "Try Demo" → 2 projects accessible, 3rd shows lock overlay |
| Admin role | Log in with admin account → Admin shell shown, not student shell |

---

## License

MIT © GitHub, Inc. (Spark Template base) and project contributors.
